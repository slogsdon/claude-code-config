---
name: backlinks
description: Use when asked to audit backlinks or repair the knowledge graph structure, or when /backlinks is invoked.
---

# Skill: /backlinks [argument]

Delegate to Gemma via the stepped execution protocol. Claude drives the loop; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__plugin_shane-config_ollama-agent__gemma_start` with:
   - `task`: (see Task description for Gemma below, substituting `[argument]` if provided)
   - `skill`: "backlinks"
   - `context`: any relevant context from the current conversation
3. Parse the JSON response and loop:
   - `status: "running"` → call `mcp__plugin_shane-config_ollama-agent__gemma_continue` with the `session_id`
   - `status: "done"` → proceed to step 4
   - `status: "error"` → surface the error and stop
4. Review Gemma's `result`, synthesize if needed, and present to Shane

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md), `obsidian backlinks file='Note Name'`.

Audit the vault's backlink structure around '[argument]' (or broadly). Find orphaned notes, broken connections, and opportunities to strengthen the knowledge graph.

## Fallback (if gemma_start/gemma_continue unavailable)

Execute the skill directly:

1. If `[argument]` is provided, run `obsidian search query='[argument]' limit=10` via bash; otherwise run broad searches (e.g. `obsidian search query='MOC OR index OR hub' limit=20`) via bash to sample the vault
2. Read a set of notes by running `obsidian read file='[note name]'` via bash for each — look for `[[wikilinks]]` and `[[note references]]` embedded in them
3. Identify backlink health:
   - **Orphaned notes:** notes that exist but appear nowhere as a `[[link]]` in other notes
   - **Dead links:** `[[links]]` that reference notes that don't exist yet
   - **One-way links:** A links to B, but B never links back to A despite being clearly related
   - **Hub notes:** notes that are referenced frequently — check they're actually well-developed
4. If scoped to `[argument]`, analyze the local backlink cluster; if broad, sample across the vault
5. Present findings as:
   - Orphaned notes (list with brief description of what's isolated)
   - Dead links / missing notes worth creating
   - Recommended reciprocal links to add
   - Hub notes that need more development
6. Prioritize the top 3–5 highest-value repairs
