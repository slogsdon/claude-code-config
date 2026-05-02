---
name: design-twitch-panels
description: Generate a bundled Twitch channel asset set — single HTML file containing 1 offline banner (1920×1080) + 6 info panels (320×160 each, labeled About / Schedule / Commands / Socials / Specs · Setup / Support). Each canvas is screenshotted individually and uploaded to the appropriate Twitch channel slot. The offline banner uses the brand's most distinctive architecture; panels use a CONSISTENT register so they read as a set. Reads ./design/<brand-slug>/DESIGN.md, tokens.css, and components.html. Triggers include "twitch panels", "stream channel art", "twitch banner + panels", "/twitch-panels".
---

# Skill: twitch-panels

Produces a single self-contained HTML file containing **7 pixel-exact canvases**:

1. **Offline banner** (1920×1080) — shown when the channel is offline. The page's most visible asset; uses the brand's strongest treatment.
2. **About panel** (320×160) — short bio
3. **Schedule panel** (320×160) — stream cadence
4. **Commands panel** (320×160) — chat commands
5. **Socials panel** (320×160) — handles
6. **Specs · Setup panel** (320×160) — gear/equipment
7. **Support panel** (320×160) — donations / merch / sponsorship

All panels share visual treatment so they read as a coherent set in the channel sidebar. Only the offline banner takes liberties with the variation matrix.

## When to use

- User runs a Twitch channel and needs the channel's static assets (offline banner + sidebar panels) as a coherent set
- A `DESIGN.md` exists for the brand

## Inputs

- **Required:** brand slug
- **Required:** offline banner copy (max ~10 words; sentence-case ending in period per brand voice)
- **Required:** per-panel content (bio for About, schedule string, command list, social handles, gear list, support links)

## Output

`./design/<brand-slug>/artifacts/twitch-panels.html` (single file — overwrite OK; canonical channel asset set for the brand)

## Steps

### 1. Verify brand exists

```bash
test -f ./design/<brand-slug>/tokens.css
```

### 2. Gather the brief

Ask in one message:

```
1. Offline banner copy — max 10 words (e.g. "Live coding on payments. Tuesdays 2pm.")
2. About — 2-3 sentence bio
3. Schedule — stream cadence string (e.g. "Tuesdays 14:00 GMT−5 · sometimes Saturdays")
4. Commands — list of chat commands + descriptions
5. Socials — array of handle + URL
6. Specs / Setup — gear list (optional; some streams skip this panel)
7. Support — donation / merch / sponsorship links (optional)
```

### 3. Pick variation — OFFLINE BANNER picks freely; PANELS use one consistent register

**Offline banner archetype** — pick from:
- `inverse-text` (full canvas dark inversion — canonical v2 feature)
- `single-word` (one massive Fraunces serif word; works for branded streams with a strong identity word)
- `type-only` (statement at maximum scale, no chrome)
- `chrome-led` (running head + headline + dateline — last resort)

**Panel register** — pick ONE pattern and apply to ALL 6 panels:
- `cream-card-hairline` — cream surface, hairline border, label + body type
- `cream-card-bracketed` — cream surface, corner-frame L-marks (brand-signature lineart)
- `inverted-mini` — dark inversion across all panels (rare; risks visual weight imbalance with the offline banner)
- `chromeless` — no border, just type with section name in small caps + body

### 4. Generate the HTML

Template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><Brand> — Twitch panels</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=<families>&display=swap">
<style>
/* Embed tokens.css verbatim */
<contents of tokens.css>

html, body { margin: 0; padding: 0; background: #2a2a2a; min-height: 100vh; font-family: var(--type-sans-family); }
body { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px 0; }

.canvas-label { font-family: var(--type-mono-family); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.7); align-self: center; }

/* Offline banner — 1920×1080 */
.canvas-offline {
  width: 1920px; height: 1080px;
  background: var(--color-surface);
  color: var(--color-ink);
  position: relative; overflow: hidden;
  padding: 96px 112px;
  box-sizing: border-box;
  display: grid;
  /* grid template per chosen archetype */
}

/* Panel — 320×160 */
.canvas-panel {
  width: 320px; height: 160px;
  background: var(--color-surface);
  color: var(--color-ink);
  position: relative; overflow: hidden;
  padding: 16px 20px;
  box-sizing: border-box;
  border: 1px solid var(--color-rule);   /* hairline register */
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 8px;
}
.canvas-panel .label {
  font-family: var(--type-display-family); font-weight: 600;
  font-variant-caps: small-caps; font-feature-settings: 'smcp';
  text-transform: lowercase;
  font-size: 12px; letter-spacing: 0.1em;
  color: var(--color-ink-3);
  margin: 0;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-rule);
}
.canvas-panel .body {
  font-family: var(--type-sans-family);
  font-size: 12px; line-height: 1.4;
  color: var(--color-ink);
  margin: 0;
  overflow: hidden;
}
.canvas-panel .body .mono { font-family: var(--type-mono-family); font-size: 11px; letter-spacing: 0.04em; color: var(--color-ink-3); }

/* Panel grid — show all 6 panels in 2 columns × 3 rows below the banner for preview */
.panels-grid {
  display: grid;
  grid-template-columns: repeat(3, 320px);
  gap: 16px;
}

@page { size: 1920px 1080px; margin: 0; }
</style>
</head>
<body>
<!--
Variation choices:
  banner-archetype: <picked>
  panel-register:   <picked>
-->

<span class="canvas-label">→ OFFLINE BANNER · 1920×1080 · upload to Twitch channel offline screen</span>
<article class="canvas-offline">
  <!-- per chosen archetype -->
</article>

<span class="canvas-label">→ PANELS · 320×160 each · upload individually to Twitch channel sidebar</span>
<div class="panels-grid">
  <article class="canvas-panel">
    <h2 class="label">about</h2>
    <p class="body"><!-- bio content --></p>
  </article>
  <article class="canvas-panel">
    <h2 class="label">schedule</h2>
    <p class="body"><!-- schedule string --></p>
  </article>
  <article class="canvas-panel">
    <h2 class="label">commands</h2>
    <p class="body"><span class="mono">!commands</span> · <span class="mono">!socials</span> · <span class="mono">!gear</span></p>
  </article>
  <article class="canvas-panel">
    <h2 class="label">socials</h2>
    <p class="body"><!-- handles --></p>
  </article>
  <article class="canvas-panel">
    <h2 class="label">specs · setup</h2>
    <p class="body"><!-- gear list --></p>
  </article>
  <article class="canvas-panel">
    <h2 class="label">support</h2>
    <p class="body"><!-- support links --></p>
  </article>
</div>
</body>
</html>
```

### 5. Verify

- [ ] Offline banner is exactly 1920×1080
- [ ] All 6 panels are exactly 320×160
- [ ] Banner archetype documented; differs from any recent Twitch banner for this brand
- [ ] Panels use ONE consistent register — same border/fill/type-treatment across all 6
- [ ] Panel labels in Fraunces small caps (NOT mono caps — that's v1's tell)
- [ ] **Read `../design-anti-patterns.md` and verify the artifact violates none of its rules.** Pay special attention to sections 2 (no italics-emphasis OR single-word color emphasis), 4 (consistent panel register; no top-metadata-row eyebrow disguise), 5 (no editorial-cosplay markers unless brand-earned), and 8 (no animations on static panels)
- [ ] Panel content fits within the 320×160 frame at the chosen type sizes — no overflow, no clipped text

> Twitch panels at `./design/<brand-slug>/artifacts/twitch-panels.html`.
>
> Banner: `<archetype>` · Panels: `<register>`.
>
> Export each canvas: open in browser → DevTools → set viewport to canvas dims → screenshot the `.canvas-offline` or each `.canvas-panel` separately. Upload via Twitch dashboard → Settings → Channel.

## Rules

- **Pixel exactness on every canvas.** Twitch enforces these dimensions; mis-sized assets get rejected or stretched.
- **Panels are a SET.** Same register across all 6. Don't apply different archetypes per panel — that creates the "AI made each one separately" feel this skill exists to avoid.
- **Banner is the anchor.** It's the only place the offline visitor lands; it deserves the strongest treatment in the system.
- **Token-pure.** Every visual value via `var(--*)` from tokens.css.
- **Anti-pattern compliance.** This skill defers to `../design-anti-patterns.md` as the canonical anti-tell list.
