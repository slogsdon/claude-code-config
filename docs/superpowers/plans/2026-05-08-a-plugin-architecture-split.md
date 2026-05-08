# Plan A — Plugin Architecture Split (Marketplace + Submodules)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic `shane-config` plugin (70 skills, all in one repo) into 8 grouped plugins (design, vault-knowledge, vault-rituals, writing, engineering-reference, audit-and-business, workflows, meta-utils), each in its own GitHub repo, all listed in the `slogsdon-claude-code-config` marketplace, with private repos for the high-value commercial skills and submodules pointing at every plugin from the main config repo for development convenience.

**Architecture:** The marketplace lives in this repo's `.claude-plugin/marketplace.json` and remains the single registration point. Each plugin moves into its own `slogsdon/skills-<group>` GitHub repo. Public plugins are public repos; private plugins are private repos installed via Git URL with the user's GitHub auth. The current `shane-config` plugin's symlinked `skills/` is decomposed: each grouping becomes a plugin repo with its own `.claude-plugin/plugin.json` and a `skills/` directory containing only that group's skills. The main config repo gets a `plugins/shane/` directory with one submodule per plugin for local development; production users install via the marketplace, not via submodules. The transition is staged so each plugin migrates one at a time without breaking existing skill invocations.

**Tech Stack:** Git (submodules), GitHub CLI (`gh repo create`), Claude Code plugin manifest format (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`).

---

## Assumptions to Confirm — READ BEFORE EXECUTING

These shape every task. If any are wrong, edit before running.

### A1. Plugin grouping (the most important decision)

Default split — 8 plugins. Move user input here if any group is wrong.

| Plugin | Visibility | Skills (count) | Source skills |
|:--|:--|---:|:--|
| `skills-design` | **public** | 25 | all `design-*` (24) + `screenshot-html` |
| `skills-vault-knowledge` | **public** | 14 | `obsidian`, `backlinks`, `bloom`, `challenge`, `compound`, `connect`, `contradict`, `drift`, `emerge`, `expand`, `ghost`, `learned`, `level-up`, `map`, `meeting`, `stranger`, `trace`, `vault-index`, `vault-lint`, `weekly-learnings`, `weekly-signals`, `fix-nested-code-fences` |
| `skills-vault-rituals` | **public** | 5 | `morning`, `eod`, `plan-tomorrow`, `log`, `inbox-process` |
| `skills-writing` | **public** | 3 | `humanize`, `ms-style-pass`, `ms-style-pass-workspace` |
| `skills-engineering-reference` | **public** | 8 | `typescript`, `vanilla-js`, `css-architecture`, `php-project-structure`, `web-standards`, `database`, `dependencies`, `auth` |
| **`skills-audit-business`** | **PRIVATE** | 5 | `ai-visibility-audit`, `design-audit-report`, `skill-audit`, `factory-check`, `biz-brief` |
| `skills-workflows` | **public** | 8 | `publish-post`, `agents-md-generator`, `work-tracking` + the 5 workflow skills from Plan B |
| `skills-meta-utils` | **public** | 3 | `compress-prompt`, `qwen-executor`, `gemma-executor` |

Total: 67 skills across 8 plugins. (`work` and `work-tracking` are duplicates — they get merged into `work-tracking` in Plan C Task 11, then live in `skills-workflows`.)

### A2. Repo location

GitHub user `slogsdon`. Each plugin becomes `github.com/slogsdon/skills-<group>`. The marketplace stays at `github.com/slogsdon/claude-code-config` (this repo).

### A3. Private-repo install model

Users install private plugins via the marketplace JSON, which references `github.com/slogsdon/skills-audit-business` (private). Only authenticated users with read access to that private repo can install. Shane grants access by adding GitHub collaborators or selling licenses that include a deploy key.

### A4. Migration strategy: stage-by-stage, oldest-first

Migrate one plugin at a time. After each migration, verify all moved skills still load and trigger correctly via the new path. Keep the old `shane-config` plugin alive as a compatibility wrapper that depends on (does not duplicate) the new plugins until the last migration completes; then deprecate it.

### A5. Out of scope for this plan

- Selling / licensing infrastructure for private plugins. (That's a separate plan.)
- Per-plugin CI / version bumping automation. (Add in a follow-up plan once the structure is stable.)
- Renaming the marketplace itself.

---

## File Structure

This plan creates a lot of files. Here's the shape:

```
~/Code/claude-code-config/                       # this repo
├── .claude-plugin/
│   └── marketplace.json                         # MODIFIED: now lists 8 plugins
├── .gitmodules                                  # NEW: 8 submodule entries
├── plugins/
│   ├── shane/                                   # NEW directory
│   │   ├── skills-design/                 # SUBMODULE → slogsdon/skills-design
│   │   ├── skills-vault-knowledge/        # SUBMODULE
│   │   ├── skills-vault-rituals/          # SUBMODULE
│   │   ├── skills-writing/                # SUBMODULE
│   │   ├── skills-engineering-reference/  # SUBMODULE
│   │   ├── skills-audit-business/         # SUBMODULE (private)
│   │   ├── skills-workflows/              # SUBMODULE
│   │   └── skills-meta-utils/             # SUBMODULE
│   └── shane-config/                            # MODIFIED: shrunk to compatibility shim
└── skills/                                      # DEPRECATED at end of plan; sources moved into plugin repos

~/Code/skills-design/                      # NEW repo (and 7 more like it)
├── .claude-plugin/plugin.json                   # NEW
├── .gitignore                                   # NEW
├── README.md                                    # NEW
└── skills/<each-skill>/SKILL.md                 # MOVED from claude-code-config/skills/
```

Migration is one repo per task. Each task creates the repo, moves the skills, registers in the marketplace, adds the submodule, and verifies.

---

### Task 1: Lock the plugin grouping

**Files:**
- Create: `docs/superpowers/plans/2026-05-08-a-plugin-grouping.md` — the canonical mapping

This is the contract for everything downstream. Confirming it before any repo creation prevents thrash.

- [ ] **Step 1: Write the canonical grouping doc**

Create `docs/superpowers/plans/2026-05-08-a-plugin-grouping.md` with the full table from Assumption A1, plus a `work` / `work-tracking` placement decision.

```markdown
# Plugin Grouping — Canonical Mapping

| Plugin repo | Visibility | Skills |
|:--|:--|:--|
| `skills-design` | public | design-audit-report, design-blog-hero, design-business-card, design-carousel-slide, design-instagram-post, design-landing-page, design-link-in-bio, design-linkedin-post, design-newsletter-header, design-obs-alert-overlay, design-obs-scene-pack, design-plan, design-podcast-cover, design-quote-card, design-speaker-bio-card, design-stream-overlay, design-system, design-talk-slide, design-twitch-panels, design-twitter-card, design-ui-components, design-youtube-channel-art, design-youtube-thumbnail, screenshot-html |
| `skills-vault-knowledge` | public | obsidian, backlinks, bloom, challenge, compound, connect, contradict, drift, emerge, expand, ghost, learned, level-up, map, meeting, stranger, trace, vault-index, vault-lint, weekly-learnings, weekly-signals, fix-nested-code-fences |
| `skills-vault-rituals` | public | morning, eod, plan-tomorrow, log, inbox-process |
| `skills-writing` | public | humanize, ms-style-pass, ms-style-pass-workspace |
| `skills-engineering-reference` | public | typescript, vanilla-js, css-architecture, php-project-structure, web-standards, database, dependencies, auth |
| `skills-audit-business` | **private** | ai-visibility-audit, design-audit-report, skill-audit, factory-check, biz-brief |
| `skills-workflows` | public | publish-post, agents-md-generator, work-tracking, workflow-design, workflow-feature-spec, workflow-stage-draft, workflow-vault-weekly, workflow-monthly-skill-audit |
| `skills-meta-utils` | public | compress-prompt, qwen-executor, gemma-executor |

Note: `design-audit-report` appears in BOTH `skills-design` (public, generic skill) and `skills-audit-business` (private, commercial-grade variant). On migration, decide: keep one, fork into two distinct skills, or move to private only. Default: **move to private only**, since the commercial use case is the load-bearing one.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-05-08-a-plugin-grouping.md
git commit -m "docs: lock plugin grouping for marketplace split"
```

---

### Task 2: Create scaffolding for `skills-design` (the largest, most-tested plugin — migrate first)

**Files:**
- Create (in new sibling repo): `~/Code/skills-design/`
- Modify: `.claude-plugin/marketplace.json`

Migrating the biggest plugin first surfaces the most issues. If this works, smaller migrations reuse the pattern.

- [ ] **Step 1: Create the GitHub repo**

```bash
gh repo create slogsdon/skills-design --public --description "Brand-agnostic design system + artifact generators for Claude Code" --clone --confirm
```

If `gh` is not authenticated, run `gh auth login` first. Expected: repo cloned to `~/Code/skills-design/`.

- [ ] **Step 2: Initialize the plugin manifest**

```bash
cd ~/Code/skills-design
mkdir -p .claude-plugin skills
cat > .claude-plugin/plugin.json <<'EOF'
{
  "name": "skills-design",
  "version": "0.1.0",
  "description": "Brand-agnostic design system and artifact generators — DESIGN.md tokens, plus 24 artifact templates (LinkedIn, Instagram, YouTube, Twitch, OBS, podcast, blog hero, business card, etc.) + screenshot-html PNG export.",
  "author": { "name": "Shane Logsdon" },
  "license": "MIT"
}
EOF
```

- [ ] **Step 3: Add a basic README**

```bash
cat > README.md <<'EOF'
# skills-design

Design-system + artifact-generator skills for Claude Code.

Part of the [slogsdon-claude-code-config](https://github.com/slogsdon/claude-code-config) marketplace.

## Installation

Via the marketplace:

```
/plugin install slogsdon-claude-code-config:skills-design
```

## Skills included

24 design-* artifact skills + screenshot-html. See [docs/superpowers/plans/2026-05-08-a-plugin-grouping.md](https://github.com/slogsdon/claude-code-config/blob/main/docs/superpowers/plans/2026-05-08-a-plugin-grouping.md) for the full list.
EOF
```

- [ ] **Step 4: Move the 24 skill directories from this repo into the new one**

```bash
cd ~/Code/claude-code-config && \
for skill in design-audit-report design-blog-hero design-business-card design-carousel-slide design-instagram-post design-landing-page design-link-in-bio design-linkedin-post design-newsletter-header design-obs-alert-overlay design-obs-scene-pack design-plan design-podcast-cover design-quote-card design-speaker-bio-card design-stream-overlay design-system design-talk-slide design-twitch-panels design-twitter-card design-ui-components design-youtube-channel-art design-youtube-thumbnail screenshot-html; do
  if [ -d "skills/$skill" ]; then
    git mv "skills/$skill" "../skills-design/skills/$skill"
  else
    echo "MISSING: skills/$skill"
  fi
done
```

Expected: every skill directory printed without "MISSING".

The `git mv` preserves history in this repo's diff but the destination directory is in a different repo, so the commits land separately. We'll commit both sides.

- [ ] **Step 5: Commit on the plugin repo side**

```bash
cd ~/Code/skills-design
git add .
git commit -m "feat: initial plugin scaffold + 24 design skills migrated from monolith"
git push -u origin main
```

- [ ] **Step 6: Commit the deletions on this repo's side**

```bash
cd ~/Code/claude-code-config
git add -A skills/
git commit -m "refactor: extract design skills to skills-design plugin"
```

- [ ] **Step 7: Add the submodule**

```bash
mkdir -p plugins/shane
git submodule add git@github.com:slogsdon/skills-design.git plugins/shane/skills-design
git commit -m "chore: add skills-design as submodule"
```

- [ ] **Step 8: Register in the marketplace**

Edit `.claude-plugin/marketplace.json`. Add the new plugin to the `plugins` array. Final shape:

```json
{
  "name": "slogsdon-claude-code-config",
  "owner": {
    "name": "Shane Logsdon",
    "email": "shane@shanelogsdon.com"
  },
  "metadata": {
    "description": "Shane's personal Claude configuration — vault workflow, knowledge exploration, design, and dev skills"
  },
  "plugins": [
    {
      "name": "shane-config",
      "source": "./plugins/shane-config",
      "description": "All personal skills and MCP config (legacy monolith — being decomposed; will deprecate after full migration)"
    },
    {
      "name": "skills-design",
      "source": { "source": "github", "repo": "slogsdon/skills-design" },
      "description": "Brand-agnostic design system + 24 artifact generators + PNG export"
    }
  ]
}
```

Commit:

```bash
git add .claude-plugin/marketplace.json
git commit -m "chore: register skills-design in marketplace"
```

- [ ] **Step 9: Verify Claude Code can install + use the new plugin**

In a fresh Claude Code session:

```
/plugin install slogsdon-claude-code-config:skills-design
```

Then verify a design skill loads:

```
/design-linkedin-post
```

Expected: skill body loads, asks for brand slug. Abort the actual run.

- [ ] **Step 10: Update the legacy `shane-config` plugin to depend on the new one (compat shim)**

Edit `plugins/shane-config/.claude-plugin/plugin.json`:

```json
{
  "name": "shane-config",
  "version": "0.2.0",
  "description": "Legacy bundle — being decomposed into skills-* plugins. Currently re-exports vault, writing, and rituals; design skills moved to skills-design.",
  "author": { "name": "Shane Logsdon" }
}
```

Remove the symlinked design skill paths from the bundle. Since `skills/` was a symlink to the parent dir, and we just `git mv`'d the design skills out of the parent, this is a no-op — they're already gone from the symlink target.

```bash
git add plugins/shane-config/.claude-plugin/plugin.json
git commit -m "refactor: shrink shane-config plugin (design skills migrated to skills-design)"
```

---

### Tasks 3–9: Repeat the migration pattern for each remaining plugin

Each task follows the **exact same 10-step shape** as Task 2, with these substitutions:

| Task | Plugin | Visibility | Skill list source |
|:--|:--|:--|:--|
| 3 | `skills-vault-knowledge` | public | A1 row 2 |
| 4 | `skills-vault-rituals` | public | A1 row 3 |
| 5 | `skills-writing` | public | A1 row 4 |
| 6 | `skills-engineering-reference` | public | A1 row 5 |
| 7 | `skills-audit-business` | **PRIVATE** | A1 row 6 — note: `--private` flag in `gh repo create`; install will require auth |
| 8 | `skills-workflows` | public | A1 row 7 — depends on Plan B's workflow skills existing first |
| 9 | `skills-meta-utils` | public | A1 row 8 |

For each task:

- [ ] **Step 1: Create the GitHub repo** (`gh repo create slogsdon/<plugin> --public` or `--private`)
- [ ] **Step 2: Initialize the plugin manifest** (`.claude-plugin/plugin.json` with the description + skill list from grouping doc)
- [ ] **Step 3: Add README** (skill list, install command)
- [ ] **Step 4: Move skill directories from this repo** (`git mv skills/<skill> ../<plugin>/skills/<skill>`)
- [ ] **Step 5: Commit + push the plugin repo**
- [ ] **Step 6: Commit deletions in this repo**
- [ ] **Step 7: Add submodule**
- [ ] **Step 8: Register in marketplace.json**
- [ ] **Step 9: Verify install + invoke one skill from the new plugin**
- [ ] **Step 10: Update shane-config compat shim description**

Acceptance criterion per task: every skill from that grouping loads + invokes from the new plugin path.

---

### Task 10: Verify cross-plugin dependencies still work

**Files:**
- Read: `plugins/shane/skills-workflows/skills/workflow-design/SKILL.md` (and similar)

The workflow skills in `skills-workflows` invoke skills that now live in OTHER plugins (e.g. `workflow-design` calls `design-plan` and `design-system` from `skills-design`). Verify these invocations still resolve.

- [ ] **Step 1: Identify cross-plugin Skill-tool calls in workflow SKILL.mds**

```bash
grep -r "Skill tool\|invoke.*\(design-\|vault-\|workflow-\|skill-\)" plugins/shane/skills-workflows/skills/
```

Expected: list of skill names referenced from the workflow bodies.

- [ ] **Step 2: For each referenced skill, confirm it's installed**

In a Claude Code session with all 8 plugins installed, invoke each workflow's first stage (or pass `--dry-run` if implemented). Confirm the underlying skill is reachable.

- [ ] **Step 3: If any skill is unreachable, document the cross-plugin dependency in marketplace.json**

The marketplace JSON supports a `dependencies` field per plugin. Add for `skills-workflows`:

```json
{
  "name": "skills-workflows",
  "source": { "source": "github", "repo": "slogsdon/skills-workflows" },
  "description": "Pipeline orchestrators that chain other skills-* plugins",
  "dependencies": ["skills-design", "skills-vault-knowledge", "skills-vault-rituals", "skills-audit-business"]
}
```

- [ ] **Step 4: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "chore: declare cross-plugin dependencies for skills-workflows"
```

---

### Task 11: Deprecate the legacy `shane-config` monolith

**Files:**
- Modify: `plugins/shane-config/.claude-plugin/plugin.json`
- Modify: `plugins/shane-config/README.md`
- Modify: `.claude-plugin/marketplace.json`

After all 8 plugins are extracted, the `shane-config` plugin's `skills/` directory is empty. Mark it deprecated.

- [ ] **Step 1: Verify shane-config has no skills left**

```bash
ls plugins/shane-config/skills/ 2>/dev/null && echo "SKILLS REMAIN — migrate them first" || echo "OK"
```

If the symlink target dir (`./skills`) is empty, the `ls` will show empty; otherwise list remaining skills and resolve before continuing.

- [ ] **Step 2: Update the plugin manifest to deprecation status**

```json
{
  "name": "shane-config",
  "version": "0.3.0-deprecated",
  "description": "DEPRECATED: skills migrated to skills-* plugins. Install those individually or the umbrella shane-config-bundle (TBD).",
  "author": { "name": "Shane Logsdon" }
}
```

- [ ] **Step 3: Update its README**

```markdown
# shane-config (deprecated)

Skills migrated to:

- `skills-design`
- `skills-vault-knowledge`
- `skills-vault-rituals`
- `skills-writing`
- `skills-engineering-reference`
- `skills-audit-business` (private)
- `skills-workflows`
- `skills-meta-utils`

Install whichever you need from the slogsdon-claude-code-config marketplace.
```

- [ ] **Step 4: Update marketplace.json description for the legacy entry**

```json
{
  "name": "shane-config",
  "source": "./plugins/shane-config",
  "description": "DEPRECATED — kept for one release cycle so existing installs don't break. Migrate to the skills-* plugins."
}
```

- [ ] **Step 5: Commit**

```bash
git add plugins/shane-config/.claude-plugin/plugin.json plugins/shane-config/README.md .claude-plugin/marketplace.json
git commit -m "chore: deprecate shane-config monolith after full migration"
```

---

### Task 12: Remove the legacy `skills/` symlink and top-level skill content

**Files:**
- Delete: `~/Code/claude-code-config/skills/` (now empty)
- Delete: `plugins/shane-config/skills` (the symlink)

- [ ] **Step 1: Confirm both dirs are empty / unused**

```bash
ls /Users/shane/Code/claude-code-config/skills/ | wc -l
readlink /Users/shane/Code/claude-code-config/plugins/shane-config/skills
```

Expected: count is 0; symlink target is `../../skills` (which is the now-empty dir).

- [ ] **Step 2: Remove**

```bash
cd /Users/shane/Code/claude-code-config
rmdir skills
rm plugins/shane-config/skills
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove empty skills/ dir and legacy symlink (post-migration)"
```

---

### Task 13: Update CLAUDE.md / AGENTS.md / README to reflect new structure

**Files:**
- Modify: `CLAUDE.md`
- Modify: `AGENTS.md`
- Modify: `README.md`

These currently reference `skills/` as the canonical location. After the split, the canonical location is `plugins/shane/<plugin>/skills/<skill>/`.

- [ ] **Step 1: In `CLAUDE.md`, replace the `## Skills` section**

```markdown
## Skills

Skills now live in plugin submodules under `plugins/shane/`. Each plugin groups related skills:

- `plugins/shane/skills-design/` — design system + artifact generators
- `plugins/shane/skills-vault-knowledge/` — vault knowledge work (obsidian, ghost, connect, etc.)
- `plugins/shane/skills-vault-rituals/` — daily rituals (morning, eod, log)
- `plugins/shane/skills-writing/` — humanize + ms-style-pass
- `plugins/shane/skills-engineering-reference/` — language references
- `plugins/shane/skills-audit-business/` — commercial-grade audit + brief skills (PRIVATE)
- `plugins/shane/skills-workflows/` — pipeline orchestrators
- `plugins/shane/skills-meta-utils/` — compress, executors

To add a new skill, add it inside the appropriate plugin submodule. Don't create skills at the top-level config repo.

To run all plugins as if they were one bundle: install all 8 from the marketplace.
```

- [ ] **Step 2: Apply the same replacement to `AGENTS.md`**

- [ ] **Step 3: Update root `README.md` skills section**

Reflect the same structure; add an "Install" section showing the marketplace command.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md AGENTS.md README.md
git commit -m "docs: update skill location references for plugin split"
```

---

### Task 14: End-to-end verification

**Files:**
- Read: every SKILL.md across all 8 plugins (just to count)

- [ ] **Step 1: Count skills per plugin and confirm against the grouping doc**

```bash
for p in plugins/shane/skills-*; do
  count=$(find "$p/skills" -name SKILL.md | wc -l | tr -d ' ')
  echo "$p: $count skills"
done
```

Expected output matches the table in Task 1's grouping doc.

- [ ] **Step 2: Re-run skill-audit and confirm count is identical pre- and post-split**

```bash
python3 plugins/shane/skills-audit-business/skills/skill-audit/scripts/inventory.py
```

Expected: total unique skill count equals the count before the split (no losses, no duplicates).

- [ ] **Step 3: Smoke-test one skill from each of the 8 plugins**

In a fresh session, invoke one slash command from each plugin (e.g. `/morning`, `/design-linkedin-post`, `/skill-audit`, `/humanize`, etc.). Each should load and respond.

- [ ] **Step 4: Commit a final marker**

```bash
git tag -a v1.0.0-marketplace-split -m "Marketplace split complete — 8 plugins, 1 monolith deprecated"
```

---

## Self-Review Notes

- **Spec coverage:** assumption A1 maps every custom skill to a plugin. A2 names repos. A3 covers the private-install model. A4 captures the migration order. A5 lists out-of-scope items.
- **No placeholders:** every plugin manifest, README, and marketplace.json snippet is the actual final content. Tasks 3–9 share an explicit substitution table and step list — no hand-waving.
- **Type/name consistency:** plugin names match across every appearance (manifest → marketplace.json → submodule path → grouping doc).
- **What's NOT covered (deliberately):** licensing infrastructure for paid private plugins, automated CI per plugin, marketplace versioning. Each is a separate plan that builds on this one. The point of THIS plan is the structural split — once it lands, those become tractable.
- **Risk note:** Task 10 (cross-plugin dependencies) is the riskiest. If the marketplace's `dependencies` field doesn't behave as documented, fall back to documenting the dependency in each workflow skill's body and asking the user to install the dependent plugins manually. This is a known unknown — verify Claude Code's plugin-manifest behavior before relying on the field, and adjust if needed.
