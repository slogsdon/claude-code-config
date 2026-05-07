#!/usr/bin/env node
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, resolve, relative, dirname, extname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { argv, exit, stderr, stdout } from 'node:process';

const PLAYWRIGHT_HINT =
  'Playwright not installed. Run:\n  npm install playwright && npx playwright install chromium';

// Selector for design-* skill artifact containers. Covers:
//   .canvas              → most pixel-exact artifact wrappers (linkedin/instagram/twitter/youtube/og/hero/etc.)
//   [class*="canvas-"]   → variants like canvas-front/back, canvas-main/compact, canvas-full/safe,
//                          canvas-offline, canvas-panel, canvas-og, canvas-hero, canvas-square, canvas-story
//   .scene               → hash-routed scenes inside stream-overlay / OBS scene-pack files
const ARTIFACT_SELECTOR = '.canvas, [class*="canvas-"], .scene';

function parseArgs(args) {
  const opts = { dir: '.', output: null, width: 1920, height: 1080, fullPage: false };
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      opts.output = args[i + 1];
      i += 1;
    } else if (arg === '--width' || arg === '-w') {
      opts.width = Number.parseInt(args[i + 1], 10);
      i += 1;
    } else if (arg === '--height') {
      opts.height = Number.parseInt(args[i + 1], 10);
      i += 1;
    } else if (arg === '--full-page') {
      opts.fullPage = true;
    } else if (arg === '--help' || arg === '-h') {
      stdout.write(
        'Usage: node scripts/screenshot-html.mjs <dir> [--output <dir>] [--width <px>] [--height <px>] [--full-page]\n',
      );
      exit(0);
    } else if (arg.startsWith('--')) {
      stderr.write(`Unknown flag: ${arg}\n`);
      exit(2);
    } else {
      positional.push(arg);
    }
  }
  if (positional[0]) opts.dir = positional[0];
  if (!Number.isFinite(opts.width) || opts.width <= 0) {
    stderr.write('--width must be a positive integer\n');
    exit(2);
  }
  if (!Number.isFinite(opts.height) || opts.height <= 0) {
    stderr.write('--height must be a positive integer\n');
    exit(2);
  }
  return opts;
}

async function findHtmlFiles(root) {
  const out = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'screenshots') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.html') {
        out.push(full);
      }
    }
  }
  await walk(root);
  return out.sort();
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Decide a short slug for an artifact target, preferring id, then a meaningful class token.
async function deriveTargetMetadata(handle) {
  return handle.evaluate((el) => {
    const id = el.id || '';
    const classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    // Hash-routed scenes: prefer the id (e.g. scene-starting) so the filename is meaningful.
    if (id && id.startsWith('scene-')) {
      return { id, classes, hint: id, isScene: true, sceneName: id.slice('scene-'.length) };
    }
    // Otherwise, prefer the most specific canvas-related class token.
    const canvasClasses = classes.filter((c) => c === 'canvas' || c.startsWith('canvas-'));
    let hint = '';
    if (canvasClasses.length > 0) {
      // Prefer a modifier (canvas-front, canvas-og) over the generic 'canvas'.
      const modifier = canvasClasses.find((c) => c !== 'canvas');
      hint = modifier || canvasClasses[0];
    } else {
      hint = id || classes[0] || 'artifact';
    }
    return { id, classes, hint, isScene: false, sceneName: null };
  });
}

async function main() {
  const opts = parseArgs(argv.slice(2));
  const inputDir = resolve(opts.dir);

  let inputStat;
  try {
    inputStat = await stat(inputDir);
  } catch {
    stderr.write(`Input directory not found: ${inputDir}\n`);
    exit(1);
  }
  if (!inputStat.isDirectory()) {
    stderr.write(`Input path is not a directory: ${inputDir}\n`);
    exit(1);
  }

  const outputDir = resolve(opts.output ?? join(inputDir, 'screenshots'));
  await mkdir(outputDir, { recursive: true });

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    stderr.write(`${PLAYWRIGHT_HINT}\n`);
    exit(1);
  }

  const files = await findHtmlFiles(inputDir);
  if (files.length === 0) {
    stdout.write(`No .html files found under ${inputDir}\n`);
    return;
  }

  stdout.write(`Found ${files.length} HTML file(s). Output: ${outputDir}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: opts.width, height: opts.height },
    deviceScaleFactor: 1,
  });

  let totalShots = 0;
  let totalFallbacks = 0;

  try {
    for (const file of files) {
      const rel = relative(inputDir, file);
      const stem = basename(file).replace(/\.html$/i, '');
      const fileUrl = pathToFileURL(file).href;

      const page = await context.newPage();
      try {
        await page.goto(fileUrl, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});

        const handles = await page.locator(ARTIFACT_SELECTOR).elementHandles();

        // Drop nested matches.
        const topLevelHandles = [];
        for (const handle of handles) {
          const isNested = await handle.evaluate((el, sel) => {
            let p = el.parentElement;
            while (p) {
              if (p.matches(sel)) return true;
              p = p.parentElement;
            }
            return false;
          }, ARTIFACT_SELECTOR);
          if (!isNested) topLevelHandles.push(handle);
          else await handle.dispose();
        }

        if (opts.fullPage || topLevelHandles.length === 0) {
          const outName = `${stem}.png`;
          const outPath = join(outputDir, outName);
          await mkdir(dirname(outPath), { recursive: true });
          await page.screenshot({ path: outPath, fullPage: true });
          totalShots += 1;
          if (!opts.fullPage) totalFallbacks += 1;
          stdout.write(`  ${rel} → ${outName} (full-page${opts.fullPage ? '' : ', fallback'})\n`);
          for (const h of topLevelHandles) await h.dispose();
          continue;
        }

        // Build metadata for each target so we can disambiguate filenames.
        const targets = [];
        for (const handle of topLevelHandles) {
          const meta = await deriveTargetMetadata(handle);
          targets.push({ handle, meta });
        }

        // Resolve filename collisions by appending an index when slugs repeat.
        const slugCounts = new Map();
        for (const t of targets) {
          const slug = slugify(t.meta.hint || 'artifact');
          slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
        }
        const slugSeen = new Map();

        for (const { handle, meta } of targets) {
          const baseSlug = slugify(meta.hint || 'artifact');
          const total = slugCounts.get(baseSlug) || 1;
          const seen = (slugSeen.get(baseSlug) || 0) + 1;
          slugSeen.set(baseSlug, seen);

          const isOnlyTarget = targets.length === 1;
          // If there's only one target and it's a generic .canvas, use just the stem.
          let outName;
          if (isOnlyTarget && (baseSlug === 'canvas' || baseSlug === '')) {
            outName = `${stem}.png`;
          } else if (total > 1) {
            outName = `${stem}--${baseSlug}-${seen}.png`;
          } else {
            outName = `${stem}--${baseSlug}.png`;
          }
          const outPath = join(outputDir, outName);
          await mkdir(dirname(outPath), { recursive: true });

          try {
            // Hash-routed scenes: navigate to the matching hash so .is-active applies
            // before taking the shot. The page's hashchange handler does the rest.
            if (meta.isScene && meta.sceneName) {
              await page.evaluate((name) => {
                window.location.hash = '#' + name;
              }, meta.sceneName);
              await page.waitForTimeout(50);
            }

            const box = await handle.boundingBox();
            if (!box || box.width === 0 || box.height === 0) {
              stderr.write(`  ${rel} ✗ ${outName} (target has no layout, skipped)\n`);
              continue;
            }
            await handle.screenshot({ path: outPath });
            totalShots += 1;
            stdout.write(`  ${rel} → ${outName} (${Math.round(box.width)}×${Math.round(box.height)})\n`);
          } catch (err) {
            stderr.write(`  ${rel} ✗ ${outName} FAILED: ${err.message}\n`);
          } finally {
            await handle.dispose();
          }
        }
      } catch (err) {
        stderr.write(`  ${rel} FAILED to load: ${err.message}\n`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  stdout.write(`\nDone. ${totalShots} screenshot(s)`);
  if (totalFallbacks > 0) stdout.write(` (${totalFallbacks} full-page fallback(s))`);
  stdout.write('.\n');
}

main().catch((err) => {
  stderr.write(`${err.stack ?? err.message ?? err}\n`);
  exit(1);
});
