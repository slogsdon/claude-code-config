---
name: decay-scanner
description: >
  Detect content decay — pages that have lost organic traffic versus a past peak. Use when the user says "find decaying pages", "what traffic did I lose", "content decay audit", "why is traffic dropping", "which posts are declining", or pastes two GSC exports (current vs. an earlier/peak period) and asks what slipped. Works standalone from two GSC CSVs.
---

# Decay Scanner

Compare a current GSC export against an earlier peak-period export and flag pages that have lost significant organic clicks. Decay is the quiet killer of content sites — pages that once ranked slowly bleed traffic to fresher competitors or algorithm shifts. Catching it early makes refreshes cheap.

## Input

**Two** GSC exports, ideally at the **Page** level (or Query + Page):
- **Current** period (e.g. last 28 days, or last month).
- **Peak / baseline** period (the page's historical best, or same period last year to control for seasonality).

Expected columns in each: `Page` (or `Query` + `Page`), `Clicks`, `Impressions`, `CTR`, `Position`. Ask the user to confirm the date ranges and that the **window lengths match** (comparing 28 days to 90 days is meaningless — normalize or re-export). If only one file is provided, ask for the second; you cannot scan decay from a single snapshot.

## Steps

1. **Align periods.** Confirm both windows are the same length and note them in the output. If lengths differ, normalize to clicks/day before comparing and say so.
2. **Join on Page.** Match URLs across both exports (normalize trailing slashes / fragments).
3. **Compute deltas** per page: `Δclicks`, `% change`, `Δimpressions`, `Δposition`, `ΔCTR`.
4. **Flag decay** where clicks dropped **≥20%** from peak AND the page had meaningful baseline traffic (e.g. ≥50 peak clicks — skip noise). State thresholds.
5. **Assign severity:**
   - **Critical** — ≥60% drop, or lost a top-3 position, or high absolute click loss.
   - **High** — 40–60% drop.
   - **Moderate** — 20–40% drop.
6. **Diagnose likely cause** from the available signals (label your confidence):
   - **Position held, impressions/CTR fell** → likely **SERP change** (new SERP feature, AI Overview, competitor took the snippet) or **seasonality**.
   - **Position dropped, impressions fell** → likely **competition / algorithm** (someone outranked you, or a core update reweighted the page).
   - **Impressions steady, CTR dropped** → likely **SERP feature** eating clicks or a **title/meta** that aged out.
   - **Same period last year shows the same dip** → **seasonality**, not a problem to chase.
7. **Recommend action** per page tuned to cause: refresh + republish (stale content), title/meta rewrite (CTR loss), rebuild for the new dominant intent (SERP shifted), reclaim the snippet, add internal links, or "monitor — seasonal, no action."

## Output

A decay report table sorted by severity then absolute clicks lost:

| Page | Peak clicks | Current clicks | % change | Δ Position | Likely cause | Severity | Recommended action |
|------|-------------|----------------|----------|-----------|--------------|----------|--------------------|

Then a short narrative: total clicks lost across all decaying pages, the **3 highest-value refreshes** to prioritize (biggest absolute loss × easiest fix), and explicitly separate **seasonal dips (no action)** from **real decay (act now)** so the user doesn't waste effort. If a query-level export is available, name the specific queries each page lost so the refresh is targeted.
