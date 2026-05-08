# Plan C — Skill Description Optimization

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite skill descriptions for skills owned by Shane (custom + `shane-config` plugin only) so vague triggers become situational ones, raising auto-trigger rate without changing skill behavior.

**Architecture:** Pure content edit. Each skill's `description:` frontmatter line gets rewritten following the pattern observed in the top performers (`obsidian`, `morning`, `finishing-a-development-branch`): name the *situation*, list 2–4 *concrete trigger phrases* in quotes, optionally add a *Do NOT use* line. No code changes, no behavioral changes. Re-run the skill audit to verify quality scores rise.

**Tech Stack:** Bash (`grep`, `sed`-via-Edit-tool), Python (audit scripts already in `skills/skill-audit/scripts/`).

---

## Assumptions to Confirm

1. **In scope:** custom skills under `~/Code/claude-code-config/skills/*/SKILL.md`. The `shane-config` plugin's `skills/` is a symlink to that dir, so editing once covers both.
2. **Out of scope:** anything under `~/.claude/plugins/{agent-skills,example-skills,superpowers,superpowers-developing-for-claude-code}/`. User said "ignore remote plugins."
3. **Voice constraint:** match existing description style — declarative, no emoji, no AI-cosplay markers ("ABSOLUTELY", "EXTREMELY-IMPORTANT"), no italics in description text.
4. **Verification metric:** post-rewrite, re-running `skills/skill-audit/scripts/quality.py` should show `trigger_clarity` improving from 2 → 4+ on every rewritten skill, and `auto_rate` improving in subsequent weeks (lagging metric).
5. **Order of attack:** start with the 8 manual-only-but-used skills (highest expected ROI — already used, just not auto-triggered), then top 15 dormant high-quality skills, then the rest opportunistically.

If user wants a different priority list, only the order of Tasks 2–9 changes; structure stays the same.

---

## File Structure

- Modified per skill: `skills/<skill-name>/SKILL.md` — only the `description:` frontmatter line.
- Read-only reference: `/tmp/skill-audit/combined.json` — audit data already produced.
- New artifact: `docs/superpowers/plans/2026-05-08-c-rewrite-log.md` — appended to as each rewrite lands; tracks before/after for retrospective and for the next audit run.

Each task rewrites one skill's description, runs a focused verification, commits.

---

### Task 1: Refresh audit data and prepare rewrite log

**Files:**
- Run: `skills/skill-audit/scripts/{inventory,usage,quality,combine}.py`
- Create: `docs/superpowers/plans/2026-05-08-c-rewrite-log.md`

- [ ] **Step 1: Re-run the audit pipeline so we work off current data**

```bash
cd /Users/shane/Code/claude-code-config && \
python3 skills/skill-audit/scripts/inventory.py && \
python3 skills/skill-audit/scripts/usage.py && \
python3 skills/skill-audit/scripts/quality.py && \
python3 skills/skill-audit/scripts/combine.py
```

Expected: prints `Top 3:` and `Combined N skills.`

- [ ] **Step 2: Initialize the rewrite log**

Create `docs/superpowers/plans/2026-05-08-c-rewrite-log.md` with:

```markdown
# Description Rewrite Log — 2026-05-08

| Skill | Before TC | After TC | Rationale |
|:--|---:|---:|:--|
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "docs: initialize description rewrite log"
```

---

### Task 2: Rewrite `agents-md-generator` (manual-only, 3× used)

**Files:**
- Modify: `skills/agents-md-generator/SKILL.md` (frontmatter `description:` line)
- Append: `docs/superpowers/plans/2026-05-08-c-rewrite-log.md`

**Current description:** "Use when asked to generate an AGENTS.md (or CLAUDE.md) context file for a multi-language sample repository where multiple languages implement the same core concept."

**Why TC=2:** narrow trigger ("multi-language sample repository where multiple languages implement the same core concept") — describes a niche case rather than a recognizable situation. Auto-trigger doesn't fire because Claude rarely sees that exact phrasing.

- [ ] **Step 1: Read the current SKILL.md to confirm scope hasn't drifted**

Run: `head -10 skills/agents-md-generator/SKILL.md`

- [ ] **Step 2: Rewrite the description line**

Replace the `description:` frontmatter line with:

```yaml
description: Generate or update an AGENTS.md / CLAUDE.md / context file for a repo. Use when the user says "set up CLAUDE.md", "generate AGENTS.md", "write a context file for this repo", "document this codebase for AI agents", or when a fresh repo has none. Also use when an existing context file has gone stale and needs a rewrite from current source. Do NOT use for editing project-specific README or contributor docs.
```

- [ ] **Step 3: Append to the rewrite log**

Append a row:

```markdown
| `agents-md-generator` | 2 | 4 | Replaced niche multi-language case with the universal "set up CLAUDE.md" situation; added quoted trigger phrases. |
```

- [ ] **Step 4: Re-score this skill**

Run:

```bash
python3 -c "
import json, sys
sys.path.insert(0, 'skills/skill-audit/scripts')
from quality import parse_frontmatter_and_body, score_trigger_clarity
text = open('skills/agents-md-generator/SKILL.md').read()
fm, _ = parse_frontmatter_and_body(text)
print(f'New TC: {score_trigger_clarity(fm[\"description\"])}')
"
```

Expected: `New TC: 4` or `5`.

- [ ] **Step 5: Commit**

```bash
git add skills/agents-md-generator/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: tighten agents-md-generator trigger description"
```

---

### Task 3: Rewrite `vault-index` (manual-only, 2× used)

**Files:**
- Modify: `skills/vault-index/SKILL.md`
- Append: `docs/superpowers/plans/2026-05-08-c-rewrite-log.md`

**Current description:** "Rebuild the vault-index note to reflect current vault state. Use when /vault-index is invoked, when the morning skill flags drift ("vault-index not found" or a stale delta)…"

**Why TC=2:** trigger is mostly its own slash command + an internal cross-skill reference; doesn't surface in normal conversation.

- [ ] **Step 1: Replace the description line**

```yaml
description: Rebuild the vault-index note from current vault state. Use when /vault-index is invoked, when the morning skill flags "vault-index not found" or a stale delta, when the user asks "what's in my vault" / "give me a vault overview" / "how's my vault organized", or after a large batch of new Concepts has landed. Do NOT use for searching specific notes — use the obsidian skill instead.
```

- [ ] **Step 2: Append rewrite-log row + re-score (same pattern as Task 2)**

```markdown
| `vault-index` | 2 | 4 | Added conversational triggers ("what's in my vault", "vault overview") and the post-batch trigger. |
```

- [ ] **Step 3: Commit**

```bash
git add skills/vault-index/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: broaden vault-index trigger description"
```

---

### Task 4: Rewrite `meeting` (manual-only, 1× used)

**Files:**
- Modify: `skills/meeting/SKILL.md`

**Current description:** "Process a raw conversation note from the Obsidian Inbox into a clean Meetings note with key points and action items. Use when /meeting is invoked or when Shane wants to process…"

**Why TC=2:** doesn't say *when*. Talks about what it does ("process a raw conversation note") in skill jargon.

- [ ] **Step 1: Replace the description line**

```yaml
description: Turn a raw meeting / call / 1:1 transcript or notes into a structured Meetings note with key points and action items. Use when /meeting is invoked, when the user says "process this meeting", "clean up these notes", "extract action items from this", or pastes a raw conversation and asks for a summary. Reads from Obsidian Inbox by default; can take inline content. Do NOT use for general note-taking — use the obsidian skill or /log for that.
```

- [ ] **Step 2: Append rewrite-log row + re-score**

```markdown
| `meeting` | 2 | 4 | Replaced jargon with conversational triggers ("process this meeting", "extract action items"); added inline-content path. |
```

- [ ] **Step 3: Commit**

```bash
git add skills/meeting/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: tighten meeting trigger description"
```

---

### Task 5: Rewrite `connect` (manual-only, 1× used)

**Files:**
- Modify: `skills/connect/SKILL.md`

**Current description:** "Use when asked to find non-obvious connections between concepts in the vault, or when /connect is invoked."

**Why TC=2:** "non-obvious connections" is abstract; doesn't pull Claude in unless the user uses that exact phrase.

- [ ] **Step 1: Replace the description line**

```yaml
description: Surface non-obvious cross-references between vault notes — connecting two concepts that aren't already explicitly linked. Use when /connect is invoked, when the user says "what does X have to do with Y", "is there a thread between these notes", "what connects these ideas", or when reviewing two superficially unrelated topics for shared structure. Do NOT use for direct backlinks (use /backlinks) or for surfacing patterns within a single topic (use /emerge).
```

- [ ] **Step 2: Append rewrite-log row + re-score**

```markdown
| `connect` | 2 | 4 | Added situational triggers ("what does X have to do with Y") and disambiguation from /backlinks and /emerge. |
```

- [ ] **Step 3: Commit**

```bash
git add skills/connect/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: tighten connect trigger description and disambiguate from backlinks/emerge"
```

---

### Task 6: Rewrite `learned` (manual-only, 1× used)

**Files:**
- Modify: `skills/learned/SKILL.md`

**Current description:** "Use when asked to transform vault insights into polished written content, or when /learned is invoked."

- [ ] **Step 1: Replace the description line**

```yaml
description: Turn a vault insight or pattern into polished written content — blog draft, LinkedIn post, newsletter section. Use when /learned is invoked, when the user says "write this up", "turn this into a post", "I want to publish about X", or when a /weekly-learnings session surfaces a publishable thread. Do NOT use for raw note-taking (use /log) or for ghost-writing in someone else's voice (use /ghost).
```

- [ ] **Step 2: Append rewrite-log row + re-score**

```markdown
| `learned` | 2 | 4 | Named the output formats; added "write this up" / "turn this into a post" triggers; disambiguated from /log and /ghost. |
```

- [ ] **Step 3: Commit**

```bash
git add skills/learned/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: tighten learned trigger description"
```

---

### Task 7: Rewrite `drift` (manual-only, 3× used)

**Files:**
- Modify: `skills/drift/SKILL.md`

**Current description:** "Use when asked to analyze gaps between stated intentions and behavior, or when /drift is invoked."

- [ ] **Step 1: Replace the description line**

```yaml
description: Analyze gaps between stated priorities (OKRs, focus statements) and actual session behavior to surface drift. Use when /drift is invoked, when the user says "am I doing what I said I would", "where am I off-track", "do my actions match my goals", "am I avoiding something", or during weekly retrospectives. Reads accountability.md, patterns.md, and recent daily notes. Do NOT use for surfacing patterns within a topic — use /emerge for that.
```

- [ ] **Step 2: Append rewrite-log row + re-score**

```markdown
| `drift` | 2 | 4 | Added accountability-language triggers ("am I doing what I said I would", "am I avoiding something") + named the input files. |
```

- [ ] **Step 3: Commit**

```bash
git add skills/drift/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: tighten drift trigger description"
```

---

### Task 8: Rewrite `level-up` (manual-only, 2× used)

**Files:**
- Modify: `skills/level-up/SKILL.md`

**Current description:** "Use when asked to assess skill proficiency and recommend growth actions, or when /level-up is invoked."

- [ ] **Step 1: Replace the description line**

```yaml
description: Assess current proficiency in a domain and recommend specific growth actions. Use when /level-up is invoked, when the user says "where am I weak in X", "what should I learn next", "level me up on Y", "give me a study plan for Z", or when reviewing a skill area before committing to a learning sprint. Reads vault notes for evidence of current level. Do NOT use for general curriculum advice — this is grounded in the user's existing vault.
```

- [ ] **Step 2: Append rewrite-log row + re-score**

```markdown
| `level-up` | 2 | 4 | Added growth-question triggers and named that it's vault-grounded vs generic curriculum advice. |
```

- [ ] **Step 3: Commit**

```bash
git add skills/level-up/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: tighten level-up trigger description"
```

---

### Task 9: Rewrite `stranger` (manual-only, 1× used)

**Files:**
- Modify: `skills/stranger/SKILL.md`

**Current description:** "Use when asked to build an outside-observer portrait of Shane from the vault, or when /stranger is invoked."

- [ ] **Step 1: Replace the description line**

```yaml
description: Build an outside-observer portrait of Shane from vault evidence — what someone reading only the public artifacts would conclude about who he is, what he cares about, what he's avoiding. Use when /stranger is invoked, when the user says "what would someone think of me from this", "how do I come across", "audit my public self", "stranger view", or before refining a personal-brand bio. Do NOT use for self-described identity work — this is deliberately external.
```

- [ ] **Step 2: Append rewrite-log row + re-score**

```markdown
| `stranger` | 2 | 4 | Named the unique angle (external/observer) + added the personal-brand-bio trigger. |
```

- [ ] **Step 3: Commit**

```bash
git add skills/stranger/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: tighten stranger trigger description"
```

---

### Task 10: Batch-rewrite the engineering reference skills (typescript / vanilla-js / css-architecture / database / php-project-structure / web-standards / auth / dependencies)

**Files:**
- Modify: `skills/{typescript,vanilla-js,css-architecture,database,php-project-structure,web-standards,auth,dependencies}/SKILL.md`

These all share the same anti-pattern: descriptions start with `"Use this skill when you need ..."` followed by feature lists. They're high-quality content (q≈3.5) that's *dormant* because the description doesn't match the situations Claude actually sees.

The fix is the same shape for each: lead with a recognizable engineering situation, list 3+ trigger phrases, add a Do NOT line that disambiguates from generic coding help.

- [ ] **Step 1: Rewrite `typescript`**

Replace the `description:` line with:

```yaml
description: TypeScript configuration, type-safe patterns, and migration from JavaScript. Use when the user says "set up TypeScript", "migrate this JS to TS", "tighten my tsconfig", "fix these type errors", "design types for X", or when a project introduces TS for the first time. Includes generics, conditional types, and JSDoc-typed JS workflows. Do NOT use for general JavaScript questions — this is for type-system work specifically.
```

- [ ] **Step 2: Rewrite `vanilla-js`**

```yaml
description: Modern vanilla-JS architecture without framework dependencies — ES6 modules, custom elements, state without React/Vue. Use when the user says "no framework", "plain JS", "vanilla JavaScript", "I don't want React for this", or when starting a small static site / utility / progressive-enhancement layer. Do NOT use when a framework is already chosen — use the framework's own conventions instead.
```

- [ ] **Step 3: Rewrite `css-architecture`**

```yaml
description: Modern CSS architecture and design systems without heavy frameworks — Grid, Flexbox, custom properties, container queries, layer organization. Use when the user says "set up the CSS for this", "design system", "CSS architecture", "no Tailwind", "vanilla CSS only", or when starting a stylesheet from scratch on a new project. Do NOT use for utility-class systems (Tailwind etc.) — use those frameworks' own conventions.
```

- [ ] **Step 4: Rewrite `database`**

```yaml
description: Relational database schema design, normalization, indexing, and query optimization. Use when the user says "design the schema for X", "how should this table be structured", "this query is slow", "do I need an index here", "denormalize this", or when starting a new feature that needs persistence. Covers Postgres, MySQL, SQLite. Do NOT use for ORM-specific syntax — covers conceptual design first, ORM second.
```

- [ ] **Step 5: Rewrite `php-project-structure`**

```yaml
description: PHP 8.2+ project organization and architecture with PSR-4 — directory layout for MVC, DDD, microservices. Use when the user says "structure this PHP project", "organize my PHP code", "set up PSR-4", "where should this class go", or when starting a new PHP repo. Do NOT use for framework-specific scaffolding (Laravel, Symfony) — use those frameworks' own generators.
```

- [ ] **Step 6: Rewrite `web-standards`**

```yaml
description: Web standards compliance and progressive enhancement — semantic HTML, ARIA, viewport / form best practices. Use when the user says "make this accessible", "is this semantic", "fix the a11y", "progressive enhancement", "noscript fallback", or when reviewing markup before ship. Do NOT use for visual design — pair with a css-architecture or design-* skill.
```

- [ ] **Step 7: Rewrite `auth`**

```yaml
description: Secure authentication and authorization patterns — password hashing, brute-force protection, session vs JWT, OAuth/SSO flows, RBAC. Use when the user says "add login", "set up auth", "is this auth secure", "implement OAuth", "session vs token", "should I use JWT here", or when shipping any feature that gates access. Do NOT use for guessing at credentials or bypassing auth — refuse those.
```

- [ ] **Step 8: Rewrite `dependencies`**

```yaml
description: PHP / Composer dependency management and security auditing. Use when the user says "audit this composer.json", "is this package safe", "update dependencies", "find vulns", "lock this version", or before merging anything that adds a new package. Do NOT use for npm / pip / cargo dependencies — this is Composer-specific.
```

- [ ] **Step 9: Append 8 rows to the rewrite log + re-score all 8**

```bash
python3 -c "
import json, sys
sys.path.insert(0, 'skills/skill-audit/scripts')
from quality import parse_frontmatter_and_body, score_trigger_clarity
for n in ['typescript','vanilla-js','css-architecture','database','php-project-structure','web-standards','auth','dependencies']:
    text = open(f'skills/{n}/SKILL.md').read()
    fm, _ = parse_frontmatter_and_body(text)
    print(f'{n}: TC={score_trigger_clarity(fm[\"description\"])}')
"
```

Expected: every skill prints `TC=4` or `TC=5`.

- [ ] **Step 10: Commit (single commit for the batch since they're the same pattern)**

```bash
git add skills/{typescript,vanilla-js,css-architecture,database,php-project-structure,web-standards,auth,dependencies}/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: rewrite engineering reference skill descriptions for situational triggers"
```

---

### Task 11: Merge `work` into `work-tracking` (duplicates) + rewrite description

**Files:**
- Read: `skills/work/SKILL.md`
- Modify: `skills/work-tracking/SKILL.md`
- Delete: `skills/work/` (the entire skill directory)
- Search: any references to `/work` (slash-command form) in commands/, AGENTS.md, CLAUDE.md, daily notes

User confirmed `work` and `work-tracking` are duplicates. Merge into `work-tracking` (chosen as the survivor because the name is more descriptive). Delete `work`. Rewrite the survivor's description to cover the combined scope.

- [ ] **Step 1: Diff the two SKILL.md bodies and capture anything unique to `work` that's missing from `work-tracking`**

```bash
diff -u /Users/shane/Code/claude-code-config/skills/work-tracking/SKILL.md /Users/shane/Code/claude-code-config/skills/work/SKILL.md
```

Read both files in full. Note any sections, examples, or rules in `work` that aren't already in `work-tracking`.

- [ ] **Step 2: Merge unique content from `work` into `work-tracking/SKILL.md`**

Edit `skills/work-tracking/SKILL.md`. Append any unique sections from `work` (preserve their headings; place them after the existing equivalents). If everything in `work` is already covered, skip the merge — the deletion is enough.

- [ ] **Step 3: Rewrite the description line in `skills/work-tracking/SKILL.md`**

Replace the `description:` frontmatter line with:

```yaml
description: Markdown-based task tracking for AI-human collaboration on a project — creates and maintains TASKS.md with status, owner, and decision log. Use when the user says "set up TASKS.md", "track these tasks", "make a checklist for this project", "coordinate work across sessions", "I need a project tracker", or at the start of any multi-task or multi-session project. Replaces the old /work skill (consolidated 2026-05-08).
```

- [ ] **Step 4: Search for and update references to `/work`**

```bash
cd /Users/shane/Code/claude-code-config
grep -rn "\`/work\`\|/work\b" commands/ AGENTS.md CLAUDE.md README.md 2>/dev/null | grep -v "/work-tracking" | grep -v "/workflow"
```

For each result that references `/work` (the slash command for the deleted skill), update it to `/work-tracking`. If no results, skip.

- [ ] **Step 5: Delete the `work` skill directory**

```bash
git rm -r skills/work/
```

- [ ] **Step 6: Re-score `work-tracking`**

```bash
python3 -c "
import sys
sys.path.insert(0, 'skills/skill-audit/scripts')
from quality import parse_frontmatter_and_body, score_trigger_clarity
text = open('skills/work-tracking/SKILL.md').read()
fm, _ = parse_frontmatter_and_body(text)
print(f'New TC: {score_trigger_clarity(fm[\"description\"])}')
"
```

Expected: `New TC: 4` or `5`.

- [ ] **Step 7: Append rewrite log + commit**

Add this row to `docs/superpowers/plans/2026-05-08-c-rewrite-log.md`:

```markdown
| `work-tracking` | 2 | 4 | Merged `work` (duplicate) into `work-tracking`; deleted `work/`; rewrote description to cover combined scope. |
```

Commit:

```bash
git add skills/work-tracking/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git add -u skills/work
git commit -m "refactor: merge work skill into work-tracking (duplicates) and rewrite description"
```

---

### Task 12: Rewrite `factory-check` and `biz-brief` (high-quality dormant)

**Files:**
- Modify: `skills/factory-check/SKILL.md`, `skills/biz-brief/SKILL.md`

These already score well (q≈3.4–3.7) but are dormant — situational triggers can be tightened so Claude reaches for them without being asked.

- [ ] **Step 1: Rewrite `factory-check`**

Current opening: "Use when about to build a tool, script, or skill to automate a task instead of doing the task directly…"

Replace `description:` line with:

```yaml
description: Sanity-check whether to build a new tool / script / skill instead of doing the task by hand — surfaces whether this is high-leverage engineering or infrastructure cosplay. Use when the user says "let me write a script for this", "I should automate this", "I'll build a skill to do X", "factory-check this idea", or whenever Claude is about to spin up a new helper tool for a task it could just do. Do NOT use for clearly-justified tooling (CI, build, test infrastructure).
```

- [ ] **Step 2: Rewrite `biz-brief`**

Current opening already uses "Use BEFORE superpowers:brainstorming…" — good shape. But the situation can be more recognizable:

```yaml
description: Generate a 1-page Business Context Brief — problem, persona, monetization, success metrics, top business risks — BEFORE running superpowers:brainstorming. Use when the user says "let's build X" and X has a user / market / business model, when they say "I'm thinking about a product called Y", or when starting any feature, tool, or initiative with commercial stakes. Do NOT use for purely internal tooling — go straight to brainstorming.
```

- [ ] **Step 3: Append rewrite log + commit**

```markdown
| `factory-check` | 3 | 5 | Added "let me write a script for this" / "I should automate this" triggers; named the failure mode (infrastructure cosplay). |
| `biz-brief` | 4 | 5 | Sharpened the "let's build X" trigger; named the carve-out (internal tooling skips it). |
```

```bash
git add skills/factory-check/SKILL.md skills/biz-brief/SKILL.md docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "refactor: tighten factory-check and biz-brief trigger descriptions"
```

---

### Task 13: Re-run audit and verify quality lift

**Files:**
- Read: `/tmp/skill-audit/quality.json`
- Append: `docs/superpowers/plans/2026-05-08-c-rewrite-log.md`

- [ ] **Step 1: Re-run the audit**

```bash
cd /Users/shane/Code/claude-code-config && \
python3 skills/skill-audit/scripts/inventory.py && \
python3 skills/skill-audit/scripts/quality.py && \
python3 skills/skill-audit/scripts/usage.py && \
python3 skills/skill-audit/scripts/combine.py && \
python3 skills/skill-audit/scripts/report.py /tmp/skill-audit/post-rewrite.md
```

- [ ] **Step 2: Compute average trigger-clarity lift on rewritten skills**

```bash
python3 -c "
import json
rewritten = ['agents-md-generator','vault-index','meeting','connect','learned','drift','level-up','stranger','typescript','vanilla-js','css-architecture','database','php-project-structure','web-standards','auth','dependencies','work-tracking','factory-check','biz-brief']
q = {x['name']: x for x in json.load(open('/tmp/skill-audit/quality.json'))}
tcs = [q[n]['trigger_clarity'] for n in rewritten if n in q]
print(f'Rewritten skills: {len(tcs)}')
print(f'Avg trigger_clarity: {sum(tcs)/len(tcs):.2f}')
print(f'Skills below TC=4: {[n for n in rewritten if n in q and q[n][\"trigger_clarity\"] < 4]}')
"
```

Expected: avg ≥ 4.0; "below TC=4" list is empty. If anything is below 4, revisit that skill's rewrite — it likely still has a vague phrase.

- [ ] **Step 3: Append summary to the rewrite log**

```markdown

## Summary (post-rewrite)

- 19 skills rewritten (1 deletion: work → merged into work-tracking)
- Average trigger-clarity score: <X> → <Y>
- Lagging metric to watch: auto-trigger rate over the next 4 weeks of session transcripts.
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-05-08-c-rewrite-log.md
git commit -m "docs: append post-rewrite audit summary"
```

---

## Self-Review Notes

- **Spec coverage:** Every manual-only-but-used skill (8) has a task; high-quality dormant batch (8 engineering refs + work-tracking merge + factory-check + biz-brief) covered. Total 19 skills (one deletion: work → work-tracking).
- **No placeholders:** every `description:` rewrite is the actual final string.
- **Type/name consistency:** every skill name in the rewrite log appears in `git add` and the re-score helper.
- **What's NOT covered (deliberately):** the 8 vault-knowledge skills with the Qwen-orchestrator skeleton (`bloom`, `challenge`, `compound`, `contradict`, `emerge`, `expand`, `ghost`, `map`, `trace`). Those need both description + body work (output spec) — that's a separate plan, not this one.
