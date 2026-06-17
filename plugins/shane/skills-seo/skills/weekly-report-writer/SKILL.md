---
name: weekly-report-writer
description: >
  Generate a client-ready weekly SEO report from week-over-week GSC data. Use when the user says "write my weekly SEO report", "weekly GSC report", "client SEO update", "WoW performance summary", "what changed this week", or pastes current + prior week Search Console exports. Works standalone from two GSC CSVs.
---

# Weekly Report Writer

Turn two weeks of GSC data into a concise, client-ready markdown report: what changed, what moved, and what you'll do about it next week. The audience is a busy stakeholder — lead with the numbers and the plan, not raw data dumps.

## Input

**Two** GSC exports, same window length (7 days each), ideally Page or Query+Page level:
- **Current week**
- **Prior week**

Expected columns: `Query` and/or `Page`, `Clicks`, `Impressions`, `CTR`, `Position`. Confirm the two date ranges and that windows match. If only one week is given, ask for the second. Ask who the report is for (client name / brand) so you can address it.

## Steps

1. **Compute site-level WoW totals:** total Clicks, Impressions, average CTR, average Position — with absolute and % change for each. Average position improves when the number goes *down* — phrase changes in plain language ("moved up 1.4 spots").
2. **Top movers — up.** The pages/queries with the largest positive Δclicks (and note Δposition). Cap at ~5.
3. **Top movers — down.** The largest negative Δclicks. Cap at ~5. For each decliner, give a one-line plausible reason from the data (position drop, CTR drop, impressions drop = demand/seasonality vs ranking).
4. **New & lost.** Queries/pages that appeared this week (new rankings) or dropped out entirely. Highlight notable ones.
5. **Quick wins surfaced.** Note any new striking-distance (pos 11–20) queries worth chasing — feeds next week's priorities.
6. **Set 3 priorities for the coming week** — concrete, tied to the data above (e.g. "Refresh `/declining-post` — lost 40 clicks as it slipped from 6→11; update stats and re-target the primary query"). Not generic ("keep creating content").

## Output

A clean markdown report, ready to paste/send:

```
# Weekly SEO Report — [Client] — [date range] vs [prior range]

## Summary
[2–3 sentence plain-language overview: overall direction + the single most important thing.]

## Performance at a glance
| Metric | This week | Last week | Change |
|--------|-----------|-----------|--------|
| Clicks | … | … | +X (+Y%) |
| Impressions | … | … | … |
| Avg CTR | … | … | … |
| Avg position | … | … | … |

## What went up
[Top movers up — table or bullets, page/query + Δ]

## What went down
[Top movers down + likely reason each]

## Priorities for next week
1. …
2. …
3. …
```

Keep it tight and skimmable. Translate jargon for a non-technical reader. Be honest about declines — frame them with the action you'll take, not excuses. End with the one headline metric the client should remember.
