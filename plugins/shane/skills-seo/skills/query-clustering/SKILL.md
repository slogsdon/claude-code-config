---
name: query-clustering
description: >
  Cluster a large GSC query list into topics and search intents, then map each cluster to a page or flag it as a content gap. Use when the user says "cluster my keywords", "group these queries", "topic clusters from GSC", "organize my search queries", "what content gaps do I have", "keyword grouping", or pastes a big query export. Works standalone from a GSC CSV.
---

# Query Clustering

Take a sprawling GSC query list and organize it into semantic topic clusters tagged by search intent, then assign each cluster to an existing page or flag it as a gap. This turns a flat keyword list into a content map you can act on — one page per cluster, hub-and-spoke structure, clear gaps.

## Input

A GSC Queries export (Query + Page is ideal so clusters can be mapped to URLs): `Query`, `Page` (optional), `Clicks`, `Impressions`, `CTR`, `Position`. For large lists (hundreds–thousands of rows), work from the export rather than asking the user to retype.

## Steps

1. **Clean and dedupe.** Lowercase, trim, drop near-duplicates (singular/plural, word order). Note total unique queries and combined impressions.
2. **Cluster semantically.** Group queries that share a core topic/entity and would be satisfied by the *same page*. Use your language understanding, not just string matching — "how to start a podcast", "starting a podcast", "podcast for beginners" are one cluster; "best podcast microphone" is a different cluster (commercial, different page). Aim for clusters that map to a single piece of content.
3. **Name each cluster** with its head term (the highest-volume / most representative query).
4. **Tag intent** for the cluster (and note if it's mixed):
   - **Informational** — learn/understand.
   - **Navigational** — find a specific brand/site/tool.
   - **Commercial** — research before buying ("best", "vs", "review").
   - **Transactional** — ready to act ("buy", "price", "hire", "near me").
5. **Size each cluster:** total impressions, total clicks, best/avg position, query count.
6. **Map to pages.** If Page data is present, find the URL(s) the cluster already ranks through:
   - **One page owns it** → assign; note if it's underperforming (striking distance → optimize).
   - **Multiple pages split it** → flag potential cannibalization (route to cannibalization-finder).
   - **No page / only incidental rankings** → **content gap** — recommend a new page for that intent.

## Output

A cluster table sorted by total impressions:

| Cluster (head term) | Intent | Queries | Impressions | Clicks | Avg position | Mapped page / status |
|---------------------|--------|---------|-------------|--------|--------------|----------------------|

Status values: `Owned` (page X), `Underperforming` (page X, pos N — optimize), `Split` (cannibalization risk), or `GAP — create page`.

Below the table: list the **content gaps** as proposed pages (working title + intent + the cluster's top queries), and the **highest-value existing clusters to optimize**. End with cluster count, total impressions covered, and how many net-new pages the gaps justify. If the user wants, offer to expand any single cluster into a full content brief.
