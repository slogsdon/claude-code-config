---
name: speaker-bio-card
description: Generate a conference / CFP speaker bio card — pixel-exact 800×600 main canvas + 400×200 compact variant in a single HTML file. Contains: name, title, headshot placeholder (circular 160px), 2-line bio, social handles, optional talk title. Used for CFP applications, conference apps, sponsor decks. Reads ./design/<brand-slug>/DESIGN.md, tokens.css, and components.html. Triggers include "speaker bio card", "CFP card", "conference bio", "/speaker-bio-card".
---

# Skill: speaker-bio-card

Produces a single self-contained HTML file containing **two pixel-exact canvases**:

1. **Main card** (800×600) — full speaker bio for CFP applications, conference apps, sponsor pages
2. **Compact card** (400×200) — condensed for event programs, list views, social cards

Both render the same speaker identity at appropriate proportions. Screenshot each separately for the format the venue requires.

## When to use

- User has a CFP submission, conference profile, or sponsor-deck speaker page that needs a bio card
- A `DESIGN.md` exists for the brand

## Inputs

- **Required:** brand slug, speaker name, title/role
- **Required:** 2-line bio (max ~30 words across the two lines combined; sentence-case ending in period per brand voice)
- **Required:** social handle (1 primary; optional secondary)
- **Optional:** talk title — if provided, gets prominent placement on the main card
- **Optional:** headshot URL — if not provided, the skill renders a typographic placeholder (initials in a circle)

## Output

`./design/<brand-slug>/artifacts/speaker-bio-card-YYYY-MM-DD-<slug>.html`

## Steps

### 1. Verify brand exists

```bash
test -f ./design/<brand-slug>/tokens.css
```

### 2. Gather the brief

Ask in one message:

```
1. Speaker name + title/role (e.g. "Shane Logsdon, technical product leader")
2. Bio — 2 lines, sentence-case ending in period (max ~30 words combined)
3. Social handle — primary (e.g. @shanelogsdon)
4. Optional talk title — "What I look for in operator tooling." (gets prominent placement)
5. Optional headshot URL — if omitted, renders initials in a circle as a placeholder
```

### 3. Pick variation — apply CONSISTENTLY across both cards

Speaker bio cards reward editorial restraint over visual flourish:

- `chrome-led` — name + title + bio + handles in structured rows. Brand-earned for editorial speakers.
- `inverse-text` — full canvas dark inversion (canonical v2 feature treatment). Reads as confident.
- `type-only` — name + bio at maximum scale; no chrome. Strongest for speakers with strong personal brand.
- `headshot-led` — circular headshot anchors the composition; bio orbits.

**Talk title placement** — if provided, treat it as the SECOND-MOST-IMPORTANT element after the name. Display weight at 28-36px.

### 4. Generate the HTML

Template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><Brand> — Speaker bio — <name></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=<families>&display=swap">
<style>
/* Embed tokens.css verbatim */
<contents of tokens.css>

html, body { margin: 0; padding: 0; background: #2a2a2a; min-height: 100vh; font-family: var(--type-sans-family); }
body { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px 0; }

.canvas-label { font-family: var(--type-mono-family); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.7); align-self: center; }

/* Main card — 800×600 */
.canvas-main {
  width: 800px; height: 600px;
  background: var(--color-surface);
  color: var(--color-ink);
  position: relative; overflow: hidden;
  padding: 48px 56px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 24px;
}

/* Compact card — 400×200 */
.canvas-compact {
  width: 400px; height: 200px;
  background: var(--color-surface);
  color: var(--color-ink);
  position: relative; overflow: hidden;
  padding: 20px 24px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 16px;
  align-items: center;
}

/* Headshot placeholder — circular, initials, brand-toned */
.headshot {
  width: 160px; height: 160px;
  border-radius: 999px;
  background: var(--color-ink);
  color: var(--color-surface);
  display: grid; place-items: center;
  font-family: var(--type-display-family);
  font-weight: 500;
  font-size: 64px;
  letter-spacing: -0.02em;
}
.canvas-compact .headshot { width: 80px; height: 80px; font-size: 32px; }

/* Speaker name */
.speaker-name {
  font-family: var(--type-display-family);
  font-weight: 500;
  font-size: 48px;
  line-height: 1.0;
  letter-spacing: -0.018em;
  margin: 0;
  color: var(--color-ink);
}
.canvas-compact .speaker-name { font-size: 22px; }

/* Title / role */
.speaker-title {
  font-family: var(--type-display-family);
  font-weight: 600;
  font-variant-caps: small-caps; font-feature-settings: 'smcp';
  text-transform: lowercase;
  font-size: 14px; letter-spacing: 0.08em;
  color: var(--color-ink-3);
  margin: 8px 0 0;
}
.canvas-compact .speaker-title { font-size: 11px; margin-top: 4px; }

/* Bio */
.speaker-bio {
  font-family: var(--type-sans-family);
  font-size: 18px; line-height: 1.5;
  color: var(--color-ink-soft);
  margin: 0;
  max-width: 56ch;
}

/* Talk title — prominent if provided */
.talk-title {
  font-family: var(--type-display-family);
  font-weight: 500;
  font-size: 32px;
  line-height: 1.15;
  letter-spacing: -0.012em;
  color: var(--color-ink);
  margin: 0;
  border-top: 1px solid var(--color-rule);
  padding-top: 20px;
}
.talk-title .accent { color: var(--color-accent); }
.talk-title-label {
  font-family: var(--type-display-family); font-weight: 600;
  font-variant-caps: small-caps; font-feature-settings: 'smcp';
  text-transform: lowercase;
  font-size: 12px; letter-spacing: 0.1em;
  color: var(--color-ink-3);
  margin-bottom: 10px;
}

/* Footer with handles */
.speaker-foot {
  display: flex; justify-content: space-between; align-items: baseline;
  padding-top: 16px;
  border-top: 1px solid var(--color-rule);
  font-family: var(--type-mono-family);
  font-size: 13px; letter-spacing: 0.06em;
  color: var(--color-ink-3);
}
.speaker-foot .pos { color: var(--color-ink); }

@page { size: 800px 600px; margin: 0; }
</style>
</head>
<body>
<!--
Variation choices:
  archetype: <picked>
-->

<span class="canvas-label">→ MAIN · 800×600 · CFP applications, conference apps, sponsor pages</span>
<article class="canvas-main">
  <header style="display: grid; grid-template-columns: 160px 1fr; gap: 32px; align-items: center;">
    <div class="headshot">[initials]</div>
    <div>
      <h1 class="speaker-name">[Speaker name]</h1>
      <p class="speaker-title">[role / title]</p>
      <p class="speaker-bio">[bio line 1 — sentence ending in period.] [bio line 2 — sentence ending in period.]</p>
    </div>
  </header>
  <!-- Optional talk title block — omit if not provided -->
  <div>
    <p class="talk-title-label">— current talk</p>
    <h2 class="talk-title">[Talk title with optional <span class="accent">[one accent word]</span>]</h2>
  </div>
  <footer class="speaker-foot">
    <span><span class="pos">[handle]</span> · [URL]</span>
    <span>[venue or event date if known]</span>
  </footer>
</article>

<span class="canvas-label">→ COMPACT · 400×200 · event programs, list views, social cards</span>
<article class="canvas-compact">
  <div class="headshot">[initials]</div>
  <div>
    <h1 class="speaker-name">[Speaker name]</h1>
    <p class="speaker-title">[role / title]</p>
    <p style="margin: 6px 0 0; font-size: 11px; font-family: var(--type-mono-family); letter-spacing: 0.06em; color: var(--color-ink-3);">[handle]</p>
  </div>
</article>
</body>
</html>
```

### 5. Verify

- [ ] Both canvases at exact dimensions (800×600 + 400×200)
- [ ] Speaker name fits comfortably (push back on names that overflow at 48px)
- [ ] Bio is at most 30 words across 2 lines and ends in period per brand voice
- [ ] Headshot placeholder uses speaker's initials (not a generic "U" or icon); circular, brand-toned (ink bg, cream text)
- [ ] Talk title (if present) gets prominent placement on the main card with optional accent on the subject word
- [ ] Architecture archetype documented and applied consistently to both cards
- [ ] **Read `../design-anti-patterns.md` and verify the artifact violates none of its rules.** Pay special attention to sections 1 (no stock-photo cliches; no decorative orbs), 2 (no italics-emphasis OR single-word color emphasis as default), and 5 (no editorial-cosplay markers — "SPEAKER" badges, "FEATURED" eyebrows are tells)
- [ ] No "Speaker · 2026" / "Featured Speaker" decoration — the card IS the speaker info; framing it with extra labels reads as AI cosplay

> Speaker bio card at `./design/<brand-slug>/artifacts/speaker-bio-card-YYYY-MM-DD-<slug>.html`.
>
> Variation: `<archetype>`.
>
> Export main: open in browser → DevTools → 800×600 viewport → screenshot the `.canvas-main` element.
> Export compact: 400×200 viewport → screenshot `.canvas-compact`.

## Rules

- **Pixel exactness on both canvases.**
- **Headshot placeholder uses initials.** If the user provides an actual headshot URL, use that; if not, the placeholder is the speaker's initials in a circle in the brand's ink color — NOT a generic icon.
- **Talk title is the second-most-important element** when provided. Sized prominently, may carry one type-accent word.
- **No "Featured Speaker" badges or decorative eyebrows.** The card stands as itself.
- **Token-pure.** Every visual value via `var(--*)` from tokens.css.
- **Anti-pattern compliance.** This skill defers to `../design-anti-patterns.md` as the canonical anti-tell list.
