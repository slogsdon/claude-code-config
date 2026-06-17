---
name: title-tag-doctor
description: >
  Diagnose and rewrite weak title tags using GSC data — find titles with poor keyword inclusion, low CTR for their position, or intent mismatch, and generate better options. Use when the user says "fix my title tags", "improve my titles", "why is my CTR low", "rewrite page titles", "title tag audit", "low click-through rate", or provides URLs + current titles + their top queries. Works standalone from a GSC CSV plus the titles the user supplies.
---

# Title Tag Doctor

Find title tags that are leaving clicks on the table and rewrite them. A page can rank well and still under-earn if its title doesn't include the query, doesn't compel a click, or promises the wrong thing. GSC tells you exactly where: position is fine but CTR lags the benchmark for that position.

## Input

- A list of **page URLs + current title tags** (the user provides these).
- A GSC **Query + Page** export so you can see each page's top queries and its actual CTR vs position: `Query`, `Page`, `Clicks`, `Impressions`, `CTR`, `Position`.

If titles aren't provided, ask for them (or offer to fetch/read them if a URL is accessible). You need the *current* title to write a credible before/after.

## CTR-vs-position benchmark

Compare each page's CTR to the expected CTR for its average position (informational averages; vary by SERP):

| Position | ~Expected CTR |
|----------|---------------|
| 1 | 28% | 
| 2 | 15% |
| 3 | 11% |
| 5 | 7% |
| 7 | 4% |
| 10 | 2.2% |

A page at position 3 earning 4% CTR (vs ~11% expected) is **underperforming** — a title problem worth fixing. A page already above benchmark is fine; don't touch it.

## Diagnose — flag a title if it has any of:

1. **Weak keyword inclusion** — the page's top query (or its head term) isn't in the title, or is buried at the end.
2. **Low CTR for position** — actual CTR materially below the benchmark above.
3. **Intent mismatch** — title implies a different intent than the queries (e.g. queries are "best X" comparison, title is a how-to).
4. **Truncation / hygiene** — likely over ~60 chars (cut off in SERP), missing brand, duplicate boilerplate, ALL CAPS, keyword stuffing.
5. **No value proposition** — no number, year, benefit, or differentiator to earn the click.

## Rewrite — generate improved options

For each flagged page, write **1–2 new title options** that:
- Front-load the page's actual top query / head term.
- Stay ~50–60 characters (note approximate length).
- Add a click driver where honest: number, current year, benefit, "free", "guide", brand.
- Match the dominant query intent.
- Read naturally — never stuff keywords.

## Output

A before/after table:

| Page | Top query | Position | Current CTR | Expected CTR | Issue | Current title | Suggested title | Why it'll lift CTR |
|------|-----------|----------|-------------|--------------|-------|---------------|-----------------|--------------------|

Sort by upside (impressions × CTR gap) so the user fixes the highest-traffic underperformers first. For the **Why**, be concrete ("adds the exact query users search + a year for freshness; current title omits the keyword entirely"). End with the top 5 titles to change this week and a reminder that title changes take 1–2 weeks to reflect in GSC — measure CTR after.
