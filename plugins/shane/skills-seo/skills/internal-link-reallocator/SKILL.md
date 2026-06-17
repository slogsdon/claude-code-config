---
name: internal-link-reallocator
description: >
  Find internal-linking opportunities to push authority from a strong "donor" page to a weaker "target" page. Use when the user says "internal links to boost a page", "reallocate link equity", "which pages should link to X", "help page B rank by linking from A", "internal link audit for a target page", or names a donor and target page with GSC data. Works standalone from GSC exports the user provides.
---

# Internal Link Reallocator

Given a strong **donor** page (A) and an underperforming **target** page (B), recommend specific internal links — with anchor text grounded in real query data — that route relevance and authority from A toward B. Internal links are the most controllable ranking lever: no outreach, no waiting, just edits you own.

## Input

- The **target page B** the user wants to boost (URL + topic/primary query).
- A **donor pool**: either one named donor page A, or a GSC Page-level export so you can *find* the best donors automatically.
- A GSC **Query + Page** export so you can ground anchor text in queries pages actually rank for: `Query`, `Page`, `Clicks`, `Impressions`, `CTR`, `Position`.

If the user only names a target, offer to scan their export and surface the best donor candidates.

## What makes a good donor

A donor should be:
1. **Topically related** to B (shares queries or is in the same topic cluster).
2. **Authoritative** — strong rankings / clicks itself (it has equity to pass).
3. **Not already linking** to B (ask the user, or note the assumption).
4. **Contextually able to mention B's topic** naturally in body copy (not a footer/nav link — in-content links carry more weight).

## Steps

1. **Profile the target B.** From the export, list B's primary query, its striking-distance queries (pos 11–20), and the terms it *wants* to rank for. These define the anchor text you're aiming for.
2. **Identify/score donors.** For the named donor A (or each candidate), check topical overlap with B and its own strength (clicks, average position). Rank donors by `strength × topical_relevance`.
3. **Derive anchor text from data, not guesses.** For each donor→target link, propose anchor text that is:
   - A query **B is trying to rank for** (so the link reinforces B's target term), and
   - A phrase that fits **A's content naturally** (use A's own ranking queries to find a sentence where the anchor belongs).
   - Vary anchors across donors (exact, partial, and descriptive) to stay natural — never identical exact-match on every link.
4. **Specify placement.** Recommend in-body placement and, where you can infer it, the section/context of A where the mention fits.

## Output

A link plan table:

| Donor page (A) | Donor strength | Suggested anchor text | Why this anchor | Placement note |
|----------------|----------------|------------------------|-----------------|----------------|

Each anchor must trace back to a real query (cite the query and its position for B). Add: a one-line statement of B's primary target query, the recommended **number of links** (typically 3–6 strong donors beats 20 weak ones), and a caution to keep anchors varied and the links genuinely contextual. If no strong topical donor exists, say so plainly — the real recommendation may be to create more cluster content rather than force unrelated links.
