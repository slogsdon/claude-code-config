---
name: serp-spy
description: >
  Map a competitor's ranking content for a topic and find the gaps you can exploit. Use when the user says "spy on a competitor", "what content does competitor X rank for", "competitor content gap analysis", "what's competitor.com ranking for in topic Y", "map their SERP coverage", or names a competitor domain plus a topic. Uses DataForSEO when available for live SERP/ranked-keyword data; otherwise works from SERP results the user pastes.
---

# SERP Spy

Build a content map of how a competitor covers a topic — which pages rank, for which queries, in which formats — then surface the gaps where you can win. The goal is a prioritized list of content to create or improve, derived from what's actually ranking, not guesswork.

## Input

- A **competitor domain** and a **topic** (seed keyword / theme).
- **Optional, preferred:** DataForSEO access for live data. **Otherwise:** ask the user to paste SERPs — for each of several seed queries in the topic, the top 10 organic results (URL + title), which they can copy from a manual search or an export.

## Using DataForSEO (when available)

DataForSEO meaningfully upgrades this skill. If the user has API access, pull:
- **Ranked Keywords** (`dataforseo_labs/google/ranked_keywords`) for the competitor domain filtered to the topic — gives every query the domain ranks for, with position and volume.
- **SERP API** (`serp/google/organic/live`) for the seed queries — gives the live top results, SERP features (AI Overview, People Also Ask, featured snippet, video), and competitor positions.
- **Keyword volume** to weight opportunities.

Load these via ToolSearch if a DataForSEO MCP is connected; if not, fall back to pasted SERPs and tell the user what extra precision the API would add (volume weighting, full keyword coverage, SERP-feature detection).

## Steps

1. **Collect the competitor's ranking pages** for the topic (from DataForSEO ranked keywords, or by reading which of their URLs appear across the pasted SERPs).
2. **Classify each page** by:
   - **Intent** (informational / commercial / transactional / navigational).
   - **Format** (listicle, ultimate guide, comparison/"vs", how-to tutorial, definition/glossary, tool/calculator, product/category, case study, FAQ).
   - **Sub-topic** it targets.
3. **Build the content map** — group their pages into the sub-topics and formats that cover the topic.
4. **Find gaps** by comparing their map to the user's coverage (ask for the user's site or relevant URLs if useful):
   - **Coverage gaps** — sub-topics the competitor ranks for that the user has no page for.
   - **Format gaps** — the competitor wins with a format the user hasn't tried (e.g. they have a comparison page, the user only has a blog post).
   - **Depth gaps** — both cover it, but the competitor ranks higher; note what to improve.
   - **SERP-feature gaps** (DataForSEO only) — queries where a featured snippet / PAA is winnable.

## Output

A competitor content map table:

| Competitor URL | Sub-topic | Intent | Format | Ranks for (top queries) | Est. volume* |
|----------------|-----------|--------|--------|--------------------------|--------------|

\*Volume only when DataForSEO is available; otherwise omit or mark "unknown."

Then a **gap list** prioritized by opportunity: each gap as a proposed page (working title, intent, format, target queries) and why it's winnable. End with the top 3 content pieces to create first. If working from pasted SERPs only, state the coverage limitation (you saw a sample, not their full footprint) and recommend DataForSEO for a complete keyword map.
