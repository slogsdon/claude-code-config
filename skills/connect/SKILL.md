---
name: connect
description: Use when asked to find non-obvious connections between concepts in the vault, or when /connect is invoked.
---

# Skill: /connect [argument]

Delegate to Gemma via the stepped execution protocol. Claude orchestrates; Gemma executes.

## Steps

1. Parse Shane's request and extract the argument/topic (if provided)
2. Call `mcp__ollama-agent__gemma_start` with:
   - `task`: "Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md). Find non-obvious bridges between '[argument]' and other concepts in the vault. What unexpected connections exist? What synthesis hasn't been made yet?"
   - `skill`: "connect"
   - `context`: any relevant context from the current conversation
3. Loop: if `status` is `"running"`, call `mcp__ollama-agent__gemma_continue` with `session_id`; repeat until `status` is `"done"` or `"error"`
4. Review Gemma's `result`, synthesize if needed, and present to Shane
5. Ask Shane: "Save this as a Concept page? (yes/no)"
   - If no: done.
   - If yes: ask "What's your take on this?" and wait for Shane's verbatim response
   - Create the Concept page:
     ```
     obsidian create name='Concepts/[topic]' content='## Shane'\''s Take\n\n[Shane'\''s words]\n\n## Summary / Key Points / Cross-references\n\n[synthesis output]' silent
     ```
   - Commit:
     ```bash
     VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
     git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: add Concept page for [topic]"
     ```

## Task description for Gemma

Vault access (bash only, no MCP tools): `obsidian search query='TERM' limit=10`, `obsidian read file='Note Name'` (no .md).

Find non-obvious bridges between '[argument]' and other concepts in the vault. What unexpected connections exist? What synthesis hasn't been made yet?

## Fallback (if gemma_start/gemma_continue unavailable)

Execute the skill directly:

1. Run `obsidian search query='[argument]' limit=10` via bash to find notes related to the topic
2. Read the relevant notes by running `obsidian read file='[note name]'` via bash for each
3. Search for notes in adjacent and seemingly unrelated domains to cast a wide net
4. Look for non-obvious connections:
   - Structural similarities: two ideas that have the same underlying pattern even though the surface topics differ
   - Causal links: one idea that might explain or predict something in another note
   - Tensions that illuminate: two ideas that seem to conflict but the conflict reveals something new
   - Synthesis opportunities: two notes that together imply a third insight neither states
5. Reject obvious connections — the value is in the surprising ones
6. Present 3–5 non-obvious connections, each framed as: "[Concept A] connects to [Concept B] because [non-obvious bridge]. The unexplored synthesis is [new insight]."
7. Ask Shane: "Save this as a Concept page? (yes/no)"
   - If no: done.
   - If yes: ask "What's your take on this?" and wait for Shane's verbatim response
   - Create the Concept page:
     ```
     obsidian create name='Concepts/[topic]' content='## Shane'\''s Take\n\n[Shane'\''s words]\n\n## Summary / Key Points / Cross-references\n\n[synthesis output]' silent
     ```
   - Commit:
     ```bash
     VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
     git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: add Concept page for [topic]"
     ```
