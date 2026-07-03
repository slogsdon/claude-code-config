# WS7 — Existing-Project Coding Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make hermes-dispatch's coding loop usable on an EXISTING codebase — seed the source repo into the pi-loop workspace, give the planner real codebase context, add a project-declared test override, and thread a `source_repo` field from the POST body through `state.json` to every consumer. All additive: `coding-loop.json` and the base `pipeline_pi_loop` loop are unchanged.

**Architecture:** `source_repo` (an existing checkout's absolute path) is a first-class `state.json` field, set at run-init time (POST → `SOURCE_REPO` env → run-pipeline.sh → `state.json`) because run-pipeline.sh owns run-dir creation. Consumers read it via `jq`. Seeding happens inside `pipeline_pi_loop` (guarded so resumes don't clobber). A new `read-project-context.sh` tool step produces a `## Project context` Markdown snapshot before `plan`; the tool dispatch gains a `RUN_DIR` export so tools can read `state.json`. `test-runner.sh` gains a `hermes.json` `.test`/`.integration`/`.playwright` override as its highest-priority command source (its node/php/python/make detection already exists).

**Tech Stack:** bash + jq + python3 (dispatch); FastAPI + vanilla JS (command-center). Tests follow `tests/test_pi_loop.sh` (source the lib, sandbox `REPO_ROOT`/`RUN_ROOT`, inject fakes via env seams, assert `state.json` via jq — no models).

**Repos:** `~/Code/hermes-dispatch` (main; create `feature/ws7-existing-project`), `~/Code/command-center` (create `feature/ws7-source-repo`). Spec: `~/Code/claude-code-config/docs/superpowers/specs/2026-07-03-ws7-existing-project-loop.md`.

---

## File Structure

- **Create** `hermes-dispatch/bin/seed-workspace.sh` — copy a source repo into a workspace, excluding `.git`/`node_modules`/vendor.
- **Create** `hermes-dispatch/bin/read-project-context.sh` — read `source_repo` from `state.json` → structured Markdown context.
- **Create** `hermes-dispatch/tests/test_project.sh` — hermetic tests for the two new scripts + the `hermes.json` override + the tool `RUN_DIR` export.
- **Modify** `hermes-dispatch/lib/orchestrate.sh` — `pipeline_pi_loop`: seed workspace from `source_repo`; `pipeline_run` tool branch: `export RUN_DIR`.
- **Modify** `hermes-dispatch/lib/test-runner.sh` — `hermes.json` override in `detect_unit`/`detect_integration`/`detect_playwright`.
- **Modify** `hermes-dispatch/tests/test_pi_loop.sh` — assert workspace seeding (present with `source_repo`, absent without).
- **Modify** `hermes-dispatch/agents/impl-planner/SOUL.md` — use `## Project context` when present.
- **Create** `hermes-dispatch/pipelines/existing-project-loop.json` — context → plan → backlog → gate → build.
- **Modify** `hermes-dispatch/bin/run-pipeline.sh` — persist `SOURCE_REPO` env to `state.json.source_repo`.
- **Modify** `hermes-dispatch/dispatch/server.py` — accept `source_repo` in POST body; inject `SOURCE_REPO` into the pipeline subprocess env.
- **Modify** `hermes-dispatch/tests/run.sh` — run `test_project.sh`.
- **Modify** `command-center/app/routers/agents.py` — `PipelineBody.source_repo`; forward upstream.
- **Modify** `command-center/web/js/screens/dispatch.js` — optional source-repo input for `existing-project-loop`.

Overridable seams (env vars, default to real paths) so tests run model-free:
- `PI_IMPLEMENT` → `$REPO_ROOT/bin/pi-implement.sh`; `TEST_RUNNER` → `$ORCH_LIB_DIR/test-runner.sh` (existing).
- Seeding calls `$REPO_ROOT/bin/seed-workspace.sh`; tests set `REPO_ROOT="$ROOT"` (the real repo) so the real seeder runs.

---

## Phase A — Workspace seeding

### Task A1: `bin/seed-workspace.sh`

**Files:** Create `bin/seed-workspace.sh`; Test `tests/test_project.sh` (created here, extended later).

- [ ] **Step 1: Write the failing test** (create `tests/test_project.sh`)

```bash
#!/usr/bin/env bash
# test_project.sh — hermetic tests for WS7 existing-project support: bin/seed-workspace.sh,
# bin/read-project-context.sh, the hermes.json test override, and the tool RUN_DIR export.
# No models. Run: tests/test_project.sh
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); printf '  ok   %s\n' "$1"; }
bad(){ FAIL=$((FAIL+1)); printf '  FAIL %s\n     %s\n' "$1" "${2:-}"; }
eq(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "expected '$3', got '$2'"; fi; }

echo "== seed-workspace.sh copies source, excludes .git/node_modules =="
SRC="$(mktemp -d)"; DEST="$(mktemp -d)"
mkdir -p "$SRC/lib" "$SRC/.git" "$SRC/node_modules/foo"
printf 'hello' > "$SRC/README.md"; printf 'code' > "$SRC/lib/app.py"
printf 'gitjunk' > "$SRC/.git/config"; printf 'dep' > "$SRC/node_modules/foo/index.js"
"$ROOT/bin/seed-workspace.sh" "$DEST" "$SRC" >/dev/null 2>&1
eq "README copied"         "$(cat "$DEST/README.md" 2>/dev/null)" "hello"
eq "nested file copied"    "$(cat "$DEST/lib/app.py" 2>/dev/null)" "code"
eq ".git excluded"         "$([ -e "$DEST/.git" ] && echo present || echo gone)" "gone"
eq "node_modules excluded" "$([ -e "$DEST/node_modules" ] && echo present || echo gone)" "gone"

echo ""; printf 'project: %d passed, %d failed\n' "$PASS" "$FAIL"; [ "$FAIL" -eq 0 ]
```

- [ ] **Step 2: Run it — fails (script absent)**

Run: `cd ~/Code/hermes-dispatch && chmod +x tests/test_project.sh && tests/test_project.sh`
Expected: FAIL — `bin/seed-workspace.sh: No such file or directory`.

- [ ] **Step 3: Implement `bin/seed-workspace.sh`**

```bash
#!/usr/bin/env bash
# seed-workspace.sh <dest> <source> — copy an existing project into a pi-loop workspace,
# excluding VCS + dependency dirs (huge and re-derivable; the test-runner's opt-in install
# recreates deps). Copies source CONTENTS into dest; dest may pre-exist and is otherwise
# left untouched.
set -euo pipefail
dest="${1:?usage: seed-workspace.sh <dest> <source>}"
src="${2:?usage: seed-workspace.sh <dest> <source>}"
[ -d "$src" ] || { echo "seed-workspace: no source dir '$src'" >&2; exit 1; }
mkdir -p "$dest"
EXCLUDES=(.git node_modules vendor .venv __pycache__)
if command -v rsync >/dev/null 2>&1; then
  args=(-a)
  for e in "${EXCLUDES[@]}"; do args+=(--exclude="$e"); done
  rsync "${args[@]}" "$src"/ "$dest"/
else
  cp -R "$src"/. "$dest"/
  for e in "${EXCLUDES[@]}"; do
    find "$dest" -type d -name "$e" -prune -exec rm -rf {} + 2>/dev/null || true
  done
fi
```

- [ ] **Step 4: Run — passes.** Run: `cd ~/Code/hermes-dispatch && chmod +x bin/seed-workspace.sh && tests/test_project.sh` → `project: 4 passed, 0 failed`.

- [ ] **Step 5: Commit**

```bash
cd ~/Code/hermes-dispatch
git checkout -b feature/ws7-existing-project
git add bin/seed-workspace.sh tests/test_project.sh
git commit -m "feat: add seed-workspace.sh (copy a source repo into a pi-loop workspace)"
```

### Task A2: seed the workspace in `pipeline_pi_loop`

**Files:** Modify `lib/orchestrate.sh` (`pipeline_pi_loop`); Test `tests/test_pi_loop.sh`.

- [ ] **Step 1: Add failing tests** (append to `tests/test_pi_loop.sh` before the summary line). These reuse the file's existing `$FPI` fake worker and `$FTR` green fake test-runner.

```bash
echo "== pipeline_pi_loop seeds workspace from source_repo before building =="
REPO_ROOT="$ROOT"   # use the REAL bin/seed-workspace.sh
RSRC="$(mktemp -d)"; printf 'existing content' > "$RSRC/existing.txt"
RDSEED="$(state_init pi-seed)"
printf 'spec' > "$RDSEED/spec.md"; state_put_key "$RDSEED" spec - spec.md
printf -- '- [ ] item-A\n' > "$RDSEED/backlog.md"; state_put_key "$RDSEED" backlog - backlog.md
_sj "$RDSEED" --arg sr "$RSRC" '.source_repo=$sr'
# Fake worker: records whether the seeded file was present at the moment pi was invoked.
FPI_SEED="$(mktemp)"; cat > "$FPI_SEED" <<'WSD'
#!/usr/bin/env bash
[ -f "$1/existing.txt" ] && echo saw-seed >> "$1/progress.txt" || echo no-seed >> "$1/progress.txt"
WSD
chmod +x "$FPI_SEED"
STEP_SEED='{"id":"build","type":"pi-loop","reads":"spec","backlog":"backlog","writes":"validated","model":"exec-free","max_cycles":3,"max_items":10}'
PI_IMPLEMENT="$FPI_SEED" TEST_RUNNER="$FTR" pipeline_pi_loop "$RDSEED" "$STEP_SEED" >/dev/null 2>&1
eq "workspace seeded with source file" "$(cat "$RDSEED/workspace/existing.txt" 2>/dev/null)" "existing content"
eq "worker saw seed before first call" "$(head -1 "$RDSEED/workspace/progress.txt" 2>/dev/null)" "saw-seed"

echo "== pipeline_pi_loop leaves workspace empty when no source_repo (base behavior) =="
RDNO="$(state_init pi-noseed)"
printf 'spec' > "$RDNO/spec.md"; state_put_key "$RDNO" spec - spec.md
printf -- '- [ ] only\n' > "$RDNO/backlog.md"; state_put_key "$RDNO" backlog - backlog.md
PI_IMPLEMENT="$FPI" TEST_RUNNER="$FTR" pipeline_pi_loop "$RDNO" \
  '{"id":"b","type":"pi-loop","reads":"spec","backlog":"backlog","writes":"v","model":"exec-free","max_cycles":3,"max_items":10}' >/dev/null 2>&1
eq "no source file in workspace" "$([ -e "$RDNO/workspace/existing.txt" ] && echo present || echo gone)" "gone"
```

> If `$FTR` (green fake test-runner) or `$FPI` is defined *after* this block in the current file, move this block below their definitions — they must be in scope. In the WS5/WS6 `test_pi_loop.sh` both are defined in the first `pipeline_pi_loop` test, near the top.

- [ ] **Step 2: Run — fails** (workspace not seeded; `existing.txt` absent → `saw-seed` assertion fails):

Run: `cd ~/Code/hermes-dispatch && tests/test_pi_loop.sh`

- [ ] **Step 3: Implement.** In `lib/orchestrate.sh` `pipeline_pi_loop`, immediately after `local ws="$rd/workspace"; mkdir -p "$ws"` (currently ~L308), add:

```bash
  # WS7: seed an existing project into the workspace before building. Only when a source repo
  # is set AND the workspace is still empty — a RESUMED run already holds the seeded tree + prior
  # pi edits, and re-seeding would clobber in-progress work.
  local source_repo; source_repo="$(jq -r '.source_repo // ""' "$rd/state.json" 2>/dev/null || true)"
  if [ -n "$source_repo" ] && [ -d "$source_repo" ] && [ -z "$(ls -A "$ws" 2>/dev/null)" ]; then
    printf '  ⤵ %s: seeding workspace from %s\n' "$id" "$source_repo" >&2
    "$REPO_ROOT/bin/seed-workspace.sh" "$ws" "$source_repo" >>"$rd/$id.stderr" 2>&1 || true
  fi
```

- [ ] **Step 4: Run — passes** (new seeding tests + all prior pi-loop tests): `tests/test_pi_loop.sh`, and `tests/test_orchestrate.sh` still green.

- [ ] **Step 5: Commit**

```bash
git add lib/orchestrate.sh tests/test_pi_loop.sh
git commit -m "feat: pi-loop seeds workspace from source_repo (guarded for resume)"
```

---

## Phase B — Project context reading

### Task B1: `bin/read-project-context.sh`

**Files:** Create `bin/read-project-context.sh`; Test `tests/test_project.sh`.

- [ ] **Step 1: Add failing tests** (append to `tests/test_project.sh` before the summary line)

```bash
echo "== read-project-context.sh surfaces stack + README + tree =="
CTXSRC="$(mktemp -d)"
printf '{"name":"demo"}' > "$CTXSRC/package.json"
printf '# Demo\nA thing.\n' > "$CTXSRC/README.md"
printf 'x=1\n' > "$CTXSRC/app.js"
CTXRD="$(mktemp -d)"; printf '{"source_repo":"%s"}\n' "$CTXSRC" > "$CTXRD/state.json"
CTX="$(printf 'my goal' | "$ROOT/bin/read-project-context.sh" "$CTXRD" 2>/dev/null)"
eq "context tech stack node"  "$(printf '%s' "$CTX" | grep -q 'node (package.json)' && echo yes || echo no)" "yes"
eq "context README content"   "$(printf '%s' "$CTX" | grep -q 'A thing.' && echo yes || echo no)" "yes"
eq "context lists app.js"     "$(printf '%s' "$CTX" | grep -q 'app.js' && echo yes || echo no)" "yes"
eq "context project heading"  "$(printf '%s' "$CTX" | grep -q '## Project context' && echo yes || echo no)" "yes"

echo "== read-project-context.sh degrades to greenfield with no source repo =="
GRD="$(mktemp -d)"; printf '{}\n' > "$GRD/state.json"
GCTX="$(printf 'g' | "$ROOT/bin/read-project-context.sh" "$GRD" 2>/dev/null)"
eq "greenfield note present"  "$(printf '%s' "$GCTX" | grep -q 'greenfield' && echo yes || echo no)" "yes"
```

- [ ] **Step 2: Run — fails** (`read-project-context.sh: No such file or directory`): `tests/test_project.sh`.

- [ ] **Step 3: Implement `bin/read-project-context.sh`**

```bash
#!/usr/bin/env bash
# read-project-context.sh — emit a structured Markdown snapshot of an EXISTING project so the
# planner can build ON it rather than from scratch. Reads `source_repo` from the run's state.json
# (run dir via $1 or $RUN_DIR). stdin (the goal) is echoed into the header. stdout = the context
# (captured to the `context` key by the tool step). With no source repo, emits a valid greenfield
# stub so the planner still gets a well-formed section.
# NOTE: uses BSD `stat -f` for mtime (darwin host). Filenames with spaces in the "recent files"
# scan may be skipped — best-effort, the file tree still lists them.
set -uo pipefail
run_dir="${1:-${RUN_DIR:-}}"
goal="$(cat 2>/dev/null || true)"
src=""
[ -n "$run_dir" ] && [ -f "$run_dir/state.json" ] && \
  src="$(jq -r '.source_repo // ""' "$run_dir/state.json" 2>/dev/null || true)"

printf '## Project context\n\n'
[ -n "$goal" ] && printf '> Goal: %s\n\n' "$(printf '%s' "$goal" | head -1)"

if [ -z "$src" ] || [ ! -d "$src" ]; then
  printf '## Tech stack\n(no source repo — greenfield build)\n\n## File tree\n(none)\n'
  exit 0
fi

PRUNE=( -name .git -o -name node_modules -o -name vendor -o -name .venv -o -name __pycache__ )

printf '## Tech stack\n'
stack=""
[ -f "$src/package.json" ]   && stack="${stack}- node (package.json)\n"
[ -f "$src/pyproject.toml" ] && stack="${stack}- python (pyproject.toml)\n"
[ -f "$src/setup.py" ]       && stack="${stack}- python (setup.py)\n"
[ -f "$src/composer.json" ]  && stack="${stack}- php (composer.json)\n"
[ -f "$src/go.mod" ]         && stack="${stack}- go (go.mod)\n"
[ -f "$src/Makefile" ]       && stack="${stack}- make (Makefile)\n"
if [ -n "$stack" ]; then printf '%b' "$stack"; else printf '(unrecognized)\n'; fi
printf '\n'

printf '## Test command\n'
tc=""
[ -f "$src/hermes.json" ] && tc="$(jq -r '.test // empty' "$src/hermes.json" 2>/dev/null || true)"
if [ -n "$tc" ]; then printf '`%s`  (from hermes.json)\n\n' "$tc"
else printf '(auto-detected by test-runner.sh at build time)\n\n'; fi

printf '## File tree\n```\n'
( cd "$src" && find . -maxdepth 3 \( "${PRUNE[@]}" \) -prune -o -print 2>/dev/null \
    | sed 's|^\./||' | grep -v '^\.$' | grep -v '^$' | sort | head -200 )
printf '```\n\n'

printf '## Key files\n\n'
for r in README.md README README.txt readme.md; do
  if [ -f "$src/$r" ]; then
    printf '### %s\n```\n' "$r"; head -100 "$src/$r"; printf '\n```\n\n'; break
  fi
done
# Up to 3 most-recently-modified regular files <=100 lines, excluding heavy dirs + the README.
while IFS= read -r f; do
  [ -f "$f" ] || continue
  lines="$(wc -l < "$f" 2>/dev/null | tr -d ' ')"; [ -n "$lines" ] || lines=0
  [ "$lines" -le 100 ] || continue
  rel="${f#"$src"/}"
  printf '### %s\n```\n' "$rel"; cat "$f"; printf '\n```\n\n'
done < <( find "$src" \( "${PRUNE[@]}" \) -prune -o -type f -print 2>/dev/null \
  | grep -viE '/(README|readme)[^/]*$' \
  | while IFS= read -r p; do stat -f '%m %N' "$p" 2>/dev/null; done \
  | sort -rn | head -3 | cut -d' ' -f2- )
```

- [ ] **Step 4: Run — passes.** Run: `cd ~/Code/hermes-dispatch && chmod +x bin/read-project-context.sh && tests/test_project.sh`.

- [ ] **Step 5: Commit**

```bash
git add bin/read-project-context.sh tests/test_project.sh
git commit -m "feat: add read-project-context.sh (structured codebase context for the planner)"
```

### Task B2: planner uses `## Project context`

**Files:** Modify `agents/impl-planner/SOUL.md`.

- [ ] **Step 1: Read** `agents/impl-planner/SOUL.md` in full — note the `## Overview` / `## Tasks` / `## Checkpoints` / `## Backlog` output contract and the WS5.1 green-slice rule.

- [ ] **Step 2: Edit `SOUL.md`.** Add a section (near the input-handling / before the OUTPUT CONTRACT) instructing context-aware planning. Insert:

```markdown
## Existing-project input (WS7)

Your input may begin with a `## Project context` section (tech stack, test command, file tree,
key file contents) produced from an existing codebase. When it is present:

- Plan changes that build ON the existing structure. Reference real files and modules from the
  tree by path; reuse the project's conventions and test command rather than inventing new ones.
- Do NOT propose re-creating files that already exist. If a backlog item would create a file that
  the tree already lists, reframe it as an EDIT to that file and say so.
- Flag conflicts explicitly: if an item collides with existing behavior, note the risk in the
  task and scope the change to the smallest safe slice.

When no `## Project context` section is present, plan greenfield exactly as before. Either way the
`## Backlog` items stay green-reaching vertical slices (WS5.1) — implement behavior + its test
together; never split "write a failing test" from "make it pass."
```

- [ ] **Step 3: Sanity check** (needs LiteLLM up) — feed a fake context + goal and confirm the planner still emits a `## Backlog`:

```bash
cd ~/Code/hermes-dispatch
printf '## Project context\n## Tech stack\n- python (pyproject.toml)\n## File tree\n```\nmathx.py\n```\n\n---\nGoal: add a divide(a,b) function with a test\n' \
  | agents/impl-planner/run.sh | grep -c '^- \[ \] '
```
Expected: ≥ 1, and the plan text references `mathx.py`.

- [ ] **Step 4: Commit**

```bash
git add agents/impl-planner/SOUL.md
git commit -m "feat: impl-planner plans on existing structure when project context is present"
```

### Task B3: tool steps can read `state.json` (`RUN_DIR` export)

**Files:** Modify `lib/orchestrate.sh` (`pipeline_run` tool branch); Test `tests/test_project.sh`.

> The `existing-project-loop.json` pipeline file itself is created in Task D1. B3 delivers the mechanism the context step depends on: a tool step currently pipes its `reads` key to stdin but has no way to reach the run dir, so `read-project-context.sh` couldn't find `state.json`. Export `RUN_DIR` in the tool dispatch (additive — existing tools ignore it).

- [ ] **Step 1: Add failing test** (append to `tests/test_project.sh` before the summary line)

```bash
echo "== pipeline_run tool step exports RUN_DIR =="
# shellcheck source=/dev/null
source "$ROOT/lib/orchestrate.sh"; set +e +u
SBT="$(mktemp -d)"; REPO_ROOT="$SBT"; RUN_ROOT="$SBT/run"; mkdir -p "$RUN_ROOT" "$SBT/bin" "$SBT/pipelines"
cat > "$SBT/bin/echo-rundir.sh" <<'ERD'
#!/usr/bin/env bash
cat >/dev/null          # ignore piped stdin (the reads key)
printf 'RUN_DIR=%s\n' "${RUN_DIR:-UNSET}"
ERD
chmod +x "$SBT/bin/echo-rundir.sh"
cat > "$SBT/pipelines/t.json" <<'PIPE'
{ "name":"t", "steps":[ {"id":"probe","type":"tool","cmd":"bin/echo-rundir.sh","reads":"input","writes":"out","format":"txt"} ] }
PIPE
RDT="$(state_init t)"; printf 'x' > "$RDT/input.txt"; state_put_key "$RDT" input - input.txt
pipeline_run "$RDT" "$SBT/pipelines/t.json" >/dev/null 2>&1
eq "tool saw RUN_DIR"  "$(grep -c "RUN_DIR=$RDT" "$RDT/out.txt" 2>/dev/null)" "1"
```

- [ ] **Step 2: Run — fails** (`RUN_DIR=UNSET`): `tests/test_project.sh`.

- [ ] **Step 3: Implement.** In `lib/orchestrate.sh` `pipeline_run`, inside the `if [ "$typ" = "tool" ]; then` branch, right after `state_step_start "$rd" "$id" "$cmd" "$reads_key" "$writes"` (currently ~L69), add:

```bash
      export RUN_DIR="$rd"   # WS7: let tools (e.g. read-project-context.sh) read state.json
```

- [ ] **Step 4: Run — passes** (new test + all prior): `tests/test_project.sh`, `tests/test_orchestrate.sh`.

- [ ] **Step 5: Commit**

```bash
git add lib/orchestrate.sh tests/test_project.sh
git commit -m "feat: export RUN_DIR to tool steps so they can read state.json"
```

---

## Phase C — Project-aware test runner

### Task C1: `hermes.json` override in `test-runner.sh`

**Files:** Modify `lib/test-runner.sh`; Test `tests/test_project.sh`.

> The runner already detects node/php/python/make. C1 adds a project-declared override as the highest-priority command source, so a repo can pin its real test command (`hermes.json: {"test": "npm run test:ci"}`).

- [ ] **Step 1: Add failing tests** (append to `tests/test_project.sh` before the summary line)

```bash
echo "== test-runner.sh: hermes.json .test wins =="
TRWS="$(mktemp -d)"
printf '{"test":"echo UNIT_OK; exit 0"}\n' > "$TRWS/hermes.json"
TR_OUT="$("$ROOT/lib/test-runner.sh" "$TRWS" 2>/dev/null)"
eq "hermes.json ok true"   "$(printf '%s' "$TR_OUT" | jq -r '.ok')" "true"
eq "hermes.json unit cmd"  "$(printf '%s' "$TR_OUT" | jq -r '.layers.unit.cmd')" "echo UNIT_OK; exit 0"

echo "== test-runner.sh: hermes.json overrides package.json =="
TRWS2="$(mktemp -d)"
printf '{"scripts":{"test":"exit 1"}}\n' > "$TRWS2/package.json"
printf '{"test":"exit 0"}\n' > "$TRWS2/hermes.json"
TR_OUT2="$("$ROOT/lib/test-runner.sh" "$TRWS2" 2>/dev/null)"
eq "override beats package.json" "$(printf '%s' "$TR_OUT2" | jq -r '.layers.unit.cmd')" "exit 0"
eq "override run is green"       "$(printf '%s' "$TR_OUT2" | jq -r '.ok')" "true"
```

- [ ] **Step 2: Run — fails** (no `hermes.json` handling; TRWS finds no unit command → `ok:false`): `tests/test_project.sh`.

- [ ] **Step 3: Implement.** In `lib/test-runner.sh`, add the `hermes.json` check as the first on-disk source in each detector (after the existing `*_CMD` env-override line, before the `package.json` branch).

In `detect_unit`, after `[ -n "${UNIT_CMD+x}" ] && { printf '%s' "$UNIT_CMD"; return; }`:

```bash
  if [ -f hermes.json ]; then
    local hc; hc="$(jq -r '.test // empty' hermes.json 2>/dev/null || true)"
    [ -n "$hc" ] && { printf '%s' "$hc"; return; }
  fi
```

In `detect_integration`, after `[ -n "${INTEGRATION_CMD+x}" ] && { printf '%s' "$INTEGRATION_CMD"; return; }`:

```bash
  if [ -f hermes.json ]; then
    local hc; hc="$(jq -r '.integration // empty' hermes.json 2>/dev/null || true)"
    [ -n "$hc" ] && { printf '%s' "$hc"; return; }
  fi
```

In `detect_playwright`, after `[ -n "${PLAYWRIGHT_CMD+x}" ] && { printf '%s' "$PLAYWRIGHT_CMD"; return; }`:

```bash
  if [ -f hermes.json ]; then
    local hc; hc="$(jq -r '.playwright // empty' hermes.json 2>/dev/null || true)"
    [ -n "$hc" ] && { printf '%s' "$hc"; return; }
  fi
```

(All three run with cwd = `$WS`, so bare `hermes.json` resolves. The output JSON shape is unchanged.)

- [ ] **Step 4: Run — passes** (new tests + existing detection unaffected): `tests/test_project.sh`. If a `tests/test_test_runner.sh` exists, run it too and confirm green.

- [ ] **Step 5: Commit**

```bash
git add lib/test-runner.sh tests/test_project.sh
git commit -m "feat: test-runner honors hermes.json test/integration/playwright override"
```

---

## Phase D — Pipeline + server + command-center

### Task D1: `pipelines/existing-project-loop.json`

**Files:** Create `pipelines/existing-project-loop.json`.

- [ ] **Step 1: Create the pipeline**

```json
{
  "name": "existing-project-loop",
  "description": "Coding loop over an EXISTING project (WS7): read context -> plan on top -> gate -> backlog-driven pi-loop with the source repo seeded into the workspace. Pass an optional source_repo.",
  "steps": [
    { "id": "context", "type": "tool", "cmd": "bin/read-project-context.sh", "reads": "input",
      "writes": "context", "format": "md",
      "note": "Reads source_repo from state.json; emits a '## Project context' snapshot." },
    { "id": "plan", "type": "agent", "agent": "impl-planner", "reads": ["context", "input"],
      "writes": "spec", "format": "md",
      "note": "Plans ON the existing structure when '## Project context' is present. High-stakes: seed 'spec' from Claude Code instead." },
    { "id": "backlog", "type": "tool", "cmd": "bin/extract-backlog.sh", "reads": "spec", "writes": "backlog",
      "note": "Pull the '- [ ]' checklist out of the plan into its own key." },
    { "id": "spec-approval", "type": "gate", "gate": "Approve spec + backlog before autonomous build" },
    { "id": "build", "type": "pi-loop", "reads": "spec", "backlog": "backlog", "writes": "validated",
      "model": "exec-cloud", "escalation_model": "plan-frontier", "max_cycles": 5, "max_items": 50,
      "llm_key_env": "KEY_PUBLIC" }
  ]
}
```

- [ ] **Step 2: Verify it resolves + lists** (offline): the pipeline JSON parses and is discoverable.

```bash
cd ~/Code/hermes-dispatch
jq -e '.steps | length == 5' pipelines/existing-project-loop.json
bin/run-pipeline.sh --resume 2>&1 | head -0 || true   # sanity: script present
```
Expected: `jq` prints `true`.

- [ ] **Step 3: Commit**

```bash
git add pipelines/existing-project-loop.json
git commit -m "feat: add existing-project-loop pipeline (context/plan/backlog/gate/build)"
```

### Task D2: server + run-pipeline persist `source_repo`

**Files:** Modify `bin/run-pipeline.sh`, `dispatch/server.py`; Test `tests/test_project.sh` (persistence unit).

- [ ] **Step 1: Add a failing persistence test** (append to `tests/test_project.sh` before the summary line). This exercises the exact snippet run-pipeline.sh uses.

```bash
echo "== source_repo persists to state.json (run-pipeline.sh snippet) =="
# shellcheck source=/dev/null
source "$ROOT/lib/orchestrate.sh"; set +e +u
SPRD="$(mktemp -d)"; REPO_ROOT="$SPRD"; RUN_ROOT="$SPRD/run"; mkdir -p "$RUN_ROOT"
SR="$(mktemp -d)"
SRRD="$(state_init srdemo)"
SOURCE_REPO="$SR"
if [ -n "${SOURCE_REPO:-}" ] && [ -d "$SOURCE_REPO" ]; then _sj "$SRRD" --arg sr "$SOURCE_REPO" '.source_repo=$sr'; fi
eq "state.source_repo set"       "$(jq -r '.source_repo' "$SRRD/state.json")" "$SR"
# unset / bad path => field stays absent
SRRD2="$(state_init srdemo2)"
SOURCE_REPO="/nope-not-a-dir"
if [ -n "${SOURCE_REPO:-}" ] && [ -d "$SOURCE_REPO" ]; then _sj "$SRRD2" --arg sr "$SOURCE_REPO" '.source_repo=$sr'; fi
eq "bad path => no source_repo"  "$(jq -r '.source_repo // "absent"' "$SRRD2/state.json")" "absent"
```

- [ ] **Step 2: Run — fails** if the block is copied wrong; passes trivially since it inlines the logic — its purpose is to lock the exact guard (`-d` test) that run-pipeline.sh must use. Run: `tests/test_project.sh`.

- [ ] **Step 3: Implement `bin/run-pipeline.sh`.** After `state_put_key "$RUN_DIR" "input" "-" "input.txt"` (the non-resume path), add:

```bash
# WS7: persist an optional source repo (an existing checkout) to seed the pi-loop workspace.
# Passed in by the server via the SOURCE_REPO env var (run-pipeline.sh owns run-dir creation,
# so the server can't write to the run dir directly at init).
if [ -n "${SOURCE_REPO:-}" ] && [ -d "${SOURCE_REPO:-}" ]; then
  _sj "$RUN_DIR" --arg sr "$SOURCE_REPO" '.source_repo=$sr'
fi
```

- [ ] **Step 4: Implement `dispatch/server.py`.** Read `_run_pipeline_endpoint` (~L1096) and `_pipeline_worker` (~L1162) first, then:

(a) In `_run_pipeline_endpoint`, after the `message`/`pipeline` validation, read the field and pass it through:

```python
        source_repo = str(payload.get("source_repo", "")).strip() or None
```
and change the final worker dispatch to pass it:
```python
        self._pump(lambda push: self._pipeline_worker(
            push, session_id, pipeline, message, None, source_repo))
```

(b) Extend the `_pipeline_worker` signature and inject the env (resume path passes nothing, so `source_repo` defaults to `None` and the env is untouched):

```python
    def _pipeline_worker(self, push, session_id, pipeline, message, run_id, source_repo=None):
        ...
        env = pipeline_subprocess_env()
        if source_repo and not resume:
            env["SOURCE_REPO"] = source_repo
        ...
        proc = subprocess.Popen(cmd, cwd=str(REPO_ROOT), env=env,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True, bufsize=1, encoding="utf-8", errors="replace")
```

(Replace the existing inline `env=pipeline_subprocess_env()` in the `Popen(...)` call with the `env` local built just above it. Leave the resume branch and all frame parsing unchanged.)

- [ ] **Step 5: Verify** — bash tests green (`tests/test_project.sh`, `tests/test_pi_loop.sh`, `tests/test_orchestrate.sh`); server still imports and its existing tests pass (`python3 -m pytest tests/test_server.py -q`). Offline sanity for the env path: a fake run-pipeline echoing `SOURCE_REPO` is the manual check —

```bash
cd ~/Code/hermes-dispatch
SOURCE_REPO="$PWD" bash -c 'echo "$SOURCE_REPO"'   # confirms the env name the server sets
```

- [ ] **Step 6: Commit**

```bash
git add bin/run-pipeline.sh dispatch/server.py tests/test_project.sh
git commit -m "feat: thread source_repo from POST body through SOURCE_REPO env to state.json"
```

### Task D3: command-center — forward + form input

**Files:** Modify `command-center/app/routers/agents.py`, `command-center/web/js/screens/dispatch.js`.

- [ ] **Step 1: Branch the repo** — `cd ~/Code/command-center && git checkout -b feature/ws7-source-repo`.

- [ ] **Step 2: Forward `source_repo` in the proxy.** In `app/routers/agents.py`, add the field to `PipelineBody` and pass it upstream in `run_pipeline`'s `relay_upstream(...)` `json_body`:

```python
class PipelineBody(BaseModel):
    pipeline: str
    message: str
    session_id: str | None = None
    enqueue: bool = False
    source_repo: str | None = None
```
```python
        return relay_upstream(
            client=client, method="POST", url="/run-pipeline",
            json_body={"session_id": session_id, "message": body.message,
                       "source_repo": body.source_repo},
            on_terminal=on_terminal, is_disconnected=None,
        )
```

- [ ] **Step 3: Render the optional input.** In `web/js/screens/dispatch.js`, in `pipelineCardHtml`, add a source-repo input only for `existing-project-loop`:

```javascript
function pipelineCardHtml(p) {
  const name = escapeHtml(p.name || "");
  const desc = escapeHtml(p.description || p.desc || "");
  const isExisting = (p.name || "") === "existing-project-loop";
  const srcInput = isExisting
    ? `<input class="dispatch-pipeline-source" type="text" placeholder="Source repo path (optional)…" aria-label="Source repo path" />`
    : "";
  return `
    <div class="card dispatch-pipeline-card" data-pipeline="${name}">
      <div class="dispatch-pipeline-name headline-sm">${name}</div>
      ${desc ? `<div class="meta">${desc}</div>` : ""}
      <form class="dispatch-pipeline-form" data-pipeline-name="${name}">
        <input class="dispatch-pipeline-input" type="text" placeholder="Message…" aria-label="Pipeline message" required />
        ${srcInput}
        <button class="btn btn--accent" type="submit">Start</button>
      </form>
      <div class="dispatch-pipeline-progress" id="pipeline-progress-${name}" hidden></div>
    </div>`;
}
```

- [ ] **Step 4: Include it in the POST body.** In `wirePipelineForms`, read the message from the explicit class (a second input now exists) and add `source_repo` when present:

```javascript
      const pipelineName = form.dataset.pipelineName;
      const message = form.querySelector(".dispatch-pipeline-input").value.trim();
      if (!message) return;
      const sourceEl = form.querySelector(".dispatch-pipeline-source");
      const sourceRepo = sourceEl ? sourceEl.value.trim() : "";
```
```javascript
        await streamSSE("/api/run-pipeline", {
          method: "POST",
          body: { pipeline: pipelineName, message, ...(sourceRepo ? { source_repo: sourceRepo } : {}) },
          onFrame(frame) {
```

(Every other pipeline card has no `.dispatch-pipeline-source`, so `sourceEl` is null and the body is identical to today.)

- [ ] **Step 5: Manual verify** — start command-center, open the Pipelines tab: only the `existing-project-loop` card shows the source-repo input; other cards are unchanged. Launch `existing-project-loop` with a repo path and confirm (via dispatch logs / state.json) that `source_repo` reaches the run.

- [ ] **Step 6: Commit**

```bash
cd ~/Code/command-center
git add app/routers/agents.py web/js/screens/dispatch.js
git commit -m "feat: pass optional source_repo for existing-project-loop from the dispatch UI"
```

### Task D4: wire `test_project.sh` into the runner

**Files:** Modify `tests/run.sh`.

- [ ] **Step 1:** In `hermes-dispatch/tests/run.sh`, add the line that runs `test_project.sh` alongside `test_pi_loop.sh`/`test_orchestrate.sh` (match the existing invocation style).

- [ ] **Step 2: Run the full suite** — `cd ~/Code/hermes-dispatch && tests/run.sh` (or `tests/test_orchestrate.sh && tests/test_pi_loop.sh && tests/test_project.sh`). All green.

- [ ] **Step 3: Commit**

```bash
git add tests/run.sh
git commit -m "test: include test_project.sh in the suite"
```

---

## Phase E — End-to-end verify

### Task E1: run against a real existing project

**Files:** none (verification).

- [ ] **Step 1:** With LiteLLM up, point at a small real repo — `~/Code/hermes-dispatch` itself is a good target. Pick a bounded goal: **"add a `--dry-run` flag to `bin/extract-backlog.sh` that prints the parsed backlog count and exits 0, with a test."**

- [ ] **Step 2:** Launch from command-center's Pipelines tab: pipeline `existing-project-loop`, message = the goal, source repo path = `~/Code/hermes-dispatch`. (CLI equivalent: `SOURCE_REPO=~/Code/hermes-dispatch bin/run-pipeline.sh existing-project-loop "<goal>"`, then approve the gate with `bin/run-pipeline.sh --resume <run-id>`.)

- [ ] **Step 3:** Watch/confirm the chain:
  - **context** step output (the `context` key) shows `## Tech stack` with `make`/bash and a file tree listing `bin/extract-backlog.sh`.
  - **plan** produces a backlog that references the EXISTING `bin/extract-backlog.sh` (edit, not create-from-scratch).
  - **build** seeds the workspace — `run/<id>/workspace/bin/extract-backlog.sh` exists before the first pi cycle (check `run/<id>/build.stderr` for the `⤵ seeding` line).
  - the pi-loop reaches green; `state.json` `build` step is `done`, backlog fully `[x]`.

- [ ] **Step 4:** Record a short note (pass/fail + whether the plan built on existing files vs from scratch). If the context step doesn't surface the stack or the planner ignores it, STOP and fix before marking DONE.

### Task E2: mark the spec DONE

**Files:** Modify `docs/superpowers/specs/2026-07-03-ws7-existing-project-loop.md` (in claude-code-config).

- [ ] **Step 1:** Update the spec's Status to `DONE <date>` with the merge SHAs and any deviations from this plan. Commit in claude-code-config.

- [ ] **Step 2:** Merge both feature branches to main (`hermes-dispatch`, `command-center`) after E1 passes.

---

## Self-Review

- **Spec coverage:** `source_repo` first-class field (§3.1) → D2 (server + run-pipeline persistence, tested in D2.S1); workspace seeding inside `pipeline_pi_loop` (§3.2) → A1 (seeder) + A2 (guarded call + resume-safe test); context tool step + `RUN_DIR` export (§3.3) → B1 (script) + B3 (dispatch export) + B2 (planner consumption); `hermes.json` test override (§3.4) → C1; new pipeline (§3.5) → D1; server change (§3.6) → D2; CC field + form (§3.6) → D3; testing (§6) → A/B/C hermetic tests in `test_project.sh` + `test_pi_loop.sh`, E1 e2e; additive/no-regression (§8) → base greenfield paths asserted in A2 (empty-workspace) and preserved by the `-d`/empty-`ls` guards + the `isExisting` CC gate.
- **Placeholder scan:** every code step carries complete, runnable code — the two new bash scripts, the three `detect_*` inserts, the pipeline JSON, the run-pipeline snippet, the server env-inject, and both CC edits are verbatim. B2 (SOUL.md) supplies the exact Markdown block to insert; it's prose-authored content, not a stub. Server-side D2.S4 names the exact insertion points but instructs reading the real `_run_pipeline_endpoint`/`_pipeline_worker` first (server.py verbatim not fully in hand) — grounding, not a placeholder.
- **Type/signature consistency:** `seed-workspace.sh <dest> <source>` and `read-project-context.sh [run-dir]` used identically across A2/B1/D1. `source_repo` name is identical end-to-end: CC `PipelineBody.source_repo` → dispatch POST `payload["source_repo"]` → `_pipeline_worker(..., source_repo)` → env `SOURCE_REPO` → run-pipeline.sh `${SOURCE_REPO}` → `state.json.source_repo` → `jq '.source_repo'` in `pipeline_pi_loop` + `read-project-context.sh`. Pipeline step fields (`reads`/`backlog`/`writes`/`model`/`llm_key_env`) match the WS5 `pipeline_pi_loop` parser and `coding-loop.json`. `context` key written by the tool step and read by `plan`'s array `reads:["context","input"]` (the orchestrator's array-reads concat, verified present in `pipeline_run`).
- **Carried assumptions (flagged in tasks):** (1) `pipeline_pi_loop` seed insert point is right after `mkdir -p "$ws"` (A2.S3 cites ~L308 — confirm the line). (2) The tool branch insert point is after `state_step_start` in the `typ=="tool"` block (B3.S3 — read the block first). (3) `$FTR`/`$FPI` are in scope where A2's tests are appended (A2.S1 note). (4) `_run_pipeline_endpoint`/`_pipeline_worker` exact shape (D2.S4 read-first). (5) `read-project-context.sh` uses BSD `stat -f` — correct on the darwin host; a Linux CI would need `stat -c` (noted in the script header).
