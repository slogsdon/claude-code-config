# Design Anti-Patterns — Shared Reference

> The marketing design skills (`design-plan`, `design-system`, `design-ui-components`, and the platform skills) all read from this file. Update this file whenever a new AI-tell is observed in real output.

This file is the canonical anti-pattern list. Each platform skill references it and adds only its platform-specific tells inline. Treat every entry below as a hard rule unless a brand's `DESIGN-PLAN.md` explicitly waives it.

## How to use this file

Before claiming any artifact is done, scan the section headers below and verify the artifact violates none. If you spot a new tell in real output that isn't listed here, add it — that's how this file maintains its bite.

---

## 1. Universal — never, regardless of brand

These are non-negotiable across every artifact, every brand, every direction.

- No purple-to-cyan, blue-to-pink, or sage-to-mint gradients
- No floating orbs, glowing nodes, breath circles, brain meshes, neuron visualizations
- No robot/cyborg iconography, brain-with-circuits, "AI as a face"
- No generic geometric/circuit patterns used as background decoration
- No 3D isometric illustrations (servers, devices, dashboards floating in space)
- No stock photography of people pointing at screens
- No drop shadows on text, anywhere
- No emojis (unless `DESIGN-PLAN.md` explicitly allows)
- No exclamation points (unless the brand's voice section calls for them)
- No medieval/heraldic imagery (Honeycomb-era observability cliché)
- No graph-spaghetti backgrounds (real-looking charts as decoration, not data)
- No filled-background callouts in body content (use a left rule + color hint instead)

## 2. Type — emphasis is a deliberate choice

The default AI-emphasis move is to italicize one word in a headline. The cousin move is to color one word semantically. Both read as AI within seconds.

- **No italicized single word as emphasis.** If you emphasize a word, do something stronger: 3×+ scale shift, weight shift (700 vs 400), position (drop to next line), or a real typographic event (different family, oversized punctuation).
- **No single-word color-emphasis.** Coloring one word in the accent or signal color is the same move as italicizing it — just dressed in semantic clothes. Forbidden as a default emphasis. Allowed only when the color is doing real semantic work AND the rest of the artifact uses the same color in the same role (e.g. `--color-crit` highlighting actual critical content, not just an emphasized adjective).
- **No more than 2 type families per artifact.** Mono labels count as a third only when used in their proper role as labels.
- **No display-font flourishes that read as "designer trying"** (excessive ligatures, swash variants used decoratively, optical-size axis pushed to extremes for no reason).
- **No center-aligned hero blocks** (unless the brand explicitly calls for symmetry).

## 3. Color — semantic over decorative

- No accent color used decoratively. Accent earns its place per surface — a single most-important action, a status signal, a structural rule. If the accent appears in 3+ unrelated locations on one canvas, it's decoration.
- No signal colors (ok-green, warn-amber, crit-red) used outside their semantic role. Green is "ok"; never "brand color" by default.
- No "accent color on a single punctuation mark" (period, em-dash, slash). Clever the first time, AI-tell after that.
- No "warm cream + dark ink + oxblood accent" specifically (Hollow's choice is now its own pattern; if a NEW brand goes this route, justify why and execute differently).
- No "dark surface + green-accent + amber/red signals" specifically (Tail's choice; same justification rule).

## 4. Layout — architecture novelty must reach the inner blocks

The most common second-iteration failure: the OUTER architecture is novel (`inverse-text`, `pattern-led`, `object-of-content`) but the INNER text block reverts to chrome-led (eyebrow + headline + meta footer-row). Architecture choice applies recursively.

- **No `eyebrow + headline + meta-row` inside a panel** when the outer canvas already broke the chrome-led mold. Pick simpler inner block (just headline; or headline + one supporting line; no row).
- **No 3-column footer rows** (`auto / 1fr / auto` with mark / spacer / url) by default. This pattern survives every iteration unless explicitly broken. Vary placement: corner-only, embedded in copy, on top instead of bottom, or absent entirely.
- **No "top metadata row" disguised as functional context.** Mono-caps row at the top with category · date · version IS an eyebrow. Counts toward the eyebrow restriction. If you remove eyebrows but add a top mono-row, you haven't removed the chrome.
- **No "brand mark always lives in lower-right."** Vary placement across artifacts in a brand. Lower-right · upper-left · embedded in copy · absent. If 3 artifacts in a brand all have the mark in the lower-right, the system has collapsed.
- **No bento-grid layouts by default.** Bento grids became their own 2024-era cliché.

## 5. Editorial cosplay — wrong genre tells

These survive because they "feel literary" but they read as AI mimicking editorial design.

- No `§ 01` / `§ 02` section markers unless the artifact is genuinely part of a numbered series the user is producing
- No `No. 01` / `Issue One` / `Notebook · No. 01` framing — pastiche of literary magazines
- No `EP. 01` / `Episode 01` markers unless the user has an actual numbered video series
- No "From the founder · DATE" eyebrow unless the artifact is genuinely a founder note (not just a generic announcement)
- No `/Brand` slash-prefix mark (Vercel/Linear-era cliché, dated by ~2024)
- No "Notebook" / "Quarterly" / "Volume" labels on one-off artifacts

## 6. Voice & copy — category-specific marketing tells

Add to this section as new categories produce their own voice patterns.

### Wellness / journaling / meditation
- No "your inner voice deserves to be heard" energy
- No therapist-speak: "hold space", "lean in", "your truth", "show up for yourself"
- No "discover your X with Y's mindful Z" templates
- No watercolor/serif-italic mindfulness aesthetic

### Observability / SRE / dev tools
- No "single pane of glass"
- No "actionable insights"
- No "next-generation observability"
- No "AI-powered" anything (even when AI is involved)
- No "the future of [category] is here"
- No "digital transformation"
- No "observability for the modern stack"

### SaaS launch (any category)
- No "ANNOUNCING" / "INTRODUCING" eyebrows on launch artifacts
- No countdown timers
- No "join the waitlist for early access" with urgency framing
- No "The wait is over"

## 7. Cross-artifact rules — system-level, not per-artifact

Before generating an artifact, list previous artifacts in `./design/<brand-slug>/artifacts/` and read their variation comments. Apply these rules:

- **Architecture archetype must differ** from the most recent artifact. Strong rule.
- **Footer signature treatment must differ** from the most recent artifact (corner-only · embedded · on-top · row · absent). Vary across the set.
- **Brand mark placement must rotate** — if the last 2 artifacts placed the wordmark lower-right, this one places it elsewhere or omits it.
- **Eyebrow / top-metadata-row counts as chrome.** If the last artifact had one, the current one should NOT — variation is the discipline.
- **Inner text block architecture must match outer.** If the outer archetype is `inverse-text`, the inner block can't revert to `chrome-led` structure.

## 8. Animation — almost always wrong

- No animations by default on static artifacts (LinkedIn, Twitter, YouTube, Instagram). Animation belongs in motion artifacts, not stills.
- On stream overlays: ONE animation maximum across all scenes, and it must be functional (pulse on a status indicator, not decorative motion). A pulsing dot AND a blinking cursor is two animations — drop one.
- No transitions for transitions' sake (slide-in, fade-in, parallax). Static design has its own discipline.

---

## Maintenance

When a new AI-tell appears in real output during a smoke test or production use:

1. Identify which section it belongs to (or create a new section)
2. Add it as a bullet with the explicit rule
3. If it's a category-specific marketing phrase, add it under section 6
4. If a previous rule needs strengthening (e.g., italics-ban needed to extend to color-emphasis), edit in place

Do not delete entries. Once an anti-pattern is identified it stays — these are cumulative learnings, not opinions.
