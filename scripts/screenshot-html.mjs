#!/usr/bin/env node
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, resolve, relative, dirname, basename, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { argv, exit, stderr, stdout } from 'node:process';

const PLAYWRIGHT_HINT =
  'Playwright not installed. Run:\n  npm install playwright && npx playwright install chromium';

function parseArgs(args) {
  const opts = { dir: '.', output: null, width: 1440 };
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      opts.output = args[i + 1];
      i += 1;
    } else if (arg === '--width' || arg === '-w') {
      opts.width = Number.parseInt(args[i + 1], 10);
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      stdout.write(
        'Usage: node scripts/screenshot-html.mjs <dir> [--output <dir>] [--width <px>]\n',
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
  return opts;
}

async function findHtmlFiles(root) {
  const out = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
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
    viewport: { width: opts.width, height: 900 },
    deviceScaleFactor: 2,
  });

  try {
    for (const file of files) {
      const rel = relative(inputDir, file);
      const pngRel = rel.replace(/\.html$/i, '.png');
      const outPath = join(outputDir, pngRel);
      await mkdir(dirname(outPath), { recursive: true });

      const page = await context.newPage();
      try {
        await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });
        await page.screenshot({ path: outPath, fullPage: true });
        stdout.write(`  ${rel} -> ${relative(inputDir, outPath)}\n`);
      } catch (err) {
        stderr.write(`  ${rel} FAILED: ${err.message}\n`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((err) => {
  stderr.write(`${err.stack ?? err.message ?? err}\n`);
  exit(1);
});
