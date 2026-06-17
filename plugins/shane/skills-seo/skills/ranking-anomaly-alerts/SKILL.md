---
name: ranking-anomaly-alerts
description: >
  Detect sudden ranking or traffic anomalies in GSC time-series data — big position swings or click spikes/drops worth investigating now. Use when the user says "any ranking anomalies", "did anything spike or crash", "alert me to big changes", "what moved suddenly", "ranking volatility check", or pastes GSC data with a date dimension covering 30+ days. Uses DataForSEO to correlate with SERP/algorithm context when available; works standalone from a GSC CSV.
---

# Ranking Anomaly Alerts

Scan a GSC time series for sudden, significant movements — positions that jumped or crashed >5 spots in a week, or clicks that spiked/dropped >30% — and flag each as an alert with the date, page, query, and the first thing to investigate. This catches problems (and wins) while they're still actionable, instead of noticing a month later.

## Input

A GSC export **with a Date dimension**, covering **at least 30 days** (more is better), ideally Query+Page+Date or Page+Date. Expected columns: `Date`, `Query` and/or `Page`, `Clicks`, `Impressions`, `CTR`, `Position`.

If the export has no date column (just totals), tell the user this skill needs a time series — re-export with the **Date** dimension enabled (GSC: Performance → export → or use "Compare" / the API with date breakdown). Without dates you can't detect *when* something moved.

## Steps

1. **Build the series.** Group by Page (and Query if present), ordered by date. Decide a comparison unit — daily is noisy, so default to **week-over-week** (or rolling 7-day) and say which you used.
2. **Establish each entity's baseline** — its typical position and clicks over the period (median is more robust than mean against single-day spikes).
3. **Detect anomalies:**
   - **Position swing** — average position moved **>5 spots** between consecutive weeks (flag both gains and losses).
   - **Click anomaly** — clicks **spiked or dropped >30%** vs the entity's baseline/prior week, on a meaningful base (ignore 2→5 click noise; require a floor).
   - **Impression cliff** — impressions collapse (often the earliest sign of a ranking loss or deindexing).
   - **CTR break** — CTR halves at steady position (SERP feature took the clicks).
4. **Rank by impact** — absolute clicks at stake, not % alone. A 30% drop on a 1,000-click page beats a 90% drop on a 10-click page.
5. **Classify direction & give the first investigation step** per alert:
   - **Sudden drop, position fell** → check for a manual/algorithmic hit, a competitor's new content, an accidental noindex/redirect/canonical change, or a site change near that date.
   - **Sudden drop, position steady** → SERP feature (AI Overview / snippet lost), or seasonality — compare to last year.
   - **Sudden spike** → identify the cause (algo update favored you, viral/seasonal demand, a new SERP feature you won) so it can be reinforced.
   - **Impression cliff** → check indexing/coverage in GSC immediately.

## DataForSEO enhancement (when available)

DataForSEO materially sharpens this skill — it adds the *why* GSC can't:
- **Algorithm-update correlation** — line up anomaly dates against known Google update timelines to separate "core update hit you" from "you broke something."
- **Live SERP check** (`serp/google/organic/live`) for the affected query — see who replaced you and whether a SERP feature (AI Overview, featured snippet, PAA) now dominates.
- **Competitor movement** — did a specific competitor surge on that query the same week?

Load DataForSEO tools via ToolSearch if a connector is present. Without it, flag the anomaly and date and tell the user to manually check the SERP and Google update history for that window.

## Output

An alert table sorted by impact (absolute clicks at stake):

| Date / week | Page | Query | Anomaly type | Before → after | Δ | Direction | First investigation step |
|-------------|------|-------|--------------|----------------|---|-----------|--------------------------|

Lead with the single most urgent alert in one sentence. Separate **drops needing action** from **spikes to reinforce**, and explicitly mark anything that looks **seasonal / expected** so the user doesn't chase ghosts. Note the comparison method and thresholds you used so results are reproducible.
