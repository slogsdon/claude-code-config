---
name: compound
description: Use when asked how knowledge has accumulated or compounded around a topic, or when /compound is invoked.
---

# Skill: /compound [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md). Show how knowledge about '[argument]' has accumulated and compounded in the vault. What insights build on earlier ones? What's the compounding trajectory?"
   - `skill`: "compound"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md).

Show how knowledge about '[argument]' has accumulated and compounded in the vault. What insights build on earlier ones? What's the compounding trajectory?

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Run `obsidian search query='[argument]' limit=10` via bash to find notes related to the topic
2. Read the relevant notes by running `obsidian read file='[note name]'` via bash for each, ordered chronologically where possible
3. Map the compounding structure:
   - What was the seed insight — the first or simplest version of the idea?
   - What was added on top? Which later notes build explicitly on earlier ones?
   - Where did combining two ideas produce a third that neither implied alone?
   - What's the current frontier — the most sophisticated form this knowledge has reached?
4. Identify the compounding trajectory: is the knowledge still actively compounding or has it plateaued?
5. Present as a narrative arc: seed → accumulations → synthesis → current frontier → next potential compound
6. Note any gaps where compounding stalled and why
