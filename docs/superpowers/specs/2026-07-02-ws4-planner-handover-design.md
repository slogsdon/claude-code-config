# WS4 — Planner→Dispatch Handover (high-stakes path)

- **Date:** 2026-07-02
- **Status:** DONE (hermes-dispatch `d3c28f0`, branch merged to main)
- **Parent spec:** `2026-07-02-multi-model-agentic-workflow-design.md` §4.1, §5 (WS4)

## Purpose

Complete the two-mode planner→executor→verifier handover. The **routine** path already works
(coding-loop's `impl-planner` agent generates the spec+backlog locally — verified in WS5 D1). WS4
adds the **high-stakes** path: frontier planning happens interactively in **Claude Code** (on the
direct Claude subscription — see [[never-route-anthropic-via-openrouter]]), and its spec+plan is
seeded straight into a dispatch coding-loop with **no planner step**. dispatch executes autonomously
(pi-loop) exactly as in the routine path.

## The handover contract

The interface is the filesystem: Claude Code produces a spec+plan whose text **ends in a
`## Backlog` section of `- [ ]` items** (the same format `impl-planner` emits). That text becomes the
dispatch run's `input`. No new serialization — the backlog checklist IS the handover.

## What was built (hermes-dispatch)

- **`pipelines/coding-loop-seeded.json`** — a variant of `coding-loop` with the `impl-planner` step
  replaced by a passthrough. Steps: `spec` (passthrough: `input`→`spec`) → `backlog`
  (`extract-backlog.sh`: `input`→`backlog`) → `spec-approval` gate → `build` (pi-loop). Everything
  downstream (gate, pi-loop, test-runner, WS6 SSE, resume) is reused unchanged.
- **`bin/passthrough.sh`** — `cat` (aliases the seeded `input` to the `spec` key).
- **`bin/seed-coding-loop.sh <spec-file>`** — the adapter: validates the file has `- [ ]` items,
  then `run-pipeline.sh coding-loop-seeded "$(cat <file>)"`.
- Offline test in `tests/test_pi_loop.sh` — seeds an input with a `## Backlog`, asserts spec
  passthrough + backlog extraction + gate pause + resume→complete + backlog drained (35 pi_loop
  tests green, no model).

## Usage (the full high-stakes loop)

1. In Claude Code: `brainstorming` → `writing-plans` → a spec+plan ending in a `## Backlog` of coarse
   `- [ ]` tasks (each independently verifiable, with an acceptance check — the impl-planner rules).
2. Hand off: `cd ~/Code/hermes-dispatch && bin/seed-coding-loop.sh <plan-file>`.
3. dispatch pauses at the spec-approval gate → review → `bin/run-pipeline.sh --resume <run-id>`.
4. pi-loop executes each backlog item on the cheap/free executor (NIM), test-runner verifies; watch
   progress + halt/resume in command-center (WS6).
5. Verify: Claude Code reviews the resulting git diff against the spec (frontier review, low-volume).

This realises the note's split: **frontier plans + reviews** (Claude Code, low token volume, high
leverage) · **cheap/free executes** (dispatch pi-loop) · **local/deterministic verifies**
(test-runner). Routine work skips step 1 and uses `coding-loop` (local `impl-planner`) instead.

## Out of scope
- Auto-invoking `seed-coding-loop.sh` from inside a Claude Code session (a skill/command could wrap
  it later) — for now it's a manual hand-off command.
- WS2 key selection for the seeded run (point it at `KEY_PUBLIC`/`KEY_VAULT_PRIVATE`) — WS2 wiring.
