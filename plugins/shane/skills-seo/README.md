# skills-seo

10 Claude SEO skills powered by **Google Search Console** data. Each skill works standalone from a GSC CSV export you paste or upload — no API setup required. Two skills (SERP Spy, Ranking Anomaly Alerts) optionally use **DataForSEO** for live SERP and algorithm context when a connector is available.

## What you need

Most skills expect a GSC Performance export with these columns:

`Query` · `Page` · `Clicks` · `Impressions` · `CTR` · `Position`

Export it from **Search Console → Performance → Search results → Export**. Several skills need the **Query + Page** pairing (cannibalization, intent mismatch, clustering, link reallocation) — in GSC, export the "Queries" table while filtered to a page, or use the API / Looker Studio "Query + Landing page" table. Time-based skills (Decay Scanner, Weekly Report, Ranking Anomaly Alerts) need **two periods** or a **Date** dimension.

## The skills

| Skill | What it does | Input |
|-------|--------------|-------|
| **cannibalization-finder** | Flags URLs competing for the same queries; recommends 301 / canonical / merge | Query + Page export |
| **striking-distance-decoder** | Surfaces position 11–20 queries ranked by traffic upside + effort | Query export (with Position) |
| **decay-scanner** | Compares current vs. peak period; flags pages that lost 20%+ clicks | Two exports (current + baseline) |
| **intent-mismatch-auditor** | Checks whether ranked queries match what each page delivers | Query + Page export + page titles |
| **internal-link-reallocator** | Recommends internal links + data-grounded anchors from a donor to a target page | Query + Page export + donor/target |
| **serp-spy** | Maps a competitor's topic coverage and finds content gaps | Competitor + topic (DataForSEO or pasted SERPs) |
| **weekly-report-writer** | Client-ready WoW report with top movers + 3 next-week priorities | Current + prior week exports |
| **query-clustering** | Clusters queries by topic + intent; maps to pages or flags gaps | Query export (large) |
| **title-tag-doctor** | Finds low-CTR-for-position titles; rewrites them | URLs + titles + Query + Page export |
| **ranking-anomaly-alerts** | Detects >5-spot position swings and >30% click moves | Export with Date dimension, 30+ days |

## DataForSEO (optional)

**SERP Spy** and **Ranking Anomaly Alerts** are enhanced by DataForSEO — live SERP results, ranked-keyword coverage, search volume, SERP-feature detection, and algorithm-update correlation that GSC alone can't provide. If a DataForSEO MCP connector is present the skills use it automatically; otherwise they fall back to GSC data plus SERPs you paste, and tell you what extra precision the API would add.

## Usage

Just describe what you want and paste your export — the skill triggers on natural phrasing (e.g. "find cannibalization in this GSC data", "what's in striking distance", "write my weekly SEO report"). Each skill states the thresholds it used so results are reproducible and tunable.
