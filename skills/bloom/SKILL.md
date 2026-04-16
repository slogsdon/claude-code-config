---
name: bloom
description: Use when asked to map branching questions or lines of inquiry from a topic, or when /bloom is invoked.
---

# Skill: /bloom [argument]

Delegate to Gemma via `run_gemma_task`. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__run_gemma_task` with:
   - `task`: "Map how the question '[argument]' branches into sub-questions across the vault. What related questions does it open up? Create a bloom of inquiry."
   - `skill`: "bloom"
   - `context`: any relevant context from the current conversation
3. Review Gemma's response, synthesize if needed, and present to Shane

## Task description for Gemma

Map how the question '[argument]' branches into sub-questions across the vault. What related questions does it open up? Create a bloom of inquiry.

## Fallback (if run_gemma_task unavailable)

Execute the skill directly:

1. Run `obsidian search query="[argument]" limit=10` via bash to find notes touching on the topic
2. Read the most relevant notes by running `obsidian read file="[note name]"` via bash for each
3. Generate a bloom of inquiry — map the question space branching from `[argument]`:
   - **Level 1 (direct sub-questions):** What are the immediate follow-on questions this topic raises?
   - **Level 2 (adjacent questions):** What related topics does this connect to? What domains share the same underlying structure?
   - **Level 3 (meta questions):** What assumptions are baked into how `[argument]` is framed? What would a fundamentally different framing look like?
4. Note which branches are already explored in the vault vs. which are blank
5. Present the bloom as a structured map — not a flat list, but a tree showing how questions relate and nest
6. Suggest 1–2 unexplored branches most worth pursuing
