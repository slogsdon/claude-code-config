---
name: expand
description: Use when asked to expand a stub or sparse note in the Obsidian vault through a targeted interview process. Reads the note, identifies gaps, asks batched questions, then rewrites the note in place with a structured expanded version. Invoke with /expand [note name or path].
---

# Skill: /expand [note name]

Expand a stub note into a structured document through a targeted interview. The note must already exist in the vault — if it doesn't, create a stub first.

## Steps

1. **Find and read the note**
   - Search the vault: `obsidian search query='[note name]'`
   - Read the full contents: `obsidian read file='[Note Name]'`
   - If not found: stop and tell Shane to create a stub note first

2. **Analyze gaps**
   - Identify what's present: explicit claims, named concepts, examples, open questions
   - Identify what's missing: definitions, examples, edge cases, stakeholders, success criteria, failure modes, intended audience, next actions
   - Note which gaps are blockers (can't structure the doc without them) vs. enriching (nice to have)

3. **Ask the first batch of targeted questions**
   - Group questions by theme (e.g. "On the core concept:", "On the audience:", "On failure modes:")
   - Ask 4–6 questions max per round — don't firehose
   - Lead with blockers; save enriching questions for later rounds
   - Wait for responses before proceeding

4. **Ask follow-up rounds as needed**
   - After each response, assess remaining gaps
   - Continue until enough is known to write a coherent structured document
   - Flag when you have enough: "I think I have enough to expand this — want me to proceed?"

5. **Rewrite the note in place**
   - Use `obsidian create name='[Note Name]' content='...' silent` to overwrite the note
   - Note: obsidian CLI `create` overwrites if the note exists. If it doesn't support overwrite, fall back to the Write tool at the full vault path (this is an accepted exception — no obsidian CLI command can overwrite arbitrary content)
   - Structure the expanded note with:
     - A clear title (H1)
     - A brief framing statement (what this is, who it's for)
     - Sections derived from the interview — let content dictate structure, don't force a template
     - An **Open Questions** section at the bottom for anything unresolved
   - Preserve any original language worth keeping; don't sanitize Shane's voice out of it

6. **Confirm completion**
   - Tell Shane the note has been updated
   - Highlight any open questions that are load-bearing (i.e. will block the next step if unresolved)

## Interview Principles

- Ask about the *why* before the *how* — motivation and audience unlock most structural decisions
- When an example exists (like a PA flow or AGENTS.md), use it as an anchor: "Is X like [example], or different in this way?"
- If an answer reveals a new gap, pursue it in the same round rather than waiting
- Carry unresolved items forward as open questions in the note — don't invent answers

## Notes

- This skill is note-targeted. The note must exist before invoking — a stub is enough.
- The expanded note replaces the stub in place; no new file is created unless Shane asks
- If the note is already well-developed, say so and ask what specifically needs expanding
