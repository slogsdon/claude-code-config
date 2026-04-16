---
name: map
description: Use when asked to audit or map the structure of the knowledge graph, or when /map is invoked.
---

# Skill: /map [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Audit the structure and health of the knowledge graph around '[argument]' (or the full vault). What's well-connected, what's orphaned, what's missing?"
   - `skill`: "map"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Audit the structure and health of the knowledge graph around '[argument]' (or the full vault). What's well-connected, what's orphaned, what's missing?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. If `[argument]` is provided, search for it using `mcp__obsidian__search_notes` (vault: Personal); otherwise perform broad searches across several topic clusters
2. Read a sampling of notes using `mcp__obsidian__read_notes` — aim for breadth across different sections of the vault
3. Assess knowledge graph health:
   - **Well-connected:** notes with rich cross-references and backlinks to other notes
   - **Orphaned:** notes that exist but aren't referenced from anywhere (no inbound links)
   - **Stub clusters:** areas with shallow coverage — a topic that should have depth but only has surface notes
   - **Missing nodes:** concepts that appear as `[[links]]` in notes but don't have their own notes yet
4. If scoped to `[argument]`, produce a local map of that cluster; if broad, produce a top-level structural overview
5. Present findings as: what's healthy, what's orphaned, what's missing, and 2–3 recommended connections to add
