---
name: level-up
description: Use when asked to assess skill proficiency and recommend growth actions, or when /level-up is invoked.
---

# Skill: /level-up [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md). Assess Shane's current proficiency with '[argument]' based on vault evidence. What's the next growth edge? What specific actions would level him up?"
   - `skill`: "level-up"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md).

Assess Shane's current proficiency with '[argument]' based on vault evidence. What's the next growth edge? What specific actions would level him up?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Run `obsidian search query='[argument]' limit=10` via bash to find notes related to the topic
2. Read the relevant notes by running `obsidian read file='[note name]'` via bash for each
3. Assess current proficiency based on vault evidence:
   - What does Shane demonstrate understanding of? (concepts he explains, applies, or questions at depth)
   - What's still surface-level? (concepts mentioned but not interrogated)
   - What's conspicuously absent? (things an expert in this area would typically grapple with)
4. Identify the next growth edge — the specific capability gap that, if closed, would unlock the most
5. Propose 2–3 concrete actions to level up (not generic advice — specific to what the vault shows):
   - A thing to read/learn
   - A thing to practice or build
   - A thing to write or reflect on to solidify the knowledge
6. Present the assessment to Shane
