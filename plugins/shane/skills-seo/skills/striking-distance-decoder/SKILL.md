---
name: striking-distance-decoder
description: >
  Find "striking distance" keywords — queries ranking on page 2 (positions 11–20) that are one push away from page-1 traffic. Use when the user says "striking distance keywords", "page 2 keywords", "quick SEO wins", "low-hanging fruit", "what's almost ranking", "where's my fastest traffic upside", or pastes a GSC query export and asks what to optimize next. Works standalone from a GSC CSV.
---

# Striking Distance Decoder

Surface queries sitting in positions 11–20 and rank them by realistic traffic upside if pushed onto page 1. These are the cheapest wins in SEO: the page already ranks, Google already trusts it for the term, and a modest improvement crosses the page-1 cliff where CTR multiplies.

## Input

A GSC Queries (or Query + Page) export. Expected columns: `Query`, `Page` (optional but valuable), `Clicks`, `Impressions`, `CTR`, `Position`. Position must be present.

## CTR-by-position model

Use these approximate organic CTR benchmarks to estimate upside (state that they're industry averages and real CTR varies by SERP features, brand, and intent):

| Position | ~CTR |
|----------|------|
| 1 | 28% |
| 2 | 15% |
| 3 | 11% |
| 4 | 8% |
| 5 | 7% |
| 6 | 5% |
| 7 | 4% |
| 8 | 3% |
| 9 | 2.5% |
| 10 | 2.2% |
| 11–20 | 1–1.5% |

## Steps

1. **Filter** to rows with `Position` between **11 and 20**.
2. **Drop noise** — require a minimum impression floor (default ~50/month; scale to the export's date range) so you don't prioritize terms nobody searches. State the threshold.
3. **Estimate upside** for each query. The conservative, defensible target is **position 8–10** (realistic page-1 landing), not position 1. Compute:
   `upside_clicks ≈ Impressions × (CTR_at_target − CTR_current)`
   Use CTR_at_target for ~position 9 (≈2.5%) unless the query clearly has stronger intent. Show the math assumption.
4. **Estimate effort** per query (Low / Med / High) from signals you can see:
   - **Low** — position 11–13, page already targets the term, just needs on-page tightening (title/H2/internal link).
   - **Medium** — position 14–17, may need content expansion or a few internal links.
   - **High** — position 18–20, or the ranking URL is a weak/incidental match needing a dedicated section or new content.
5. **Prioritize** by upside-clicks ÷ effort (impact-per-effort), not raw upside alone.

## Output

A prioritized markdown table:

| Query | Page | Position | Impressions | Current clicks | Est. upside clicks/mo | Effort | First action |
|-------|------|----------|-------------|----------------|------------------------|--------|--------------|

Sort by best impact-per-effort first. The **First action** must be specific and on-page: e.g. "add the exact query to the H1 and first 100 words; add 2 internal links from `/related-post` with the query as anchor." Avoid generic advice like "improve content."

End with: the **top 5 to do this week**, total estimated upside if all top-5 land on page 1, and a note flagging any query where the ranking page looks like an intent mismatch (recommend routing it to the intent-mismatch-auditor skill instead of optimizing in place).
