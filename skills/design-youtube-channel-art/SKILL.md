---
name: design-youtube-channel-art
description: Generate a YouTube channel banner — pixel-exact 2560×1440 full canvas + 1546×423 safe-zone preview canvas in a single HTML file. The full banner bleeds to the edges (TV display uses it all); the safe zone (1546×423 centered) is the cross-device area where critical content MUST sit. Reads ./design/<brand-slug>/DESIGN.md, tokens.css, and components.html. Triggers include "youtube banner", "youtube channel art", "channel banner", "/youtube-channel-art".
---

# Skill: youtube-channel-art

Produces a single self-contained HTML file containing **two pixel-exact canvases**:

1. **Full banner** (2560×1440) — the TV-display-ready full asset that uploads to YouTube
2. **Safe zone preview** (1546×423) — what mobile + desktop visitors actually see; ALL critical content must sit inside this zone

YouTube renders the same banner asset at vastly different aspect ratios across devices (TV uses the full 2560×1440; desktop crops to a wide letterbox; mobile crops to a tighter rectangle). The safe zone is the only region guaranteed visible everywhere. Brand mark + tagline live in the safe zone; the wider canvas extends with breathing room (or texture, or extension of brand surface) that TV viewers see.

## When to use

- User runs a YouTube channel and needs banner art that works across TV / desktop / mobile
- A `DESIGN.md` exists for the brand

## Inputs

- **Required:** brand slug, channel name (or wordmark text)
- **Required:** tagline (1 line, max ~10 words; sentence-case ending in period per brand voice)
- **Optional:** category labels (e.g. "field notes · payments · platforms"), social handle for footer
- **Optional:** secondary cue (e.g. upload schedule "new every Tuesday.")

## Output

`./design/<brand-slug>/artifacts/youtube-channel-art-YYYY-MM-DD-<slug>.html`

## Steps

### 1. Verify brand exists

```bash
test -f ./design/<brand-slug>/tokens.css
```

### 2. Gather the brief

Ask in one message:

```
1. Channel name / wordmark
2. Tagline — 1 line, max 10 words, sentence-case ending in period
3. Optional category strip — short topic labels separated by mid-dot
4. Optional secondary cue — upload schedule or call-to-action
5. Social handle (optional, footer position)
```

If the user gives 11+ words for the tagline, push back: "It needs to fit in the 1546×423 safe zone with breathing room. What's the line that lands?" Don't proceed until they agree.

### 3. Pick variation — apply CONSISTENTLY to both canvases

The full banner and safe zone preview must show the same content treatment — they're the same asset rendered at different framings. Pick ONE:

- `chrome-led` — wordmark + tagline + small meta strip. Brand-earned for editorial channels (Shane's instinct).
- `inverse-text` — full canvas dark inversion (canonical v2 feature treatment). Wordmark in cream on ink.
- `type-only` — wordmark at max scale, tagline below; no chrome.
- `object-of-content` — banner looks like a fragment of the channel's actual content (e.g. a working-notes index excerpt; a transcript line)

The wider 2560×1440 canvas EXTENDS the safe zone composition with breathing room — typically empty cream space or a subtle column rule pattern. It does NOT add additional content beyond the safe zone. The reason: TV viewers see the empty bleed area; it should feel intentional (negative space), not like a missed opportunity.

### 4. Generate the HTML

Template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><Brand> — YouTube banner</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=<families>&display=swap">
<style>
/* Embed tokens.css verbatim */
<contents of tokens.css>

html, body { margin: 0; padding: 0; background: #2a2a2a; min-height: 100vh; font-family: var(--type-sans-family); }
body { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px 0; }

.canvas-label { font-family: var(--type-mono-family); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.7); align-self: center; }

/* Full banner — 2560×1440 (the actual upload) */
.canvas-full {
  width: 2560px; height: 1440px;
  background: var(--color-surface);
  color: var(--color-ink);
  position: relative; overflow: hidden;
  display: grid;
  place-items: center;
  /* Show a faint dashed outline of the safe zone for design verification — DO NOT bake into final */
}
.canvas-full::after {
  content: "";
  position: absolute;
  width: 1546px; height: 423px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  border: 1px dashed var(--color-rule);
  pointer-events: none;
  /* Comment this out for the final upload — it's a design guide */
}

/* Safe zone preview — 1546×423 (what mobile + desktop see) */
.canvas-safe {
  width: 1546px; height: 423px;
  background: var(--color-surface);
  color: var(--color-ink);
  position: relative; overflow: hidden;
  padding: 32px 64px;
  box-sizing: border-box;
  display: grid;
  /* layout per archetype */
}

/* Wordmark at YouTube banner scale */
.banner-wordmark {
  font-family: var(--type-display-family);
  font-weight: 600;
  font-size: 96px;
  letter-spacing: -0.012em;
  line-height: 1.0;
  margin: 0;
  color: var(--color-ink);
}
.banner-tagline {
  font-family: var(--type-display-family);
  font-style: italic;
  font-weight: 400;
  font-size: 28px;
  line-height: 1.3;
  letter-spacing: -0.005em;
  margin: 16px 0 0;
  color: var(--color-ink-soft);
}
.banner-meta {
  font-family: var(--type-mono-family);
  font-size: 14px; letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}

@page { size: 2560px 1440px; margin: 0; }
</style>
</head>
<body>
<!--
Variation choices:
  archetype: <picked> (consistent across both canvases)
-->

<span class="canvas-label">→ FULL BANNER · 2560×1440 · the actual upload (TV display sees full; safe zone outlined)</span>
<article class="canvas-full">
  <!-- composition centered in the safe zone; the surrounding bleed is intentional negative space -->
  <div class="canvas-safe-content">
    <!-- wordmark + tagline + meta -->
  </div>
</article>

<span class="canvas-label">→ SAFE ZONE PREVIEW · 1546×423 · what mobile + desktop visitors see (must hold all critical content)</span>
<article class="canvas-safe">
  <!-- same composition, framed -->
</article>

<!--
EXPORT NOTES:
  - Upload the 2560×1440 PNG to YouTube → Customization → Branding → Banner image
  - REMOVE the .canvas-full::after dashed safe-zone outline before exporting (it's a design guide only)
  - YouTube auto-crops per device. Verify your safe-zone preview holds the brand identity.
-->
</body>
</html>
```

### 5. Verify

- [ ] Full canvas is exactly 2560×1440
- [ ] Safe zone preview is exactly 1546×423
- [ ] All critical content (wordmark, tagline, meta) sits inside the safe zone region
- [ ] Wider canvas treatment is INTENTIONAL negative space — not duplicated content, not random decoration
- [ ] Safe-zone outline indicator (the dashed `::after`) is present in the file but commented out / `display:none` for final export
- [ ] Architecture archetype documented and applied consistently to both canvases
- [ ] **Read `../design-anti-patterns.md` and verify the artifact violates none of its rules.** Pay special attention to sections 1 (no decorative orbs / patterns / icons), 2 (no italics-emphasis OR single-word color emphasis as default), and 4 (architecture must reach inner blocks)
- [ ] Tagline is at most 10 words and ends in period

> YouTube channel art at `./design/<brand-slug>/artifacts/youtube-channel-art-YYYY-MM-DD-<slug>.html`.
>
> Archetype: `<picked>`. Export the 2560×1440 canvas as PNG (remove the safe-zone dashed outline before export). Upload via YouTube Studio → Customization → Branding → Banner image.

## Rules

- **Two canvases, one composition.** Both render the same brand treatment; they exist to verify cross-device legibility, not to show different designs.
- **Safe zone is non-negotiable.** Mobile + desktop visitors see ONLY the 1546×423 center. If your wordmark or tagline doesn't fit there, redo with smaller scale.
- **Wider bleed is intentional negative space.** Don't fill it with decoration to "use the space" — TV viewers should see committed cream surface or a subtle pattern, not panic-filled iconography.
- **Pixel exactness on both canvases.**
- **Token-pure.** Every visual value via `var(--*)` from tokens.css.
- **Anti-pattern compliance.** This skill defers to `../design-anti-patterns.md` as the canonical anti-tell list.
