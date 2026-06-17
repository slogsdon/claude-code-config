---
name: cannibalization-finder
description: >
  Find keyword cannibalization in Google Search Console data — multiple URLs from the same site competing for the same queries. Use when the user says "find cannibalization", "are my pages competing", "which pages overlap", "keyword cannibalization audit", "why do my rankings keep flip-flopping", or pastes/uploads a GSC query+page export and asks which URLs fight each other. Works standalone from a GSC CSV; no external API required.
---

# Cannibalization Finder

Detect when two or more URLs on the same site rank for the same queries, splitting authority and confusing Google about which page to serve. Output a ranked list of cannibalizing pairs with a concrete consolidation decision for each.

## Input

A GSC export with **both Query and Page dimensions** (the "Pages" export alone won't work — you need the query↔page mapping). Expected columns: `Query`, `Page` (often `Landing Page`), `Clicks`, `Impressions`, `CTR`, `Position`.

If the user pastes a Queries-only or Pages-only export, ask them to re-export with **both** Query and Page columns (in GSC: Performance → Search results → Pages tab → click a page → it filters queries; or use the API / Looker Studio "Query + Landing page" table). You cannot detect cannibalization without the pairing.

## Steps

1. **Parse and normalize.** Read the CSV. Strip URL fragments and trailing slashes, lowercase queries for grouping. Confirm row count and date range with the user if visible.
2. **Group by query.** For each unique query, collect every URL that has impressions for it.
3. **Flag overlaps.** A query is **cannibalized** when **2+ URLs** each receive meaningful impressions for it. Filter noise: require each competing URL to have at least ~10 impressions for that query (state the threshold you used; let the user adjust).
4. **Score each pair.** For every cannibalizing URL pair, compute:
   - **Shared queries** — count of queries both rank for.
   - **Combined impressions** at stake across shared queries.
   - **Position spread** — are they close (both pos. 5–12, genuinely competing) or far apart (one pos. 4, one pos. 60 — usually not a real conflict)?
   - **Click split** — is traffic divided, or does one page win everything (the other is dead weight)?
5. **Decide the remedy** per pair using this logic:
   - **Same intent, one clearly stronger** → **301 redirect** the weaker into the stronger; merge any unique content first.
   - **Same intent, near-duplicate content** → **Merge** into one comprehensive page, 301 the loser.
   - **Different intent but overlapping query** → **Differentiate**: retarget one page's title/H1/content to its distinct angle, add a self-referencing canonical, cross-link.
   - **Intentional variants** (e.g. paginated, faceted, or a deliberate hub + spoke) → **Canonical** the variants to the primary.
   - **Both weak, low value** → consider consolidating or pruning.

## Output

A markdown table sorted by combined impressions at stake (highest first):

| URL A | URL B | Shared queries | Impressions at stake | Positions (A / B) | Click split | Recommendation |
|-------|-------|----------------|----------------------|-------------------|-------------|----------------|

Below the table, for the top 3–5 pairs write a one-line **why** and the **specific first action** (e.g. "301 `/blog/seo-tips-2023` → `/guides/seo-tips`; the guide already wins 80% of clicks and ranks 4 vs 14"). Note any pairs that look like *false positives* (far-apart positions, different genuine intent) so the user doesn't merge pages they shouldn't.

End with a short summary: total cannibalized queries, total impressions affected, and the single highest-impact consolidation to do first.
