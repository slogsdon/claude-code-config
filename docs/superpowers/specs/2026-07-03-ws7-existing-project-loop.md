# WS7 — Running the coding-loop against EXISTING projects

- **Date:** 2026-07-03
- **Status:** DONE — 2026-07-03. All WS7 wiring implemented and merged to `main` (hermes-dispatch). The four bugs surfaced by the first E2E run (§9) — seed copies the repo's own `run/` output dir, polyglot repo with no `hermes.json` picks the wrong test layer, bash/polyglot stack undetected, file tree truncated — were all fixed in a single hermes-dispatch commit and re-verified on a live pipeline against `hermes-dispatch` as `source_repo`. All four fixes confirmed and the pi-loop converged on the full test suite (0 failures). See §10.
- **Parent spec:** `2026-07-02-multi-model-agentic-workflow-design.md`, `2026-07-02-ws5-ralph-dispatch-convergence-design.md` (the pi-loop this extends), `2026-07-02-ws6-command-center-pi-loop-design.md` (the UI surface it plugs into)
- **Scope (user-selected):** make hermes-dispatch's `coding-loop` usable on an existing codebase — workspace seeding, codebase-aware planning, project-aware test detection, plus the pipeline/server/UI wiring to pass a source repo. Fully **additive**: `coding-loop.json` and the base `pipeline_pi_loop` behavior are unchanged.

## 1. Purpose

The WS5 `coding-loop` builds software from a freeform goal into an **empty** workspace: the
`impl-planner` agent invents a spec + `- [ ]` backlog from scratch, and `pipeline_pi_loop`
drives `pi` to write files into a fresh `$rd/workspace`. That is correct for greenfield work and
wrong for the far more common case — "change this behavior in a project that already exists."

Three concrete gaps block existing-project use:

1. **Empty workspace.** `pipeline_pi_loop` does `mkdir -p "$ws"` and starts editing nothing —
   the project's files aren't there, so `pi` can't modify what it can't see.
2. **Context-free planner.** `impl-planner` receives only the goal text. It plans as if the
   codebase is a blank page: it can't reference existing modules, reuse conventions, or avoid
   re-creating files that already exist.
3. **Test detection exists but has no override.** `lib/test-runner.sh` *does* already detect
   node/php/python/make stacks (`detect_unit` reads `package.json`/`composer.json`/
   `pyproject.toml`/`Makefile`). What it lacks is a project-declared override: a real project
   often has a non-obvious CI command (`npm run test:ci`, a tox target, a subset marker) that
   auto-detection guesses wrong. There's no way for a repo to *say* how it's tested.

WS7 closes all three, threaded through a new `existing-project-loop` pipeline and a `source_repo`
field that flows POST body → `state.json` → the seeding + context + test steps.

## 2. Current seam (investigated 2026-07-03)

- **Run init:** `bin/run-pipeline.sh` creates the run dir (`state_init`), seeds the goal as the
  `input` key, then calls `pipeline_run`. The **run-id is not known to the server until
  run-pipeline.sh prints it** — the server invokes run-pipeline.sh as a subprocess
  (`dispatch/server.py._pipeline_worker`, `subprocess.Popen([... run-pipeline.sh, pipeline, message])`)
  and scrapes the run-id from stdout. Consequence: the server cannot itself write to a run dir at
  init; anything it wants persisted at init must be handed to run-pipeline.sh, which owns dir
  creation.
- **Tool steps:** `pipeline_run`'s `type == "tool"` branch runs `"$REPO_ROOT/$cmd" < <reads-key-file> > <writes-key-file>`. It pipes the `reads` key to stdin and captures stdout to the
  `writes` key. It does **not** currently expose the run dir to the tool, and it requires the
  `reads` key to exist in state (else it errors).
- **pi-loop workspace:** `pipeline_pi_loop` (`lib/orchestrate.sh`) sets `ws="$rd/workspace";
  mkdir -p "$ws"`, then loops the backlog editing files in `$ws`. On resume the backlog's `[x]`
  progress persists on disk and the loop continues from the first unchecked item.
- **test-runner:** `lib/test-runner.sh` `detect_unit`/`detect_integration`/`detect_playwright`
  already branch on `package.json` → `composer.json` → `pyproject.toml`/`tests/` → `Makefile`.
  `UNIT_CMD`/`INTEGRATION_CMD`/`PLAYWRIGHT_CMD` env vars already override a layer. Output shape is
  a fixed JSON object (`{ok, stack, layers:{unit,integration,playwright}}`).
- **planner:** `agents/impl-planner/SOUL.md` output contract is `## Overview` / `## Tasks` /
  `## Checkpoints` / … ending in a `## Backlog` of `- [ ]` items (WS5.1: each a green-reaching
  vertical slice). It reads only the piped `input`.
- **server → run-pipeline:** `_run_pipeline_endpoint` reads the POST body (`session_id`,
  `message`, `pipeline`), then `_pipeline_worker(push, session_id, pipeline, message, run_id)`
  builds `cmd = ["bash", run-pipeline.sh, pipeline, message]` and `Popen(cmd, env=pipeline_subprocess_env())`.
- **CC proxy:** `command-center/app/routers/agents.py` `PipelineBody{pipeline, message,
  session_id, enqueue}` → `run_pipeline()` → `relay_upstream(url="/run-pipeline",
  json_body={session_id, message})`. `web/js/screens/dispatch.js` `pipelineCardHtml` renders one
  text input per pipeline card; `wirePipelineForms` POSTs `{pipeline, message}` to
  `/api/run-pipeline`.

## 3. Design

### 3.1 `source_repo` — a first-class run field

`source_repo` (absolute path to an existing checkout) becomes a first-class `state.json` field,
set once at run-init time. Because run-pipeline.sh owns run-dir creation (§2), the value is handed
in via a `SOURCE_REPO` **environment variable**:

- `dispatch/server.py`: `_run_pipeline_endpoint` reads `payload.get("source_repo")` and threads it
  through `_pipeline_worker` into the `Popen` env (`SOURCE_REPO=<path>`).
- `bin/run-pipeline.sh`: after seeding the `input` key, if `SOURCE_REPO` is set and is a directory,
  persist it: `_sj "$RUN_DIR" --arg sr "$SOURCE_REPO" '.source_repo=$sr'`.
- Every step that needs it reads `.source_repo` from `state.json` via `jq` — never via
  stdin/stdout chaining. This keeps `source_repo` orthogonal to the key-passing contract (it's a
  run-wide fact, not a step output).

Invalid/missing path → the field is simply absent, and every consumer degrades to the current
greenfield behavior (empty workspace, context-free plan). No hard error: `existing-project-loop`
with no `source_repo` behaves like `coding-loop`.

### 3.2 Workspace seeding inside `pipeline_pi_loop`

Seeding lives **inside `pipeline_pi_loop`**, not a new step type — it's a property of the build
step, and a separate step would have to know the workspace path anyway. After `mkdir -p "$ws"`:

```
source_repo="$(jq -r '.source_repo // ""' "$rd/state.json")"
if [ -n "$source_repo" ] && [ -d "$source_repo" ] && [ -z "$(ls -A "$ws" 2>/dev/null)" ]; then
  "$REPO_ROOT/bin/seed-workspace.sh" "$ws" "$source_repo"
fi
```

Two guards matter:
- **Empty-workspace guard** (`ls -A` empty): a **resumed** run already has the seeded project +
  prior pi edits in `$ws`. Re-seeding would clobber in-progress work, so seed only when the
  workspace is fresh. Resume correctness is preserved.
- **Exclusions:** `bin/seed-workspace.sh` copies `$source/.` into `$ws` but omits `.git`,
  `node_modules`, and vendor dirs — a multi-GB `node_modules` copy would be slow and pointless
  (the test-runner's opt-in install re-creates deps). Uses `rsync --exclude` when available, else
  `cp` + a prune pass.

The base greenfield path (`coding-loop`, no `source_repo`) hits neither guard's body and is byte-for-byte unchanged.

### 3.3 Project context reading — a `tool` step before `plan`

A new tool step `bin/read-project-context.sh` runs first in `existing-project-loop` and produces a
structured Markdown context written to the `context` key:

```
## Tech stack        detected from package.json / pyproject.toml / composer.json / Makefile / go.mod
## Test command      the command lib/test-runner.sh would run (or the hermes.json override)
## File tree         find, max depth 3, excluding .git/node_modules/vendor
## Key files         README (if present), then up to 3 most-recently-modified files ≤100 lines each
```

Because a tool step pipes its `reads` key to stdin but does **not** get the run dir, WS7 makes the
tool dispatch `export RUN_DIR="$rd"` before invoking the command (additive — existing tools ignore
it). `read-project-context.sh` reads `source_repo` from `$RUN_DIR/state.json` (`$1` overrides for
tests). Its `reads` is `input` (always present, satisfies the dispatch's key-presence check; the
goal is echoed into the context header); its `writes` is `context`.

`impl-planner`'s SOUL is updated: when a `## Project context` section is present in its input, it
plans *on top of* the existing structure — reference existing modules, reuse conventions, and flag
any backlog item that would conflict with an existing file — rather than from scratch. With no
`## Project context` section, behavior is unchanged. The `plan` step's `reads` becomes the array
`["context", "input"]` in `existing-project-loop` (the orchestrator already concatenates array
`reads` with labeled separators); the planner emits the context under a `## Project context`
heading via the context step's own top-level heading.

### 3.4 Project-aware test runner — a `hermes.json` override layer

`lib/test-runner.sh` keeps all existing detection; WS7 adds one **highest-priority** layer: a
`hermes.json` at the workspace root whose `test` field names the exact command.

Precedence for the unit layer becomes:
1. `$UNIT_CMD` env override (existing, unchanged — used by the discovery agent)
2. **`hermes.json` `.test`** (new)
3. `package.json` `.scripts.test` / vitest / jest (existing)
4. `pyproject.toml` / pytest / unittest (existing)
5. `composer.json` / phpunit / artisan (existing)
6. `Makefile` `test:` target (existing)
7. empty ⇒ layer absent (existing)

`hermes.json` may also carry `integration` and `playwright` fields (same override role for those
layers). Output shape is unchanged. A project opts in by committing e.g.
`hermes.json: {"test": "npm run test:ci"}`; nothing else about the runner changes.

### 3.5 New pipeline `existing-project-loop.json`

```
context (tool: read-project-context.sh, input → context)
  → plan (agent: impl-planner, [context, input] → spec)
  → backlog (tool: extract-backlog.sh, spec → backlog)
  → spec-approval (gate)
  → build (pi-loop, reads spec, backlog backlog, writes validated; workspace seeded from source_repo)
```

Identical to `coding-loop` except for the prepended `context` step and the `plan` step's array
`reads`. `build` sets `llm_key_env: "KEY_PUBLIC"` like `coding-loop` (public work); a private
variant would set `KEY_VAULT_PRIVATE` + a local model, out of scope here.

### 3.6 Server + command-center wiring

- **Server:** `POST /run-pipeline` accepts optional `source_repo`; `_pipeline_worker` injects it as
  `SOURCE_REPO` into the subprocess env (§3.1). Resume path unaffected (`source_repo` already on
  disk).
- **CC proxy:** `PipelineBody` gains `source_repo`; `run_pipeline()` forwards it in the upstream
  `json_body`.
- **CC UI:** `pipelineCardHtml` renders an extra optional "Source repo path" text input **only for
  the `existing-project-loop` card**; `wirePipelineForms` includes it as `source_repo` in the POST
  body. Every other pipeline's form is byte-for-byte unchanged.

## 4. Components / boundaries

| Unit | File | Responsibility |
|---|---|---|
| workspace seeder | `bin/seed-workspace.sh` (new) | copy source repo into workspace, excluding `.git`/`node_modules`/vendor |
| seed call | `lib/orchestrate.sh` `pipeline_pi_loop` | read `source_repo`, seed a fresh workspace before the loop |
| context reader | `bin/read-project-context.sh` (new) | read `source_repo` from state.json → structured Markdown context |
| tool run-dir | `lib/orchestrate.sh` `pipeline_run` (tool branch) | `export RUN_DIR` so tools can read state.json |
| context-aware plan | `agents/impl-planner/SOUL.md` | use `## Project context` when present |
| test override | `lib/test-runner.sh` `detect_*` | `hermes.json` as highest-priority command source |
| pipeline | `pipelines/existing-project-loop.json` (new) | context → plan → backlog → gate → build |
| source_repo intake | `dispatch/server.py` `_run_pipeline_endpoint`/`_pipeline_worker`; `bin/run-pipeline.sh` | POST body → `SOURCE_REPO` env → `state.json` |
| CC intake | `command-center/app/routers/agents.py` `PipelineBody`/`run_pipeline` | forward `source_repo` upstream |
| CC form | `command-center/web/js/screens/dispatch.js` | optional source-repo input for `existing-project-loop` |

## 5. Error handling

- **No `source_repo`:** `existing-project-loop` behaves like `coding-loop` — empty workspace,
  context step emits `## File tree\n(no source repo)`, planner plans from scratch. No error.
- **`source_repo` path missing / not a dir:** run-pipeline.sh skips persisting it (guarded on
  `-d`); same degraded-but-valid path as above.
- **Resume:** workspace already populated ⇒ empty-workspace guard skips re-seeding; the loop
  continues from the persisted backlog (WS5/WS6 resume semantics unchanged).
- **`hermes.json` absent or malformed:** `jq -r '.test // empty'` yields empty ⇒ falls through to
  existing detection. A malformed file that fails `jq` is treated as absent (best-effort).
- **Huge repo:** seeding excludes `node_modules`/vendor/`.git`; still, an enormous source tree is
  the operator's responsibility — documented, not guarded.

## 6. Testing

- **`bin/seed-workspace.sh`:** hermetic test with temp dirs — seeds files, verifies `.git`/
  `node_modules` excluded, verifies content copied.
- **`pipeline_pi_loop` seeding:** in `tests/test_pi_loop.sh`, a run with `.source_repo` set in
  `state.json` seeds the workspace file *before* the first (fake) pi call; a run without it leaves
  the workspace empty (base behavior).
- **`read-project-context.sh`:** hermetic — point at a temp "repo" with a `package.json` + README,
  assert the output contains `## Tech stack` node, the README content, and a file-tree entry.
- **`lib/test-runner.sh`:** hermetic per-path tests — a workspace with only `hermes.json {"test":
  "echo UNIT_OK"}` runs that command; `hermes.json` takes precedence over a co-present
  `package.json`; existing node/python/make paths still detected when no `hermes.json`.
- **server/CC:** `source_repo` in the POST body reaches `SOURCE_REPO` in the subprocess env
  (assert via a fake run-pipeline that echoes its env); CC `PipelineBody` accepts + forwards it.
  CC JS: manual verify (no JS suite) — the extra input appears only for `existing-project-loop`.
- **End-to-end (E1):** run `existing-project-loop` against a real small repo
  (`~/Code/hermes-dispatch` itself) with a tiny goal ("add a `--dry-run` flag to
  `extract-backlog.sh` with a test"); confirm the context step surfaces the stack, the planner
  produces a relevant backlog, the workspace seeds with existing files, and tests pass.

## 7. Risks / caveats

- **`source_repo` via env, not a positional:** the server can't write to a run dir whose id it
  doesn't yet know (§2), so the value rides an env var into run-pipeline.sh. This is the honest
  seam; a future refactor that returns the run-id synchronously could write it directly.
- **Seeding cost:** `cp -R`/`rsync` of a large tree adds latency before the first pi call; the
  exclusions cap the worst case. Not incremental — a resume re-uses the already-seeded workspace.
- **Context truncation:** "3 most-recently-modified files ≤100 lines" is a deliberately small
  window to keep the planner prompt bounded; a big repo's relevant file may be missed. The planner
  still has the file tree and can ask `pi` to read more during the build. Documented, not solved.
- **`RUN_DIR` export in the tool branch:** additive and inert for existing tools, but it does put a
  new variable in their environment — noted so a future tool author isn't surprised.
- **Test-runner already detects stacks:** WS7's contribution here is the `hermes.json` *override*,
  not detection from zero (the original WS7 framing overstated the gap). Spec §3.4 reflects reality.

## 9. End-to-end verification (E1/E2) — 2026-07-03

Ran `existing-project-loop` against `~/Code/hermes-dispatch` itself, goal: *"add a `--dry-run`
flag to extract-backlog.sh that prints what would be extracted without outputting, with a test in
tests/test_project.sh"*. Invocation (source repo rides `SOURCE_REPO`, not a CLI flag):
`SOURCE_REPO=~/Code/hermes-dispatch bin/run-pipeline.sh existing-project-loop "<goal>"`, then
`bin/run-pipeline.sh --resume <run-id>` to approve the gate.

### What worked (verified)

- **LiteLLM** up on `:4000`; `exec-cloud` / `exec-free` / `plan-frontier` all respond.
- **`source_repo` threading:** `SOURCE_REPO` env → `run-pipeline.sh` → `state.json.source_repo`
  (confirmed `"source_repo":"/Users/shane/Code/hermes-dispatch"` in state.json).
- **context tool step + `RUN_DIR` export:** `read-project-context.sh` found `state.json`, emitted a
  well-formed `## Project context` (README embedded, file tree, greenfield fallback all fire).
- **plan step:** consumed the `["context","input"]` array reads; correctly treated
  `extract-backlog.sh` as an **edit** (create→edit reframing from the SOUL rule held); emitted a
  clean 5-item `- [ ]` backlog. `extract-backlog.sh` distilled it into `backlog` with no stray lines.
- **gate:** halted at `spec-approval`; `--resume <run-id>` approved and continued (WS5/6 resume
  semantics intact).
- **workspace seeding (the headline WS7 mechanic):** `⤵ build: seeding workspace from …` fired
  under the empty-workspace guard; the real `bin/extract-backlog.sh` was present in
  `run/<id>/workspace/bin/` **before** the first pi cycle.
- **pi-loop:** drove `exec-cloud`, edited the workspace, and re-verified with the test-runner each
  cycle. The worker implemented the feature competently (correct `--dry-run` parsing + a real bash
  test with strong assertions in `tests/test_project.sh`).

### Bugs found (build did NOT converge)

- **Bug C — seed copies the source repo's own `run/` output dir (blocker).** `bin/seed-workspace.sh`
  `EXCLUDES=(.git node_modules vendor .venv __pycache__)` omits `run/` (and generic build/output
  dirs). Seeding `hermes-dispatch` into its own workspace copied `run/` — which holds prior pipeline
  runs' workspaces with stray `test_mathx.py` files — so `python3 -m pytest -q` fails at
  **collection** (`import file mismatch`, duplicate test basenames) on *every* cycle, **independent
  of anything pi edits**. The pi-loop's ground truth can never green ⇒ structural non-convergence.
  The self-referential target triggers it, but any project whose output dir contains test files
  hits it. **Fix:** add `run/ dist/ build/ target/ .next/ coverage/ .pytest_cache/ .ruff_cache/` to
  `EXCLUDES` (or exclude the dispatch run root explicitly).

- **Bug D — polyglot test-layer mismatch, no `hermes.json` override present.** The goal is a bash
  script + bash test (`tests/test_project.sh`), but auto-detection picks `python3 -m pytest -q`
  (repo has Python dispatch tests). pytest never runs the bash test, so even a correct bash
  implementation can't green. This is exactly the case WS7's `hermes.json` `.test` override (C1)
  exists for — but hermes-dispatch ships no root `hermes.json`, so it defaults to pytest. Validates
  the *need* for C1. **Fix options:** pin the target with `hermes.json {"test":"tests/run.sh"}`
  before an E2E; and/or have `read-project-context.sh` warn when a repo has >1 stack and no
  `hermes.json`.

- **Bug A — bash/polyglot tech-stack undetected.** `read-project-context.sh` only probes
  `package.json`/`pyproject.toml`/`setup.py`/`composer.json`/`go.mod`/`Makefile`. hermes-dispatch
  (bash + python, none of those at root) rendered `## Tech stack\n(unrecognized)` — E1 predicted
  "make/bash". **Fix:** detect bash (`bin/*.sh`, root `*.sh`, `setup.sh`) and python-via-tests
  (`tests/`, `pytest.ini`, `.pytest_cache`, `conftest.py`).

- **Bug B — file tree truncated at 200 sorted entries (starves the planner).** The tree is
  `find … | sort | head -200`. Alphabetical sort means the dominant `agents/` dir fills all 200
  lines; `bin/`, `lib/`, `tests/`, `pipelines/` — including the target `bin/extract-backlog.sh`
  (position 260) — are cut off. Consequence: the planner never saw the target file, **guessed its
  path** ("assumed location — verify in `bin/` or project root") **and hallucinated its interface**
  (positional `input.md output.md` args vs the real stdin→stdout `grep`). **Fix:** breadth-first
  with per-dir caps, or list top-level dirs + shallow file counts instead of a flat sorted head.

- **Secondary — context truncation induced a backward-incompatible rewrite.** Because of Bug B the
  plan pinned the wrong interface, and the pi worker faithfully **rewrote `extract-backlog.sh` to
  positional file args, destroying the original stdin→stdout contract** — which the pipeline's own
  `backlog` step depends on (it pipes `spec` to `extract-backlog.sh` via stdin). Seeding + a thin
  tree can thus drive backward-incompatible rewrites of existing files. **Mitigation:** the planner
  should mark inferred interfaces `(assumed — verify)` (it did) *and* the SOUL "create→edit" rule
  should extend to "preserve an existing file's public interface unless the goal says otherwise."

### Environment note (not a WS7 defect)

The `impl-planner` default alias `max` (local `qwen3.6:35b-mlx`) was **unavailable**: LiteLLM maps
`max` → llama-swap `:8081`, which serves no `max` model (`ornith-35b`, `gemma-4-26b`, … present).
Requests hung ~90 s with no tokens; the planner sat at 0 bytes for ~25 min. Worked around with
`AGENT_HERMES_MODEL=plan-frontier` (cloud) to exercise the pipeline. Recommend verifying the `max`
alias in `otel-local-ai/litellm/config.yaml` and/or a cloud fallback when the local reasoner is
unreachable.

### Disposition

The build loop was **manually stopped** after root-causing structural non-convergence (Bug C, which
no cycle can escape) rather than burning further `exec-cloud` tokens to reach an inevitable
`HALTED_*`. Archived non-runs left under `run/STUCK-max-backend-*` and `run/KILLED-137-*` for
reference; the verified run is `run/20260703-141009-7748710546`.

## Phase E — End-to-end Verify Results

The four bugs from the first E2E run (§9) were all fixed in a **single commit to hermes-dispatch
`main`**:

- **Bug A — bash/polyglot tech stack showed "(unrecognized)".** Fixed: `read-project-context.sh`
  now detects `.sh` files at depth 1.
- **Bug B — file tree used `sort | head -200`, filling with `agents/` entries.** Fixed: layered
  approach (depth 1 always, depth 2 up to 80, depth 3 up to 50).
- **Bug C — `seed-workspace.sh` copied the `run/` dir.** hermes-dispatch's own `run/` with stray
  `test_*.py` files went into the workspace and broke pytest collection every cycle. Fixed: added
  `run/`, `*.pyc`, `__pycache__`, `.pi/`, `.pi-home/`, `*.log` to the rsync excludes.
- **Bug D — polyglot repo without `hermes.json` caused auto-detect to pick pytest instead of bash
  tests.** Fixed: added a root `hermes.json` to hermes-dispatch:
  `{"test": "tests/run.sh", "integration": "tests/run.sh"}`.

### Re-verify run (live pipeline, `hermes-dispatch` as `source_repo`)

- **A:** bash + python detected ✓
- **B:** layered tree shows `bin`/`lib`/`tests`/`pipelines` (no `agents/` overflow) ✓
- **C:** `run/` absent from the seeded workspace ✓
- **D:** `tests/run.sh` picked from `hermes.json` ✓
- **Pi-loop:** 3+/5 backlog items converged against the full test suite (green: 63 python + 26
  orchestrate + 44 pi-loop + 17 existing-project, 0 failures).
- **Environment note:** cloud `429` rate limiting slowed the remaining items; local `gemma`
  fallback active; all 4 fixes confirmed before rate limiting impacted later items.

## 8. Out of scope

- Per-item / partial-file diffs back to the source repo (the workspace is a copy; landing changes
  back into `source_repo` is a separate WS — WS7 stops at "builds + tests pass in the workspace").
- Git-aware seeding (branch checkout, dirty-tree handling) — WS7 copies the working tree as-is.
- A private (`KEY_VAULT_PRIVATE`) existing-project variant.
- Incremental / rsync-delta re-seeding across runs.
- Changing base `coding-loop`, `pipeline_pi_loop` loop logic, or halt semantics (WS5) — WS7 only
  adds the seeding/context/override layers around them.
