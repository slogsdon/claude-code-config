---
name: backlinks
description: Use when asked to audit backlinks or repair the knowledge graph structure, or when /backlinks is invoked.
---

# Skill: /backlinks [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Audit the vault's backlink structure around '[argument]' (or broadly). Find orphaned notes, broken connections, and opportunities to strengthen the knowledge graph."
   - `skill`: "backlinks"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Audit the vault's backlink structure around '[argument]' (or broadly). Find orphaned notes, broken connections, and opportunities to strengthen the knowledge graph.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. If `[argument]` is provided, run `obsidian search query="[argument]" limit=10` via bash; otherwise run broad searches (e.g. `obsidian search query="MOC OR index OR hub" limit=20`) via bash to sample the vault
2. Read a set of notes by running `obsidian read file="[note name]"` via bash for each — look for `[[wikilinks]]` and `[[note references]]` embedded in them
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
