---
name: design-audit-report
description: Generate a single-page AEO/SEO visibility audit report artifact for a warm local-business prospect — pixel-exact 1200px-wide HTML canvas (height auto) sectioned as business header → overall grade → AI visibility (AEO) → search visibility (SEO) → key findings → recommended next steps → prepared-by footer. Reads ./design/<brand-slug>/DESIGN.md, tokens.css, and components.html. Triggers include "audit report for X", "visibility report", "AEO/SEO audit one-pager", "/audit-report".
---

# Skill: audit-report

Produces a single self-contained HTML file containing one pixel-exact 1200px-wide canvas (height auto) — a deliverable visibility audit report sized to share with a warm prospect as a PNG, a printed PDF, or a hosted page. The canvas IS the artifact. Inside it, the report runs as a structured editorial document, not a dashboard.

This format's most-prone AI-default tells: traffic-light dashboards (green/yellow/red pills as decoration), score gauges with circular progress arcs, "AI Visibility Score: 73 / 100" big-number-in-a-circle. **All three are explicitly banned in this skill.** A grade is presented in type, hairline rules carry section structure, and finding severity uses semantic typography, not pill-shaped color chips.

## When to use

- A warm local-business lead has agreed to receive a baseline visibility report (or remeasurement at 30 / 60 / 90 days)
- You have query-by-query AI search results and search-engine results and want a leave-behind / share-ready document
- A `DESIGN.md` exists for the brand doing the auditing (typically the practitioner's personal brand)

## Inputs

- **Required:** brand slug, business name, business location (City, State), industry / category, report date (YYYY-MM-DD), overall grade (single letter A–F or descriptor like "early-stage"), grade rationale (1 sentence)
- **Required:** AEO section — list of AI tools queried (e.g. ChatGPT, Perplexity, Google AI Overviews, Claude), present-or-absent finding per tool, 2–4 representative queries with results
- **Required:** SEO section — Google Business Profile (GBP) status, website status, local search rankings finding (top 3 / page 1 / not present)
- **Required:** 3–5 key findings — short sentence each, ordered by severity (most consequential first)
- **Required:** 3–5 recommended next steps — sentence each, ordered by priority
- **Required:** prepared-by name + title + contact (email or URL)
- **Optional:** business website URL, GBP URL, comparison vs. baseline (for 30 / 60 / 90-day remeasurement reports)
- **Optional:** type-accent — one word (typically the grade or a single severity term) to set in `--color-accent`

## Output

`./design/<brand-slug>/artifacts/audit-report-YYYY-MM-DD-<business-slug>.html`

## Steps

### 1. Verify brand exists

```bash
test -f ./design/<brand-slug>/tokens.css
```

If missing, stop and tell the user to run `/design-system <brand-slug>` first.

### 2. Gather the brief

Ask in one message:

```
1. Business name + City, State + industry/category
2. Report date (default: today)
3. Overall grade — single letter A–F OR a short descriptor (e.g. "early-stage", "owns brand only", "page 1 owned, AEO gap"); plus 1 sentence of rationale
4. AEO findings — for each AI tool (ChatGPT, Perplexity, Claude, Google AI Overviews, Gemini, etc.): present? yes/no/partial; plus 2–4 representative queries with one-line result observations
5. SEO findings — GBP status (claimed / unclaimed / partial); website status (live / down / outdated); local rankings observation
6. Key findings — 3–5 short sentences, most consequential first
7. Recommended next steps — 3–5 sentences, highest-priority first
8. Prepared by — name, title, contact email or URL
9. Optional — website URL, GBP URL, comparison vs. previous baseline date, single type-accent word
```

If the user gives more than 5 key findings or 5 next steps, push back: "Audit reports lose their bite past 5. Cut to the 5 that matter most — the rest can land in a follow-up." Don't proceed until they agree.

### 3. Pick variation — ARCHITECTURE FIRST

Pick ONE archetype that carries the report's identity:

- `editorial-document` — runs as a publication article: running head, folio, body-led sections separated by hairlines + whitespace. The most credible default for a warm-prospect leave-behind.
- `inverse-cover` — opening business header block in full dark inversion (canonical v2 feature treatment) with the body of the report on cream below. Reads as a "feature report" rather than a checkup.
- `dossier` — labeled sections with mono-caps section labels at 0.18em tracking, body in tight column. Most "investigative" feeling. Use when findings are surprising or the prospect specifically asked for a deep look.

Then pick:
- **Grade treatment**: `type-only` (just the letter/word at display scale, no chrome) | `inline-with-rationale` (grade absorbed into the rationale sentence at scale) | `paired-with-folio` (grade as a folio-style position number alongside the rationale). Banned: `gauge | progress-arc | pill | filled-badge`.
- **Findings treatment**: `numbered-prose` (numbered text blocks, sentence-led) | `running-list` (hairline-separated rows, no numbers) | `inline-emphasis` (each finding's lead phrase set in display weight, the rest in body). Banned: `traffic-light-pills | colored-status-chips | severity-tag-stickers`.
- **Color usage**: `monochrome` | `single-accent` (accent on AT MOST one finding's severity OR on the grade — never both) | `inverted-cover-only` (only the cover block inverts; the rest stays cream).

**Cross-artifact rule:** if a recent audit report for this brand used the same archetype, vary it. Read `./design/<brand-slug>/artifacts/audit-report-*.html` variation comments before deciding.

### 4. Generate the HTML

Template (1200px-wide canvas, height auto so the report sets its own length):

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><Brand> — Audit report — <business name></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=<families from DESIGN.md>&display=swap">
<style>
/* Embed tokens.css verbatim */
<contents of tokens.css>

html, body { margin: 0; padding: 0; background: #2a2a2a; min-height: 100vh; font-family: var(--type-sans-family); }
body { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px 0; }

.canvas-label {
  font-family: var(--type-mono-family);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.7);
  align-self: center;
}

/* Audit-report canvas — 1200px wide, height set by content */
.canvas-audit {
  width: 1200px;
  background: var(--color-surface);
  color: var(--color-ink);
  padding: 80px 96px 64px;
  box-sizing: border-box;
  position: relative;
}

/* === Running head — small-caps, hairline below === */
.audit__running-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-rule);
  font-family: var(--type-display-family);
  font-weight: 600;
  font-variant-caps: small-caps;
  font-feature-settings: 'smcp';
  text-transform: lowercase;
  font-size: var(--fs-smallcaps);
  letter-spacing: 0.1em;
  color: var(--color-ink);
}
.audit__running-head .dateline {
  font-family: var(--type-mono-family);
  font-variant-caps: normal;
  text-transform: none;
  letter-spacing: var(--tracking-mono);
  color: var(--color-ink-3);
}

/* === Business header === */
.audit__masthead { padding: 56px 0 48px; }
.audit__business-name {
  font-family: var(--type-display-family);
  font-weight: 400;
  font-size: var(--fs-display-xl);             /* 96px */
  line-height: var(--lh-tight);
  letter-spacing: var(--tracking-display);
  margin: 0 0 16px;
  max-width: 22ch;
}
.audit__business-meta {
  font-family: var(--type-sans-family);
  font-size: var(--fs-lead);
  line-height: 1.55;
  color: var(--color-ink-soft);
  max-width: 56ch;
  margin: 0;
}
.audit__business-meta .sep { color: var(--color-ink-3); margin: 0 8px; }

/* === Grade block — type-only by default === */
.audit__grade-row {
  display: grid;
  grid-template-columns: minmax(180px, auto) 1fr;
  gap: 56px;
  align-items: baseline;
  padding: 48px 0 56px;
  border-top: 1px solid var(--color-rule);
}
.audit__grade {
  font-family: var(--type-display-family);
  font-weight: 400;
  font-size: 144px;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--color-ink);
}
.audit__grade--accent { color: var(--color-accent); }   /* opt-in, single-accent variant only */
.audit__grade-rationale {
  font-family: var(--type-display-family);
  font-weight: 400;
  font-size: var(--fs-headline-md);             /* 36px */
  line-height: 1.25;
  letter-spacing: var(--tracking-tight);
  color: var(--color-ink);
  max-width: 32ch;
  margin: 0;
}

/* === Section — repeated for AEO and SEO === */
.audit__section { padding: 56px 0; border-top: 1px solid var(--color-rule); }
.audit__section-label {
  font-family: var(--type-display-family);
  font-weight: 600;
  font-variant-caps: small-caps;
  font-feature-settings: 'smcp';
  text-transform: lowercase;
  font-size: var(--fs-smallcaps-lg);
  letter-spacing: var(--tracking-smallcaps);
  color: var(--color-ink-3);
  margin: 0 0 12px;
}
.audit__section-headline {
  font-family: var(--type-display-family);
  font-weight: 500;
  font-size: var(--fs-headline-lg);             /* 56px */
  line-height: 1.1;
  letter-spacing: var(--tracking-tight);
  color: var(--color-ink);
  margin: 0 0 32px;
  max-width: 22ch;
}

/* AEO results table — hairline rows, no fills, no pills */
.audit__results { display: grid; grid-template-columns: 1fr; gap: 0; }
.audit__row {
  display: grid;
  grid-template-columns: 200px 1fr 96px;
  gap: 24px;
  padding: 18px 0;
  border-top: 1px solid var(--color-rule);
  align-items: baseline;
}
.audit__row:last-child { border-bottom: 1px solid var(--color-rule); }
.audit__row-label {
  font-family: var(--type-display-family);
  font-weight: 500;
  font-size: var(--fs-body-lg);
  color: var(--color-ink);
}
.audit__row-detail {
  font-family: var(--type-sans-family);
  font-size: var(--fs-body-md);
  line-height: 1.55;
  color: var(--color-ink-soft);
}
.audit__row-status {
  font-family: var(--type-mono-family);
  font-size: var(--fs-meta);
  letter-spacing: var(--tracking-mono);
  color: var(--color-ink-3);
  text-align: right;
}
.audit__row-status--present { color: var(--color-ink); }
/* Severity term — applies to one row at most when single-accent variant chosen */
.audit__row-status--accent { color: var(--color-accent); }

/* AEO query log — body-led, mono dateline-style index numbers */
.audit__queries { display: grid; gap: 28px; margin-top: 32px; }
.audit__query {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 24px;
  align-items: baseline;
  padding-top: 20px;
  border-top: 1px solid var(--color-rule);
}
.audit__query-num {
  font-family: var(--type-mono-family);
  font-size: var(--fs-dateline);
  letter-spacing: var(--tracking-mono);
  color: var(--color-ink-3);
}
.audit__query-num .pos { color: var(--color-ink); }
.audit__query-text {
  font-family: var(--type-display-family);
  font-weight: 500;
  font-size: var(--fs-headline-sm);             /* 24px */
  line-height: 1.3;
  color: var(--color-ink);
  margin: 0 0 8px;
}
.audit__query-result {
  font-family: var(--type-sans-family);
  font-size: var(--fs-body-md);
  line-height: 1.55;
  color: var(--color-ink-soft);
  margin: 0;
}

/* === Findings — numbered-prose default === */
.audit__findings { display: grid; gap: 28px; }
.audit__finding {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 24px;
  align-items: baseline;
  padding-top: 24px;
  border-top: 1px solid var(--color-rule);
}
.audit__finding-num {
  font-family: var(--type-mono-family);
  font-size: var(--fs-dateline);
  letter-spacing: var(--tracking-mono);
  color: var(--color-ink-3);
}
.audit__finding-num .pos { color: var(--color-ink); }
.audit__finding-text {
  font-family: var(--type-display-family);
  font-weight: 500;
  font-size: var(--fs-headline-sm);
  line-height: 1.35;
  color: var(--color-ink);
  margin: 0;
  max-width: 48ch;
}

/* === Next steps — same structure as findings; just relabel === */
.audit__step-text { /* alias of .audit__finding-text */ }

/* === Inversion variant — wraps the masthead block when archetype = inverse-cover === */
.audit__masthead--inverse {
  background: var(--color-ink);
  color: var(--color-surface);
  padding: 80px 96px 72px;
  margin: 56px -96px 0;          /* full-bleed within the canvas padding */
  --color-ink:       var(--color-surface);
  --color-ink-soft:  rgba(251, 250, 249, 0.72);
  --color-ink-3:     rgba(251, 250, 249, 0.55);
  --color-rule:      rgba(251, 250, 249, 0.18);
}

/* === Footer — prepared-by signature === */
.audit__foot {
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid var(--color-rule);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--type-mono-family);
  font-size: var(--fs-dateline);
  letter-spacing: var(--tracking-mono);
  color: var(--color-ink-3);
}
.audit__foot .pos { color: var(--color-ink); }

@page { size: 1200px auto; margin: 0; }
</style>
</head>
<body>
<!--
Variation choices:
  archetype:         <picked>  (editorial-document | inverse-cover | dossier)
  grade-treatment:   <picked>  (type-only | inline-with-rationale | paired-with-folio)
  findings-treatment: <picked> (numbered-prose | running-list | inline-emphasis)
  color:             <picked>  (monochrome | single-accent | inverted-cover-only)
-->

<span class="canvas-label">→ Audit report · 1200px × auto · screenshot the .canvas-audit element</span>

<article class="canvas canvas-audit">

  <!-- Running head — practitioner's running brand on the left, dateline on the right -->
  <header class="audit__running-head">
    <span>[brand running head — e.g. "shane logsdon · web presence audit"]</span>
    <span class="dateline">[YYYY.MM.DD]</span>
  </header>

  <!-- Business masthead — wrap in .audit__masthead--inverse for inverse-cover archetype -->
  <section class="audit__masthead">
    <h1 class="audit__business-name">[Business Name]</h1>
    <p class="audit__business-meta">
      [City, State] <span class="sep">·</span> [industry / category] <span class="sep">·</span> [optional website URL]
    </p>
  </section>

  <!-- Grade row -->
  <section class="audit__grade-row">
    <span class="audit__grade">[A–F or descriptor]</span>
    <p class="audit__grade-rationale">[1 sentence — why this grade. Sentence-case ending in period.]</p>
  </section>

  <!-- AEO section -->
  <section class="audit__section">
    <p class="audit__section-label">ai visibility · aeo</p>
    <h2 class="audit__section-headline">[1 sentence headline — e.g. "Two of four AI tools surface the brand on page 1."]</h2>

    <!-- Tool-by-tool finding rows -->
    <div class="audit__results">
      <div class="audit__row">
        <span class="audit__row-label">[ChatGPT]</span>
        <span class="audit__row-detail">[1-line observation per tool]</span>
        <span class="audit__row-status audit__row-status--present">present</span>
      </div>
      <!-- repeat per tool. Status options: "present" | "absent" | "partial". Mono caps, no pills. -->
    </div>

    <!-- Representative queries -->
    <div class="audit__queries">
      <article class="audit__query">
        <span class="audit__query-num"><span class="pos">01</span> · query</span>
        <div>
          <h3 class="audit__query-text">[exact query text in quotation-style sentence-case ending in period]</h3>
          <p class="audit__query-result">[1 sentence — what the AI returned, who ranked, gap observation]</p>
        </div>
      </article>
      <!-- 2–4 queries -->
    </div>
  </section>

  <!-- SEO section -->
  <section class="audit__section">
    <p class="audit__section-label">search visibility · seo</p>
    <h2 class="audit__section-headline">[1 sentence headline — e.g. "GBP claimed but underused; site live, ranking page 2 locally."]</h2>

    <div class="audit__results">
      <div class="audit__row">
        <span class="audit__row-label">Google Business Profile</span>
        <span class="audit__row-detail">[claimed/unclaimed; categories set; photos count; review count + avg]</span>
        <span class="audit__row-status">[claimed | partial | unclaimed]</span>
      </div>
      <div class="audit__row">
        <span class="audit__row-label">Website</span>
        <span class="audit__row-detail">[live/down; mobile-friendly; lighthouse / speed observation]</span>
        <span class="audit__row-status">[live | outdated | down]</span>
      </div>
      <div class="audit__row">
        <span class="audit__row-label">Local search rankings</span>
        <span class="audit__row-detail">[1-line summary across 2–3 representative local queries]</span>
        <span class="audit__row-status">[top 3 | page 1 | page 2 | not present]</span>
      </div>
    </div>
  </section>

  <!-- Key findings -->
  <section class="audit__section">
    <p class="audit__section-label">key findings</p>
    <h2 class="audit__section-headline">[1 sentence headline framing the findings — e.g. "The gap is AI search, not website traffic."]</h2>

    <div class="audit__findings">
      <article class="audit__finding">
        <span class="audit__finding-num"><span class="pos">01</span> · finding</span>
        <p class="audit__finding-text">[finding sentence — most consequential first; sentence-case ending in period]</p>
      </article>
      <!-- 3–5 findings -->
    </div>
  </section>

  <!-- Recommended next steps -->
  <section class="audit__section">
    <p class="audit__section-label">recommended next steps</p>
    <h2 class="audit__section-headline">[1 sentence framing the recommendations — e.g. "Three moves over 60 days move the needle."]</h2>

    <div class="audit__findings">
      <article class="audit__finding">
        <span class="audit__finding-num"><span class="pos">01</span> · step</span>
        <p class="audit__finding-text audit__step-text">[step sentence — highest-priority first]</p>
      </article>
      <!-- 3–5 next steps -->
    </div>
  </section>

  <!-- Footer signature -->
  <footer class="audit__foot">
    <span>prepared by <span class="pos">[Name, Title]</span></span>
    <span>[contact email or URL]</span>
  </footer>

</article>

</body>
</html>
```

Adapt the inner content per archetype:

- **`editorial-document`**: as templated above. Running head + body sections + signature footer.
- **`inverse-cover`**: wrap the `.audit__masthead` in `.audit__masthead--inverse` for full-bleed dark inversion of the cover block ONLY. The rest of the document (grade row onward) stays cream. Move the running head's hairline above (not below) the inverted block so the inversion has a clean top edge.
- **`dossier`**: increase section-label tracking to 0.18em, drop the section headline to `--fs-headline-md` (36px), tighten the body column to `max-width: 60ch` on `.audit__row-detail` and `.audit__finding-text`. Use mono-caps for the section labels instead of small-caps Fraunces (this is the only place mono-caps are allowed in this skill).

### 5. Verify

- [ ] Canvas at exact 1200px width; height set by content (no fixed pixel height)
- [ ] Architecture archetype documented AND differs from the most recent audit report for this brand
- [ ] **No traffic-light pills, no progress arcs, no gauge graphics, no filled status chips.** Status terms are mono-caps text aligned right.
- [ ] **No score-in-a-circle.** The grade is type-only OR absorbed into the rationale; never inside a circular badge.
- [ ] No more than 5 key findings AND no more than 5 next steps. If more were provided, push back per Step 2.
- [ ] **Read `../design-anti-patterns.md` and verify the artifact violates none of its rules.** Pay special attention to sections 1 (no orbs/gradients/3D-isometric/drop-shadows/filled-callouts), 2 (no italics-emphasis OR single-word color emphasis as default — the single-accent variant uses accent on AT MOST one element across the whole report), 3 (no signal colors used outside semantic role — green isn't "ok-status" decoration here), 4 (architecture must reach inner blocks; no eyebrow + headline + meta-row inside a section panel), 5 (no `§` / `No. 01` / `Issue One` framing), and 6 ("done for you" / "ANNOUNCING" / "next-generation" cliché bans apply if the audit covers a marketing surface).
- [ ] All copy is sentence-case ending in period per brand voice
- [ ] No exclamation points anywhere
- [ ] Quote-style query strings use straight quotation marks, not decorative ❝/❞
- [ ] Signature footer names a real person and a real contact path; "prepared by [Name]" never reads as a placeholder in the final file
- [ ] If single-accent variant: accent appears on AT MOST one element (the grade letter OR one severity term) — never both

> Audit report at `./design/<brand-slug>/artifacts/audit-report-YYYY-MM-DD-<business-slug>.html`.
>
> Variation: `<archetype>` × `<grade-treatment>` × `<findings-treatment>` × `<color>`.
>
> Export PNG: open in browser → DevTools → device toolbar → set viewport width to 1300px → screenshot the `.canvas-audit` element.
> Export PDF: open in browser → Print → A4 portrait or "Save as PDF" with @page size honored.
> Or run `node skills/screenshot-html/scripts/screenshot-html.mjs ./design/<brand-slug>/artifacts` from a project where Playwright is installed.

## Rules

- **One canvas per file.** The 1200px-wide `.canvas-audit` is the artifact. Don't add a second variant in the same file — generate separate files for separate audits or remeasurement deltas.
- **No dashboard cosplay.** No traffic lights, no progress arcs, no severity pills, no score gauges, no big-number-in-a-circle. The audit reads as a publication, not a SaaS settings screen.
- **Hairlines carry structure.** Section divisions are 1px `var(--color-rule)` borders + whitespace. No heavy borders, no boxed cards, no shadows.
- **Token-pure.** Every visual value via `var(--*)` from tokens.css. Only literal values: `1px` for hairlines, the `1200px` canvas width, and the masthead numerals (96px / 144px) which are intentional display-scale exceptions.
- **Single-accent discipline.** If you reach for `--color-accent`, it lands on exactly ONE element across the whole report — the grade letter OR a single severity term — never both, never decoratively.
- **No editorial-cosplay markers.** No `§ 01`, no `Issue One`, no `Vol. I`. The numeric prefix on findings/queries is `01 · finding` / `01 · query` — that's a working dateline-style index, not a literary-magazine pretension.
- **Anti-pattern compliance.** This skill defers to `../design-anti-patterns.md` as the canonical anti-tell list. If you find a new tell in the output, add it there.
