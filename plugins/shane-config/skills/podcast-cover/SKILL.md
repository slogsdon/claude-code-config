---
name: podcast-cover
description: Generate a podcast cover artifact — pixel-exact 1500×1500 square HTML canvas (half of Apple Podcasts' 3000×3000 spec for manageable PNG size; export the screenshot at 2× scale via DevTools for actual upload). Bold, legible at app-icon scale (~120×120). Reads ./design/<brand-slug>/DESIGN.md, tokens.css, and components.html. Triggers include "podcast cover for X", "podcast art", "show cover", "/podcast-cover".
---

# Skill: podcast-cover

Produces a pixel-exact 1500×1500 square HTML canvas. The defining constraint: the cover must read clearly at 120×120px (typical app-icon scale in Apple Podcasts / Spotify / Pocket Casts). Bias toward fewer words, larger type, higher contrast than other platform skills. Bold typographic treatment, no decoration.

## When to use

- User has (or is launching) a podcast and wants cover art
- A `DESIGN.md` exists for the brand

## Inputs

- **Required:** brand slug, show title (max 4 words for legibility at icon scale)
- **Optional:** tagline (max 6 words), wordmark/host name placement

## Output

`./design/<brand-slug>/artifacts/podcast-cover-YYYY-MM-DD-<slug>.html`

## Steps

### 1. Verify brand exists

```bash
test -f ./design/<brand-slug>/tokens.css
```

If missing, stop and tell the user to run `/design-system <brand-slug>` first.

### 2. Gather the brief

Ask in one message:

```
1. Show title (max 4 words — push back if longer; app-icon legibility is the constraint)
2. Optional tagline / category (max 6 words; will appear small)
3. Optional host name placement (corner mark, footer, or absent)
```

If the user gives 5+ words for the title, push back: "Cover art at 120×120 won't hold more than 4 words legibly. What's the core?" Don't proceed until they agree.

### 3. Pick variation — ARCHITECTURE FIRST

Pick ONE. Podcast covers reward boldness:

- `single-word` — one massive word fills the canvas. Strongest at icon scale.
- `type-only` — short title (2-4 words) at extreme scale; no meta, no decoration.
- `inverse-text` — full canvas dark inversion (canonical v2 feature treatment) — the title in cream on ink. The contrast helps at small sizes.
- `number-led` — episode/season number dominates (for serial / numbered shows).
- `chrome-led` — title + tagline + corner mark. **Last resort.** Rarely warranted at this scale.

Then pick:
- **Layout**: `centered | top-anchored | bottom-anchored | corner-anchored`
- **Color usage**: `monochrome | single-accent | inverted` (inversion is often strongest at icon scale)

**Cross-artifact rule:** if the brand has a previous cover (e.g. season 1 vs season 2), pick a different archetype OR a different color treatment.

### 4. Generate the canvas HTML

Template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><Brand> — Podcast cover — <show title></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=<families>&display=swap">
<style>
/* Embed tokens.css verbatim */
<contents of tokens.css>

html, body { margin: 0; padding: 0; background: #2a2a2a; min-height: 100vh; display: grid; place-items: center; font-family: var(--type-display-family); }

.canvas {
  width: 1500px;
  height: 1500px;
  background: var(--color-surface);    /* or --color-ink for inversion */
  color: var(--color-ink);
  position: relative;
  overflow: hidden;
  padding: 80px;
  box-sizing: border-box;
  display: grid;
  /* Layout per variation */
}

/* The display title — must be MASSIVE for icon-scale legibility */
.title {
  font-family: var(--type-display-family);
  font-weight: 500;
  font-size: clamp(280px, 30vw, 480px);
  line-height: 0.92;
  letter-spacing: -0.025em;
  margin: 0;
  color: var(--color-ink);    /* or surface for inversion */
}

@page { size: 1500px 1500px; margin: 0; }
</style>
</head>
<body>
<!--
Variation choices:
  archetype: <picked>
  layout:    <picked>
  color:     <picked>

Show title (on canvas): "<title>"
-->
<article class="canvas">
  <!-- title content per archetype -->
</article>
</body>
</html>
```

For the title itself:
- **`single-word`**: ONE word at 400-480px Fraunces (or brand display family); period as the only ornament
- **`type-only`**: 2-4 word title at 280-360px, hand-broken across multiple lines for typographic rhythm
- **`inverse-text`**: full canvas dark; title in cream at maximum scale
- **`number-led`**: massive numeral (e.g. "47" for episode 47) with title small beneath

### 5. Test legibility (mental check)

Imagine the canvas scaled to 120×120px (typical app-icon size). At that size:
- Can you read the title in under 1 second?
- Is the contrast strong enough to pop against a feed of similar covers?
- Is the host name / tagline (if present) tiny enough to disappear gracefully — or does it need to GO entirely?

If "no" to the first two, the title is too small or contrast too low. Bump scale up or switch to inversion.

### 6. Verify and report

- [ ] Canvas is exactly 1500×1500
- [ ] Architecture archetype documented AND differs from the most recent artifact in this brand
- [ ] Title is at most 4 words
- [ ] Display type at minimum 280px (typical: 360–480px)
- [ ] **Read `../design-anti-patterns.md` and verify the artifact violates none of its rules.** Pay special attention to sections 2 (no italics OR single-word color emphasis) and 5 (no editorial-cosplay markers)
- [ ] No more than 1 type family at icon scale; mono allowed only for tiny meta if at all
- [ ] No accent color on a single punctuation mark (clever-AI tell)
- [ ] Brand mark, if present, is unobtrusive — corner placement, max 24px font-size

> Podcast cover at `./design/<brand-slug>/artifacts/podcast-cover-YYYY-MM-DD-<slug>.html`.
>
> Variation: `<archetype>` × `<layout>` × `<color>`.
>
> Export at 3000×3000 for Apple Podcasts: open in browser → DevTools → device toolbar → 1500×1500 viewport → screenshot at 2x device scale. Or use a screenshot tool that supports 2x export.

## Rules

- **Title word count is hard-capped at 4.** Push back on the user if they want more. App-icon legibility is non-negotiable.
- **Pixel exact.** 1500×1500, no flex.
- **Token-pure.** Every value via `var(--*)` except `1px` for borders and the canvas pixel dimensions.
- **Display scale floor: 280px.** Smaller doesn't survive icon-scale display.
- **Anti-pattern compliance.** This skill defers to `../design-anti-patterns.md` as the canonical anti-tell list. If you find a new tell in the output, add it there.
