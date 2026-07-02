# WS6 — Command-Center Exposure of the pi-loop

- **Date:** 2026-07-02
- **Status:** design (pending implementation plan)
- **Parent spec:** `2026-07-02-multi-model-agentic-workflow-design.md` §5 (WS6), `2026-07-02-ws5-ralph-dispatch-convergence-design.md`
- **Scope (user-selected):** observability (backlog progress + halt reason) **+ interactive resume**

## 1. Purpose

The WS5 `coding-loop` pipeline runs in hermes-dispatch and already appears in command-center's
pipeline list (CC reads `/pipelines` dynamically — no CC change needed to *launch* it). But the new
`pi-loop` step is nearly invisible in the UI: it prints almost nothing, writes no progress to
`state.json`, and its safety-halt reason (`HALTED_STUCK` etc.) is recorded but never surfaced. WS6
makes a pi-loop run observable and controllable from the command-center PWA:
- **Backlog progress** — "3/8 done · current: <item>".
- **Halt reason** — display `HALTED_STUCK` / `_MAXCYCLES` / `_MAXITER` / `_NOBACKLOG`.
- **Resume** — a button that re-enters the halted loop (it continues from the persisted backlog).

All changes are **additive** — existing SSE frame shapes and the current dispatch UX must not change.

## 2. Current seam (investigated 2026-07-02)

- **SSE emitter:** `dispatch/server.py._pipeline_worker` (~L1103-1161) spawns `run-pipeline.sh`, reads
  merged stdout+stderr, and regex-matches progress: `→ (\S+): (\S+)` (step), `⚙ …` (tool),
  `⟳ (\S+): test cycle (\d+)` (cycle), run-id. At step-done `_emit_step_dones` (~L1163-1178) reads
  `state.json` for exit code + summary. Frames emitted: `pipeline-start|step|cycle|note|step-done|
  gate|escalation|done`.
- **test-loop precedent:** `orchestrate.sh` `pipeline_test_loop` prints `⟳ <id>: test cycle N` (→
  `pipeline-cycle`) and `✓ <id>: tests GREEN` (→ `pipeline-note`). This is the pattern to mirror.
- **pi-loop gap:** `pipeline_pi_loop` (~L282-341) prints nothing per item/cycle; only `_halt` prints
  `✗ <id>: halted (<reason>)`. `state.json` gets `.halt` on the step but no `backlog_progress`.
- **CC rendering:** `command-center/web/js/screens/dispatch.js` (~L365-376) renders `pipeline-start/
  step` as meta lines and `gate` as an approval box; `app/sse.py` parses frames
  (`TERMINAL_TYPES={done,error,pipeline-done}`); `app/routers/agents.py` proxies `/run-pipeline` +
  `/resume-pipeline`. No backlog/halt UI today.

## 3. Design

### 3.1 pi-loop emits progress (`lib/orchestrate.sh`)
In `pipeline_pi_loop`, compute `total` once (`grep -c '^- \[' "$backlog_file"`), track `checked`, and:
- On each item start: `printf '  ▸ %s: backlog item %s/%s — %s\n' "$id" "$item_no" "$total" "$item" >&2`.
- On item green (after `backlog_check_item`): `printf '  ✓ %s: item %s/%s done\n' "$id" "$item_no" "$total" >&2`.
- Persist progress to `state.json` via `_sj`: set `backlog_progress = {total, checked, current}` on
  the running step (so CC/`state.json` readers get it without parsing stdout).
Halt output stays as `_halt`'s `✗ <id>: halted (<reason>)` + `.halt` field.

### 3.2 dispatch emits two new SSE frames (`dispatch/server.py`)
Additive, alongside the existing regex table:
- **`pipeline-backlog`** `{id, item_no, total, item}` — new regex `▸ (\S+): backlog item (\d+)/(\d+) — (.*)`
  matched in the stdout loop.
- **`pipeline-halt`** `{id, halt_reason}` — in `_emit_step_dones`, when a completed step has
  `status=="error"` and a `.halt` field, emit this before/with `pipeline-step-done`.
Existing frames and their fields are untouched. `pipeline-halt` is **non-terminal** (the run may be
resumed) — do NOT add it to `sse.py TERMINAL_TYPES`.

### 3.3 command-center renders (`web/js/screens/dispatch.js`)
New frame handlers (added after the existing pipeline handlers, existing branches unchanged):
- `pipeline-backlog` → a meta line `Backlog <item_no>/<total> · <item>` (updates in place if simple).
- `pipeline-halt` → a system line `⚠️ <id> halted: <halt_reason>` **plus a Resume button**.
The Resume button reuses the existing pipeline SSE plumbing (`streamSSE` to the resume endpoint).

### 3.4 Resume-after-halt
A halted pi-loop already persisted its backlog `[x]` progress to disk, so re-entering
`pipeline_pi_loop` continues from the first unchecked item. The one detail: `_halt` set run
`status="error"`. The resume path must clear that. Approach:
- Extend the dispatch resume endpoint (`/resume-pipeline`) to handle a halted run: if the run status
  is `error` and its last pi-loop step has a `.halt`, reset run `status="running"`, then invoke
  `run-pipeline.sh --resume <id>` (which calls `pipeline_run(resume=1)` — the pi-loop step's last
  status is `error` (not `done`), so it re-runs and resumes from the backlog).
- `pipeline_run`'s pi-loop dispatch guard already skips only `cur=="done"`, so an errored step
  re-runs correctly. Confirm the resume reset is idempotent (a second halt just re-halts).

## 4. Components / boundaries

| Unit | File | Responsibility |
|---|---|---|
| pi-loop progress | `orchestrate.sh` `pipeline_pi_loop` | print item markers + write `backlog_progress` |
| SSE emission | `dispatch/server.py` `_pipeline_worker`/`_emit_step_dones` | new `pipeline-backlog` + `pipeline-halt` frames |
| resume-after-halt | `dispatch/server.py` resume endpoint | reset errored run → resume |
| CC render | `command-center/.../dispatch.js` | backlog meta line + halt display + Resume button |

## 5. Error handling
- If `state.json` lacks `backlog_progress` (older run), CC simply shows no backlog line — no error.
- `pipeline-halt` is advisory/non-terminal; if the user never resumes, the run stays `error`.
- Resume on a run with no halted pi-loop step → no-op (fall through to existing gate-resume behavior).

## 6. Testing
- **orchestrate.sh:** extend `tests/test_pi_loop.sh` — assert the green-path run writes
  `backlog_progress` to `state.json` (total/checked) and that the item markers are printed (capture
  stderr). Model-free (fakes already in place).
- **server.py:** a small test that feeds representative orchestrator stdout + a `state.json` with a
  `.halt` step and asserts the emitter produces `pipeline-backlog` and `pipeline-halt` frames (follow
  `tests/test_server.py` conventions).
- **command-center JS:** no CC JS test suite exists — verify manually in the PWA (launch coding-loop,
  watch backlog progress, force a halt, click Resume). Document the manual steps.
- **End-to-end:** re-run the WS5 D1 goal through command-center; confirm backlog progress renders and
  a deliberately-unsolvable item shows the halt + resumes.

## 7. Risks / caveats
- **Frame-shape stability:** the two new frames are additive; a regression test should assert the
  existing `pipeline-step`/`gate`/`pipeline-done` frames are unchanged.
- **Resume idempotency / step accumulation:** each `pipeline_pi_loop` entry appends a `state_step_start`
  entry; `state_step_status` returns the LAST, so resume works, but `steps[]` grows per resume — cosmetic.
- **CC JS is untested by suite:** manual verification only; keep the JS change minimal and mirror the
  existing frame-handler style so it can't break the current dispatch screen.
- **No auth/CORS concerns:** CC→dispatch is same-origin localhost/Tailscale (established).

## 8. Out of scope
- Rich backlog checklist UI (per-item checkboxes) — a single progress line suffices; revisit later.
- Changing the coding-loop pipeline or pi-loop halt logic (WS5) — WS6 only surfaces it.
- The WS5.1 planner green-slice tweak (separate).
- Per-workflow key selection in the UI (WS2 wiring — separate).
