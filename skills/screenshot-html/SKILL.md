---
name: screenshot-html
description: Capture PNG screenshots of local HTML files using Playwright. Use this skill when the user has generated HTML artifacts, components, or design previews and wants to capture screenshots of them. Triggers on phrases like "screenshot these", "capture the artifacts", "take screenshots of the HTML", "save images of these pages", or after generating HTML files if visual verification is needed.
---

# Skill: screenshot-html

Headless Chromium screenshots of every `*.html` file in a directory tree, via Playwright.

## When to use

- User just generated HTML artifacts (design previews, component galleries, slide decks, brand showcases) and wants PNGs.
- Visual diff or sanity-check is needed on rendered output, not source.
- Producing thumbnails to attach to a write-up, social post, or PR.

Skip if the artifact is already an image, or if the user wants live interactive review (open in a browser instead).

## How to run

From the repo root:

```bash
node scripts/screenshot-html.mjs <dir> [--output <dir>] [--width <px>]
```

Flags:

- `<dir>` (positional, default `.`): directory to scan recursively for `*.html`.
- `--output <dir>` (default `<dir>/screenshots`): where PNGs are written. Tree shape mirrors input — `foo/bar.html` → `<output>/foo/bar.png`.
- `--width <px>` (default `1440`): viewport width. Height auto-extends because screenshots are full-page. Use `375` for mobile, `1080` for square social, etc.

The script uses `deviceScaleFactor: 2` so PNGs are 2× density (sharp on retina, suitable for export).

Hidden directories and `node_modules` are skipped.

## Prerequisites

Playwright must be installed in the working directory (or globally accessible to Node):

```bash
npm install playwright && npx playwright install chromium
```

If Playwright isn't installed, the script prints that exact hint and exits 1.

## Script location

`scripts/screenshot-html.mjs` at the repo root. Always invoke with `node scripts/screenshot-html.mjs ...` from a directory where Playwright resolves — typically the project the HTML was generated in, not this config repo.

## Output and verification

- Each processed file logs as `  <relative-input-path> -> <relative-output-path>`.
- A summary line at the top lists count and absolute output dir.
- After it finishes, `ls <output>` should show one `.png` per input `.html`, in the same nested layout.
- Failures (page errors, broken file://) print `FAILED: <reason>` per file but don't abort the run — check the log.

## Common patterns

- **Default sweep:** `node scripts/screenshot-html.mjs ./design`
- **Mobile widths:** `node scripts/screenshot-html.mjs ./design/link-in-bio --width 375`
- **Custom output dir:** `node scripts/screenshot-html.mjs ./out --output ./previews`
- **Single file:** point `<dir>` at the parent folder; the script will still only process that one HTML if it's the only one.
