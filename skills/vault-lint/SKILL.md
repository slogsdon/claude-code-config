---
name: vault-lint
description: Use when /vault-lint is invoked or when Shane wants a weekly vault health check. Scans Concepts/ and the broader vault for contradictions, orphan pages, missing Concept pages, and stale claims.
---

# Skill: /vault-lint

Weekly vault health check. Output is actionable — specific things to fix, not a report for its own sake.

## Steps

1. Run the four scans below using `obsidian` CLI commands via bash
2. Collate results into a prioritized action list
3. Present findings grouped by category with specific file names and fix instructions
4. Do NOT auto-fix anything — surface for Shane to decide

## Scan 1 — Contradictions between Concept pages

```bash
obsidian search query='Concepts/' limit=50
```

For each Concept page found, read it. Compare claims across pages. Flag pairs where one page asserts X and another asserts not-X (or a materially different position on the same topic).

Output format:
```
CONTRADICTION: Concepts/[A] vs Concepts/[B]
  [A] says: "[quote]"
  [B] says: "[quote]"
  → Resolve by: updating whichever is older or merging into a single page
```

## Scan 2 — Orphan pages (no inbound links)

```bash
obsidian search query='[[' limit=100
```

Read each page that contains wiki-links and collect every `[[linked page]]` reference. Any Concept page that appears in zero link lists is an orphan.

Output format:
```
ORPHAN: Concepts/[page]
  Created: [date if available]
  → Link from a related note or delete if superseded
```

## Scan 3 — Concepts mentioned 3+ times without a dedicated page

```bash
obsidian search query='TERM' limit=20
```

Run searches for noun phrases that appear frequently across the vault. Count mentions. Any term appearing 3+ times that does NOT have a matching file in Concepts/ is a gap.

Strategy: search for terms surfaced during recent /connect and /trace runs first; also scan Daily Notes for recurring nouns.

Output format:
```
MISSING CONCEPT: "[term]" (N mentions, no Concepts/[term] page)
  Seen in: [list of note names]
  → Create Concepts/[term] page
```

## Scan 4 — Stale claims superseded by newer sources

```bash
obsidian search query='Clippings/' limit=30
```

For each Concept page, check if any claim is contradicted or significantly updated by a more recent Clipping. Look for:
- Dates cited in Concept pages that are older than 2 years
- Clippings that explicitly update or retract a prior claim
- Concepts referencing statistics or studies where a newer Clipping cites updated data

Output format:
```
STALE: Concepts/[page]
  Claim: "[quote from concept page]"
  Superseded by: Clippings/[newer source] ([date])
  → Update claim or add caveat in Concepts/[page]
```

## Fallback (if gemma unavailable)

Execute all four scans directly using `obsidian search` and `obsidian read` commands via bash. Apply the same logic described above. The scans are bash-executable without Gemma.

## Output structure

Present findings in this order, most actionable first:

1. **Contradictions** (fix these — they corrupt the knowledge base)
2. **Missing Concepts** (create these — reduces future orphan risk)
3. **Orphans** (link or delete)
4. **Stale claims** (update or caveat)

End with a one-line summary: "N issues found across Concepts/ — X contradictions, Y orphans, Z missing pages, W stale claims."
