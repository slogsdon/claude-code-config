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

Execute the skill directly using `mcp__obsidian__search_notes` and `mcp__obsidian__read_notes` to query the vault at ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal.
