# Plan B — Workflow Skills (Pipelines)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 5 workflow skills that orchestrate existing skills in defined sequences with checkpoints, so Shane can invoke `/workflow-design`, `/workflow-feature-spec`, `/workflow-stage-draft`, `/workflow-vault-weekly`, or `/workflow-monthly-skill-audit` instead of remembering which skills to chain.

**Architecture:** A workflow skill is a standard SKILL.md whose body lists numbered orchestration steps. Each step says "Invoke `<skill-name>` via the Skill tool with these arguments / outputs", then "Confirm with user before continuing" or "Auto-continue if the previous output meets <criterion>". No new framework — workflows are plain skills that drive other skills via the Skill tool, the same way `publish-post` already does.

**Tech Stack:** Markdown only. Existing `Skill` tool to invoke sub-skills. Optional: a small bash helper at `skills/_workflow-lib/run-step.sh` if a step needs argument passthrough that doesn't fit cleanly in markdown — but only add that if a workflow actually needs it.

---

## Assumptions to Confirm

1. **Naming convention:** `workflow-<noun>` (singular, kebab-case). Slash commands are auto-derived (`/workflow-design`).
2. **Checkpoint default:** workflows pause for user confirmation between major stages, NOT between every sub-step. Stage = each numbered top-level step in the SKILL.md body.
3. **Override:** user can pass `--no-pause` (passed through args) to run end-to-end without checkpoints — useful for cron-driven runs of the audit / weekly workflow.
4. **Composition rule:** workflow skills only call skills that already exist or are part of this plan. They do not add behavior the underlying skill doesn't already have.
5. **Out of scope:** `publish-post` (already a workflow-shaped skill — confirmed); the existing daily rituals (`/morning`, `/eod`, `/plan-tomorrow`) which are intentional small commands, not pipelines.
6. **Failure handling:** if a sub-skill errors, the workflow stops at that stage and tells the user which step failed and what to do (re-run that step manually, or re-invoke the workflow with `--resume-from <step>`). The `--resume-from` flag is documented in each workflow but only implemented if a workflow actually needs it (YAGNI — most won't).

If user wants a different naming convention or a different checkpoint default, only Tasks 2–5 SKILL.md content changes.

---

## File Structure

- New: `skills/workflow-design/SKILL.md` — design pipeline orchestrator
- New: `skills/workflow-feature-spec/SKILL.md` — biz-brief → brainstorming → writing-plans
- New: `skills/workflow-stage-draft/SKILL.md` — idea → draft → humanize → ms-style-pass (sets up handoff to publish-post)
- New: `skills/workflow-vault-weekly/SKILL.md` — vault-lint → backlinks → vault-index → weekly-signals → weekly-learnings
- New: `skills/workflow-monthly-skill-audit/SKILL.md` — skill-audit → consolidate-memory → vault-lint
- New: `skills/_workflow-lib/README.md` — shared conventions (checkpoint format, arg passthrough, exit/resume protocol). Underscore-prefixed so it doesn't register as a skill itself.
- Updated: `skills/skill-audit/SKILL.md` — add a back-reference to `workflow-monthly-skill-audit` under "Output destination" so users discover the workflow.
- Updated: `skills/publish-post/SKILL.md` — add a back-reference to `workflow-stage-draft` (drafting upstream of publish-post).

Each workflow skill is one file; total ≈ 6 SKILL.md files plus 1 README.

---

### Task 1: Define shared workflow conventions

**Files:**
- Create: `skills/_workflow-lib/README.md`

- [ ] **Step 1: Write the conventions doc**

Create `skills/_workflow-lib/README.md` with this exact content:

````markdown
# Workflow Skill Conventions

> Internal reference for skills under `skills/workflow-*`. Underscore-prefixed dir so it isn't registered as a skill.

## Anatomy of a workflow skill

A workflow skill is a standard SKILL.md whose body is a numbered orchestration of existing skills. It does not introduce new behavior — it sequences and checkpoints the skills it calls.

```yaml
---
name: workflow-<noun>
description: <Use when …, situational triggers, slash command, what it pipelines>
---

# Skill: /workflow-<noun>

<One paragraph: what this pipelines, why this exists vs running the steps manually>

## Stages

### Stage 1: <Stage name> — invokes `<skill>`
- What it does
- What it produces (file path, vault note, in-conversation output)
- Checkpoint: pause for user confirmation before Stage 2

### Stage 2: …

## Resume / skip

To re-run from a specific stage: pass `--resume-from <N>` (e.g. `/workflow-design --resume-from 3`).
To skip a stage: pass `--skip <N>`.

## Failure handling

If a stage errors, stop. Print the failed stage + the underlying skill's error. Suggest: "Re-run this stage manually with `<skill>`, fix the issue, then resume with `--resume-from <N>`."
```

## Checkpoint format

Between stages, output exactly:

```
─── Stage <N> complete ───
<one-line summary of what was produced>

Continue to Stage <N+1>: <next stage name>? (y/n/skip):
```

If the user passes `--no-pause`, skip checkpoints entirely.

## Calling sub-skills

Use the `Skill` tool. Pass arguments via the skill's documented `args` shape — do not invent new conventions. If a sub-skill takes free-text args (most do), the workflow constructs them from prior-stage outputs.

## What workflow skills must NOT do

- Re-implement logic that lives in the underlying skill. If `design-system` already creates `tokens.css`, the workflow just calls it; it does not write tokens.css itself.
- Add side effects that aren't documented in the underlying skill's "Output" section.
- Skip sub-skill verification steps. If a stage's underlying skill has an output checklist, the workflow waits for it to be satisfied.
````

- [ ] **Step 2: Commit**

```bash
git add skills/_workflow-lib/README.md
git commit -m "docs: add workflow skill conventions reference"
```

---

### Task 2: Create `workflow-design` (design pipeline)

**Files:**
- Create: `skills/workflow-design/SKILL.md`

The pipeline: design-plan → design-system → individual artifact skill → screenshot-html. Each stage has clear handoff outputs.

- [ ] **Step 1: Write the SKILL.md**

Create `skills/workflow-design/SKILL.md` with:

````markdown
---
name: workflow-design
description: Run the full design pipeline for a brand or one-off artifact — design-plan (strategy) → design-system (tokens + showcase) → an artifact skill (linkedin / blog-hero / etc.) → screenshot-html (PNG export). Use when the user says "design a brand", "I need the full design system + assets", "set up a new brand from scratch", "design pipeline for X", or when starting visual work on a brand that has no DESIGN.md yet. Do NOT use when the brand already exists and you just need one artifact — call the artifact skill directly.
---

# Skill: /workflow-design

Orchestrates the four-stage design pipeline. Replaces the "which design skill comes first" question with a single invocation.

## When to use

- Brand has no `./design/<slug>/DESIGN.md` yet AND user wants one or more artifacts.
- User explicitly asks for "the full pipeline" / "set up the brand from scratch".

## When NOT to use

- Brand already has a design system; just need one artifact → call the artifact skill directly.
- User wants to iterate on existing tokens → call `design-system` directly.

## Stages

### Stage 1: Strategic intent — invokes `design-plan`

Asks the brand-strategy questions (audience, voice, hard NOs, mood references) and writes `./design/<slug>/DESIGN-PLAN.md`.

Output: `./design/<slug>/DESIGN-PLAN.md` exists.
Checkpoint: confirm DESIGN-PLAN.md before generating tokens.

### Stage 2: Token system — invokes `design-system`

Reads DESIGN-PLAN.md and produces `DESIGN.md` (Google design.md spec format), `tokens.css`, and `showcase.html`.

Output: three files in `./design/<slug>/`.
Checkpoint: confirm `showcase.html` renders correctly in a browser before generating any artifacts.

### Stage 3: Artifact generation — invokes the artifact skill the user named

Asks: "Which artifact(s) do you want to generate? (linkedin-post / instagram-post / blog-hero / quote-card / business-card / podcast-cover / youtube-thumbnail / twitter-card / newsletter-header / talk-slide / speaker-bio-card / twitch-panels / obs-alert-overlay / obs-scene-pack / stream-overlay / link-in-bio / landing-page / ui-components / carousel-slide / youtube-channel-art / audit-report)"

For each chosen artifact, invokes the matching `design-<artifact>` skill with the brand slug. Produces an HTML file in `./design/<slug>/artifacts/`.

Output: one or more `.html` files in `artifacts/`.
Checkpoint: confirm artifacts before screenshotting.

### Stage 4: PNG export — invokes `screenshot-html`

Runs the screenshot-html script against `./design/<slug>/artifacts` with output to `./design/<slug>/screenshots`.

Output: PNG files matching the artifact set.

## Resume / skip

- `--resume-from <N>` to start from stage N (skips earlier stages).
- `--skip <N>` to skip stage N (e.g. `--skip 4` if user only wants HTML, no PNGs).
- `--no-pause` to run end-to-end without checkpoints.

## Failure handling

If any stage errors, stop and print: which stage failed, the underlying skill's error, and the resume command (`/workflow-design --resume-from <N>`).
````

- [ ] **Step 2: Commit**

```bash
git add skills/workflow-design/SKILL.md
git commit -m "feat: add workflow-design skill (design-plan → system → artifact → screenshot)"
```

---

### Task 3: Create `workflow-feature-spec` (biz-brief → brainstorming → writing-plans)

**Files:**
- Create: `skills/workflow-feature-spec/SKILL.md`

- [ ] **Step 1: Write the SKILL.md**

Create `skills/workflow-feature-spec/SKILL.md` with:

````markdown
---
name: workflow-feature-spec
description: Run the full feature-spec pipeline for a new product / feature with commercial stakes — biz-brief (business context) → superpowers:brainstorming (technical spec) → superpowers:writing-plans (implementation plan). Use when the user says "let's build X", "I want to ship Y", "spec out this feature", "go from idea to plan for Z", or when starting any new feature with a user / market / business model. Do NOT use for purely internal tooling (skip biz-brief; go straight to brainstorming) or for bug fixes (use debugging-and-error-recovery instead).
---

# Skill: /workflow-feature-spec

Pipeline that takes a fuzzy feature idea and ends with an executable implementation plan grounded in business intent + technical spec.

## When to use

- New feature / product / initiative with commercial stakes.
- The user is at the "let's build X" stage; no spec yet.

## When NOT to use

- Internal tooling with no user/market layer → call `superpowers:brainstorming` directly.
- Bug fix → use the debug-and-fix flow instead.
- Already have a spec → call `superpowers:writing-plans` directly.

## Stages

### Stage 1: Business context — invokes `biz-brief`

Generates a 1-page Business Context Brief and saves it to `docs/superpowers/briefs/YYYY-MM-DD-<feature>.md`.

Output: brief file exists.
Checkpoint: confirm brief is accurate before brainstorming.

### Stage 2: Technical spec — invokes `superpowers:brainstorming`

Brainstorms the technical spec with the brief loaded as context. Saves spec to `docs/superpowers/specs/YYYY-MM-DD-<feature>.md`.

Output: spec file exists.
Checkpoint: confirm spec coverage before writing the plan.

### Stage 3: Implementation plan — invokes `superpowers:writing-plans`

Reads the spec and produces a task-by-task plan at `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`.

Output: plan file exists, ready to hand off to `subagent-driven-development` or `executing-plans`.

## Resume / skip

- `--resume-from <N>` to start from stage N.
- `--no-pause` to run end-to-end (rare — usually you want the checkpoints here).

## Failure handling

Brainstorming and writing-plans both have their own surface-assumptions / push-back behaviors built in. The workflow does not paper over those — when a sub-skill asks a clarifying question, the workflow surfaces it to the user.
````

- [ ] **Step 2: Commit**

```bash
git add skills/workflow-feature-spec/SKILL.md
git commit -m "feat: add workflow-feature-spec skill (biz-brief → brainstorm → plan)"
```

---

### Task 4: Create `workflow-vault-weekly` (vault health pipeline)

**Files:**
- Create: `skills/workflow-vault-weekly/SKILL.md`

- [ ] **Step 1: Write the SKILL.md**

Create `skills/workflow-vault-weekly/SKILL.md` with:

````markdown
---
name: workflow-vault-weekly
description: Run the full weekly vault-health pipeline — vault-lint (consistency check) → backlinks (graph repair) → vault-index (rebuild overview) → weekly-signals (deferral / pattern surface) → weekly-learnings (publishable thread surface). Use when /weekly-review is invoked, on Friday afternoons, when the user says "weekly vault review", "audit my vault", "what should I publish this week", or after a week of heavy capture activity. Skips stages whose preconditions aren't met (e.g. weekly-learnings needs ≥3 daily notes from the week).
---

# Skill: /workflow-vault-weekly

Runs the five vault-health skills in dependency order so the later stages have current data from the earlier ones. Use weekly.

## When to use

- Friday-afternoon vault review.
- After a week of heavy note capture, before reviewing for patterns.
- The user explicitly says "weekly vault review" / "what should I publish this week".

## When NOT to use

- Daily; the daily rituals (`/morning`, `/eod`, `/log`) cover the within-day cadence.
- For specific known issues (one orphan note, one stale tag) — call the targeted skill directly.

## Stages

### Stage 1: Lint — invokes `vault-lint`

Scans Concepts/, finds orphans, broken links, missing pages, contradictions. Writes `vault-lint-report.md`.

Output: report file exists.
Checkpoint: surface any blocking issues before continuing.

### Stage 2: Backlinks — invokes `backlinks`

Audits and repairs the backlink graph; flags structurally important orphans.

Output: backlink-audit summary in conversation.
Checkpoint: confirm fixes applied before rebuilding the index.

### Stage 3: Vault index — invokes `vault-index`

Rebuilds the vault-index note from current state.

Output: `vault-index.md` updated.
Checkpoint: skip checkpoint by default — auto-continue.

### Stage 4: Weekly signals — invokes `weekly-signals`

Reads `patterns.md` + the week's daily notes; surfaces deferral patterns and flagged items.

Output: weekly-signals output (in conversation; can be saved if user asks).
Checkpoint: confirm signal review before surfacing publishable threads.

### Stage 5: Weekly learnings — invokes `weekly-learnings`

Looks for publishable threads from the week's signals + vault deltas.

Output: list of 1–3 candidate threads.

## Resume / skip

- `--resume-from <N>` to start from stage N.
- `--skip <N>` to skip stage N (e.g. `--skip 5` to stop after signals).
- `--no-pause` to run end-to-end (use this for the cron-driven weekly run).
````

- [ ] **Step 2: Commit**

```bash
git add skills/workflow-vault-weekly/SKILL.md
git commit -m "feat: add workflow-vault-weekly skill (lint → backlinks → index → signals → learnings)"
```

---

### Task 5: Create `workflow-monthly-skill-audit` (monthly skill-set hygiene)

**Files:**
- Create: `skills/workflow-monthly-skill-audit/SKILL.md`
- Modify: `skills/skill-audit/SKILL.md` — add cross-reference under "Output destination"

- [ ] **Step 1: Write the SKILL.md**

Create `skills/workflow-monthly-skill-audit/SKILL.md` with:

````markdown
---
name: workflow-monthly-skill-audit
description: Run the monthly Claude Code skill hygiene pipeline — skill-audit (rank skills by usage + quality) → consolidate-memory (prune stale memories) → vault-lint (catch orphans created by deprecated workflows). Use when the 1st of the month rolls around, when the user says "monthly skill audit", "is my context layer healthy", "skill hygiene check", or after deprecating a workflow / removing a skill. Do NOT use for single-skill review (read the SKILL.md directly) or in the same week as the last audit. Output goes to ~/Downloads + Inbox/.
---

# Skill: /workflow-monthly-skill-audit

Three-stage hygiene pipeline. Mirrors the message of the LLM-context-files post: context decays without maintenance.

## When to use

- 1st of every month (cron candidate — pair with `/loop` or `/schedule`).
- After deprecating a workflow or removing skills, to catch downstream effects.
- When the user explicitly asks "is my skill layer healthy".

## When NOT to use

- Single-skill review → read the SKILL.md directly.
- Inside the same week as the last audit — usage data won't have shifted.

## Stages

### Stage 1: Skill audit — invokes `skill-audit`

Produces `~/Downloads/skill-audit-report.md`.

Output: report file exists.
Checkpoint: review top/bottom 5 before pruning memory.

### Stage 2: Memory consolidation — invokes `anthropic-skills:consolidate-memory`

Reflective pass over MEMORY.md; merges duplicates, prunes stale facts, fixes the index.

Output: MEMORY.md updated; commit summary in conversation.
Checkpoint: confirm memory edits look correct.

### Stage 3: Vault lint — invokes `vault-lint`

Catches orphan notes / broken links that may have been left by deprecated workflows.

Output: lint report in conversation.

## Resume / skip

- `--resume-from <N>` to start from stage N.
- `--no-pause` for cron-driven runs.

## Output destination

Stage 1 report goes to `~/Downloads/skill-audit-report.md` and is auto-copied to vault `Inbox/Skill Audit YYYY-MM-DD.md` if the user opts in (asked at Stage 1 checkpoint).
````

- [ ] **Step 2: Add cross-reference to skill-audit/SKILL.md**

Open `skills/skill-audit/SKILL.md`. Find the `## Output destination` section. Append a final paragraph:

```markdown
For monthly hygiene, prefer `/workflow-monthly-skill-audit` — it pairs this audit with `consolidate-memory` and `vault-lint` so downstream context layers get cleaned in the same pass.
```

- [ ] **Step 3: Commit**

```bash
git add skills/workflow-monthly-skill-audit/SKILL.md skills/skill-audit/SKILL.md
git commit -m "feat: add workflow-monthly-skill-audit and cross-reference from skill-audit"
```

---

### Task 6: Create `workflow-stage-draft` (drafting pipeline upstream of publish-post)

**Files:**
- Create: `skills/workflow-stage-draft/SKILL.md`
- Modify: `skills/publish-post/SKILL.md` — add cross-reference

The pipeline: idea → first draft (skill-author or ghost-author depending on voice) → `humanize` → `ms-style-pass` → ready for `publish-post`. Stops *before* publish-post so the user can review one last time before the heavyweight publishing pipeline fires.

- [ ] **Step 1: Write the SKILL.md**

Create `skills/workflow-stage-draft/SKILL.md` with:

````markdown
---
name: workflow-stage-draft
description: Draft a blog post or article and prepare it for publishing — idea → first draft → humanize (remove AI-typical patterns) → ms-style-pass (term + bias + heading conventions). Use when the user says "draft a post about X", "write up this idea as a blog", "prepare a draft on Y", "stage a draft for publishing", or after /learned surfaces a publishable thread. Hands off to publish-post for the heavyweight pipeline (artifact generation + publishing); does NOT publish itself.
---

# Skill: /workflow-stage-draft

Three-stage drafting pipeline. Outputs a clean, voice-corrected, style-checked draft that's ready for `/publish-post` to take over.

## When to use

- User says "draft a post on X" / "write this up as a blog" / "prepare a draft on Y".
- A `/learned` or `/weekly-learnings` run surfaced a publishable thread and the user wants to develop it.
- An existing draft needs a voice + style pass before publishing.

## When NOT to use

- The piece is already drafted AND voice-corrected → call `/publish-post` directly.
- Capturing notes, not drafting → use `/log` or the obsidian skill.
- Ghost-writing in a different voice → use `/ghost` first, then this workflow.

## Stages

### Stage 1: First draft

Two paths depending on the input:

- **From an idea / outline** (no existing draft): write a first draft in Shane's voice, anchored on whatever vault evidence exists. ~600–1200 words. Save to `Inbox/Draft - <slug>.md`.
- **From an existing draft** (user pastes or names a vault note): read it; skip drafting; proceed to Stage 2.

Output: draft file in vault Inbox.
Checkpoint: confirm draft direction before voice pass.

### Stage 2: Voice pass — invokes `humanize`

Removes AI-typical patterns (hedging, list-iness, em-dash overuse, throat-clearing) and restores Shane's conversational rhythm. Preserves technical precision.

Output: humanized draft (in-place edit to the Inbox file).
Checkpoint: skim before style pass.

### Stage 3: Style pass — invokes `ms-style-pass`

Applies Microsoft Writing Style Guide term preferences, bias-free language rules, and heading conventions. Doesn't touch voice.

Output: style-corrected draft (in-place edit).
Checkpoint: confirm draft is publish-ready before handoff.

### Handoff (NOT a stage — explicit to user)

After Stage 3, print:

```
─── Draft staged ───
File: Inbox/Draft - <slug>.md
Word count: <N>

Ready for /publish-post when you are. That skill will:
  - generate brand artifacts (blog hero, OG card, LinkedIn companion)
  - run any final style checks
  - publish to shane.logsdon.io

Or, to iterate first: edit the draft directly and re-run /workflow-stage-draft --resume-from 2.
```

## Resume / skip

- `--resume-from <N>` to start from stage N (e.g. user edits the draft manually, then `--resume-from 2` re-runs humanize).
- `--skip <N>` to bypass a stage (rarely useful here — the stages are tight).
- `--no-pause` to run end-to-end (use only when you've already iterated and just want a final pass).

## Failure handling

If Stage 2 (humanize) flags content it can't safely de-AI without losing technical accuracy, it stops and surfaces the conflict to the user. Stage 3 then operates on whatever Stage 2 produced.
````

- [ ] **Step 2: Add cross-reference in publish-post**

Open `skills/publish-post/SKILL.md`. Locate the "When to use" or "Inputs" section. Append a paragraph:

```markdown
For drafting upstream of this skill, use `/workflow-stage-draft` — it covers the idea → draft → humanize → ms-style-pass chain that gets a piece ready for publish-post. This skill assumes the draft is already voice-corrected and style-checked.
```

- [ ] **Step 3: Commit**

```bash
git add skills/workflow-stage-draft/SKILL.md skills/publish-post/SKILL.md
git commit -m "feat: add workflow-stage-draft skill (idea → draft → humanize → ms-style-pass)"
```

---

### Task 7: Smoke-test each workflow end-to-end (dry-run mode)

**Files:**
- Read: each workflow SKILL.md created in Tasks 2–5

These are skills, not scripts — there's no test harness. Smoke-testing means invoking each via `Skill` and confirming the orchestration shape works (calls the right sub-skills in order, checkpoints fire, resume flag works on a stage skip).

- [ ] **Step 1: Smoke-test `workflow-design`**

In a fresh chat session: invoke `/workflow-design` with a throwaway brand slug like `test-brand-2026-05-08`. At Stage 1 checkpoint, confirm. At Stage 2 checkpoint, confirm or abort. The point is verifying stages fire in order and the SKILL.md instructions resolve into actual skill invocations.

Pass criterion: Stages 1 → 2 fire correctly. Abort after Stage 2 verification (don't generate real artifacts for a throwaway brand).

- [ ] **Step 2: Smoke-test `workflow-feature-spec`**

Invoke with a fake feature name like "test-feature-2026-05-08". Confirm Stage 1 (biz-brief) generates a brief file. Abort before Stage 2.

- [ ] **Step 3: Smoke-test `workflow-stage-draft`**

Invoke with a throwaway topic like "skill audit retro". Confirm Stage 1 produces a draft file in `Inbox/`. Confirm Stage 2 invokes humanize. Abort before Stage 3 to avoid an unnecessary style pass on a throwaway draft.

- [ ] **Step 4: Smoke-test `workflow-vault-weekly` with `--skip 4 --skip 5`**

Run the workflow but skip the slowest stages. Confirm the lint + backlinks + index stages chain.

- [ ] **Step 5: Smoke-test `workflow-monthly-skill-audit` with `--skip 2 --skip 3`**

Run only Stage 1 (skill-audit). Confirm it produces the report. Confirm Stage 2 / 3 are correctly skipped.

- [ ] **Step 6: Document any issues found in the skill bodies and fix in-place**

If a workflow's `--skip <N>` flag isn't actually parsed (because workflows are markdown, not code), document the limitation in the SKILL.md and adjust the description to remove the false promise. This is the most likely real failure mode.

- [ ] **Step 7: Commit any fixes**

```bash
git add skills/workflow-*/SKILL.md
git commit -m "fix: smoke-test fixes to workflow skill bodies"
```

---

## Self-Review Notes

- **Spec coverage:** 5 workflows match the pipelines that recur in Shane's actual usage (design, brainstorm-validate, stage-draft, vault, audit). `publish-post` already exists and is omitted deliberately, but `workflow-stage-draft` slots in upstream of it.
- **No placeholders:** every SKILL.md content block is the actual final text. No "TBD", no "fill in stages later".
- **Type/name consistency:** every workflow name in the SKILL.md text matches the directory name.
- **What's NOT covered:** a generic workflow framework. The conventions doc captures the pattern; if a 5th workflow is needed later, it follows the doc. We are not building a meta-workflow runner.
