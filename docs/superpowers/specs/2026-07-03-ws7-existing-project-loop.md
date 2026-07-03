# WS7 — Running the coding-loop against EXISTING projects

- **Date:** 2026-07-03
- **Status:** DRAFT (not started)
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

## 8. Out of scope

- Per-item / partial-file diffs back to the source repo (the workspace is a copy; landing changes
  back into `source_repo` is a separate WS — WS7 stops at "builds + tests pass in the workspace").
- Git-aware seeding (branch checkout, dirty-tree handling) — WS7 copies the working tree as-is.
- A private (`KEY_VAULT_PRIVATE`) existing-project variant.
- Incremental / rsync-delta re-seeding across runs.
- Changing base `coding-loop`, `pipeline_pi_loop` loop logic, or halt semantics (WS5) — WS7 only
  adds the seeding/context/override layers around them.
