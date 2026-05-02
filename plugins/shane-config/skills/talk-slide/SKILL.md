---
name: talk-slide
description: Generate a 3-slide talk template — title slide + content slide + section-divider slide — all in a single 1920×1080 (16:9) HTML file with clearly demarcated .canvas divs so each can be screenshotted separately and assembled into a full deck. Reads ./design/<brand-slug>/DESIGN.md, tokens.css, and components.html. Triggers include "talk slides for X", "conference slide template", "title slide for [talk]", "/talk-slide".
---

# Skill: talk-slide

Produces a single self-contained HTML file containing THREE 1920×1080 slide canvases, each demarcated for individual screenshot:

1. **Title slide** — talk title + speaker + venue/date. The cover.
2. **Content slide** — structured content area: headline + body region (allows for prose, list, or code excerpt).
3. **Section-divider slide** — large display type announcing a new section ("§ 02 — On Settlement"). The pause-and-breathe slide.

This skill produces the BUILDING BLOCKS for a talk deck. The user duplicates and edits content slides as needed; the title and divider patterns repeat across the deck.

## When to use

- User is preparing a conference talk, internal presentation, or recorded demo
- A `DESIGN.md` exists for the brand

## Inputs

- **Required:** brand slug, talk title (sentence-case ending in period per brand voice)
- **Required:** speaker name + role/affiliation
- **Required:** venue/conference + date
- **Optional:** content slide headline + body content (sample for the template), section-divider section title

## Output

`./design/<brand-slug>/artifacts/talk-slide-YYYY-MM-DD-<slug>.html`

## Steps

### 1. Verify brand exists

```bash
test -f ./design/<brand-slug>/tokens.css
```

If missing, stop and tell the user to run `/design-system <brand-slug>` first.

### 2. Gather the brief

Ask in one message:

```
1. Talk title — sentence-case ending in period (max ~12 words)
2. Speaker — name + role/affiliation
3. Venue — conference / event + date (e.g. "Strange Loop 2026 · 09.18.2026")
4. Optional content slide headline + 2-4 short body lines (used to populate the template)
5. Optional section-divider title (e.g. "On settlement")
```

### 3. Pick variation — apply CONSISTENTLY across all 3 slides

Talks need visual continuity across slides — pick ONE variation set and apply throughout:

- **Color treatment**: `cream-page` (warm cream throughout) | `inversion-feature` (cream-page slides + ONE inversion-block slide as a moment, e.g. the section-divider) | `full-inversion` (every slide on dark, for keynote drama)
- **Type pressure**: `display-led` (Fraunces or brand display does the heavy lifting) | `mixed-weight` (display headlines + sans body per slide)
- **Composition focus**: `asymmetric` (off-center anchoring across all slides) | `symmetric` (centered — the conference-talk default; use only if the talk venue is formal)

**Cross-artifact rule:** if a previous talk-slide artifact for this brand chose `asymmetric`, the next one might choose `symmetric` for a different talk — but within a single deck, consistency wins.

### 4. Generate the HTML

Template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><Brand> — Talk slides — <talk title></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=<families>&display=swap">
<style>
/* Embed tokens.css verbatim */
<contents of tokens.css>

html, body { margin: 0; padding: 0; background: #2a2a2a; min-height: 100vh; font-family: var(--type-sans-family); }
body { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px 0; }

/* Slide labels (above each canvas — for screenshotter, NOT part of the slide) */
.slide-label {
  font-family: var(--type-mono-family);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.7);
  align-self: center;
}

/* All 3 slides at exact 1920×1080 */
.canvas {
  width: 1920px;
  height: 1080px;
  background: var(--color-surface);    /* override per slide variation */
  color: var(--color-ink);
  position: relative;
  overflow: hidden;
  padding: 80px;
  box-sizing: border-box;
  display: grid;
  /* Layout per slide type */
}

/* Title slide */
.canvas--title {
  grid-template-rows: auto 1fr auto;
  gap: 48px;
}

/* Content slide */
.canvas--content {
  grid-template-rows: auto auto 1fr auto;
  gap: 24px;
}

/* Section-divider slide — often the inversion moment */
.canvas--divider {
  /* Cream-page or inversion based on variation choice */
  display: grid;
  place-items: center;
}
.canvas--divider.is-inverted {
  background: var(--color-ink);
  color: var(--color-surface);
}

/* The slide-typography rules (display-xxl for divider, display-xl for title, headline-md for content) */
.slide-display { font-family: var(--type-display-family); font-weight: 400; font-size: 144px; line-height: 0.96; letter-spacing: -0.022em; margin: 0; }
.slide-title   { font-family: var(--type-display-family); font-weight: 400; font-size: 96px; line-height: 1.0; letter-spacing: -0.02em; margin: 0; }
.slide-headline { font-family: var(--type-display-family); font-weight: 500; font-size: 56px; line-height: 1.1; letter-spacing: -0.015em; margin: 0; }
.slide-body { font-family: var(--type-sans-family); font-size: 28px; line-height: 1.5; max-width: 64ch; }

/* Folio + speaker meta in lower corners */
.slide-folio {
  font-family: var(--type-mono-family);
  font-size: 18px;
  letter-spacing: 0.06em;
  color: var(--color-ink-3);
  display: inline-flex; gap: 16px; align-items: baseline;
}
.slide-folio .pos { color: var(--color-ink); }
.canvas--divider.is-inverted .slide-folio { color: rgba(251,250,249,0.55); }
.canvas--divider.is-inverted .slide-folio .pos { color: var(--color-surface); }

@page { size: 1920px 1080px; margin: 0; }
</style>
</head>
<body>
<!--
Variation choices:
  color:       <picked>
  type-press:  <picked>
  composition: <picked>
-->

<span class="slide-label">→ Slide 1 · TITLE · 1920×1080 · screenshot this for the cover</span>
<article class="canvas canvas--title">
  <!-- top-row meta (venue + date) -->
  <!-- center: large display title with optional type-accent on subject word -->
  <!-- bottom-row: speaker + folio -->
</article>

<span class="slide-label">→ Slide 2 · CONTENT · 1920×1080 · template for any body slide (duplicate + edit)</span>
<article class="canvas canvas--content">
  <!-- running head: talk title in small caps -->
  <!-- headline -->
  <!-- body region (prose, list, or code) -->
  <!-- folio -->
</article>

<span class="slide-label">→ Slide 3 · SECTION DIVIDER · 1920×1080 · the pause-and-breathe slide</span>
<article class="canvas canvas--divider is-inverted">
  <!-- center: massive display section title -->
  <!-- folio -->
</article>
</body>
</html>
```

### 5. Verify and report

- [ ] All 3 canvases at exact 1920×1080
- [ ] Color/type/composition variation applied consistently across slides
- [ ] Title slide includes: talk title, speaker, venue/date
- [ ] Content slide has structured headline + body region (not just one big block)
- [ ] Section-divider slide uses display-xxl scale (144px) for the section title
- [ ] **Read `../design-anti-patterns.md` and verify the artifact violates none of its rules.** Pay special attention to sections 2 (no italics-emphasis on display titles), 4 (no top-metadata-row eyebrow disguise), 5 (no `EP. 01` / `Slide 01` cosplay markers), and 8 (no animations on static slides)
- [ ] At most one type-accent (single word in `--color-accent`) across the 3 template slides
- [ ] Speaker name placement consistent across title + folio slides

> Talk slides at `./design/<brand-slug>/artifacts/talk-slide-YYYY-MM-DD-<slug>.html`.
>
> Variation: `<color>` × `<type-press>` × `<composition>`.
>
> Export each slide as PNG: open in browser → DevTools → device toolbar → set viewport to 1920×1080 → screenshot each `.canvas` element separately. Use the labels above each canvas to identify which is which.
>
> To extend into a full deck: duplicate the content slide template, edit per-slide content, screenshot each.

## Rules

- **Pixel exactness on all 3 canvases.** 1920×1080, no flex.
- **Token-pure.** Every visual value via `var(--*)` from tokens.css. Only literal pixel values: `1px` for hairlines and the canvas dimensions.
- **One file produces 3 slide types.** Don't bundle 10 content slides — produce the 3 templates and let the user duplicate as needed.
- **Variation applies to all 3 slides.** Don't pick different color treatments per slide; the deck must read as a deck.
- **No animations.** Static slides only. If the user wants motion, that's a different artifact (motion-frames skill, future).
- **Anti-pattern compliance.** This skill defers to `../design-anti-patterns.md` as the canonical anti-tell list. If you find a new tell in the output, add it there.
