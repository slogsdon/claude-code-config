# WS5 — Ralph → Dispatch Convergence Design

- **Date:** 2026-07-02
- **Status:** design (pending implementation plan)
- **Parent spec:** `2026-07-02-multi-model-agentic-workflow-design.md` §3 (decision 1), §4.2
- **Approach:** C — dispatch orchestrates, pi is the agentic IMPLEMENT worker (user-selected)

## 1. Purpose

Converge the two autonomous coding loops onto a single orchestrator. Today there are two:

- **ralph-loop** (`~/Code/ralph-loop`) — an agent-owns-the-loop model. `pi` runs an agentic
  tool-loop *inside one session per phase*: edits files directly, runs bash, iterates. Outer bash
  state machine drives PLAN→IMPLEMENT→VALIDATE with filesystem state (`.ralph/*.md`).
- **hermes-dispatch** (`~/Code/hermes-dispatch`) — an orchestrator-owns-the-loop model. Pipeline
  agents are single-shot text→Markdown; the orchestrator extracts files, runs tests
  (ground-truth exit codes), and re-prompts with `code+failures`. Plus gates, mobile SSE,
  command-center UI, 28-agent routing.

Maintaining two orchestration engines is the duplication WS5 removes. Retire ralph's
orchestration (`bin/ralph`); make hermes-dispatch the single orchestrator; **keep pi's agentic
editing** by invoking it as a per-item worker from a dispatch step. This preserves surgical
editing of existing files (pi's strength; dispatch's re-prompt model re-emits whole files, which
is weak and token-heavy on large repos) while eliminating the duplicate orchestrator.

## 2. How the two systems actually work (investigated 2026-07-02)

### hermes-dispatch (orchestrator-centric)
- Agents are one-shot LiteLLM calls: `lib/hermes-run.sh:104-177`. `code-generator` has
  `toolsets: ""`, `max_turns: 2` (`agents/code-generator/agent.yaml`).
- Orchestrator owns file application: `lib/extract_files.py:55-84` (parse fenced ``` blocks),
  `:103-127` (write with `O_NOFOLLOW`, path-traversal guard).
- Test-loop: `lib/orchestrate.sh:133-266` (`pipeline_test_loop`) — extract → `test-runner.sh` →
  on red build REFINE infile (`:246-264`) → re-invoke agent → repeat to `max_cycles`, then
  `escalation_agent` for `escalation_cycles`, then exit 2 (pause for human).
- Ground truth: `lib/test-runner.sh:194-207` — unit→integration→playwright, exit codes
  authoritative; the agent never self-reports pass/fail.
- Multi-turn tool-use is *possible* but not default — `agents/test-runner/agent.yaml`
  (`max_turns: 12, toolsets: terminal`) is used only for test-command *discovery*.
- Pipeline schema: `pipelines/dev-workflow.json`. Step types: `agent`, `gate`, `test-loop`,
  `tool` (`orchestrate.sh:306-342`, runs a repo-relative executable stdin→stdout). State:
  `run/<id>/state.json` (`keys{}`, `steps[]`, test-loop adds `test_cycles[]`/`revision_cycles`).
- Gates + resume: `orchestrate.sh:281-362` (`pipeline_run`); `bin/run-pipeline.sh:28-39`
  (`--resume <run-id>`). One human gate; after approval the rest runs unattended.

### ralph-loop (agent-centric)
- Outer state machine `bin/ralph:112-150`; per-phase ephemeral pi session `lib/phase.sh:48-123`;
  two-model split `lib/common.sh:12-23`. Prompts `prompts/{plan,implement,validate}.md`.
- State in `.ralph/*.md` (GOAL/PLAN/BACKLOG/VALIDATION). VALIDATE runs real bash, flips backlog
  `[ ]`→`[x]`, writes specific failure feedback. Safety halts: stuck (3 identical VALIDATION.md),
  max-iter, context/turn caps; resumable via filesystem state.

## 3. Architecture — the converged coding loop

New pipeline `hermes-dispatch/pipelines/coding-loop.json`:

1. **plan** (`agent` step) — planner emits a spec + a **backlog checklist** (GitHub `- [ ]`
   items). Two entry modes feed the same downstream:
   - *High-stakes:* Claude Code (superpowers) seeds the `plan`/`backlog` key; `spec-approval`
     gate is the human checkpoint.
   - *Routine:* dispatch `impl-planner` agent on the `plan-frontier` alias; gate auto-approves.
2. **spec-approval** (`gate`) — reuses dispatch's existing gate mechanism unchanged.
3. **pi-loop** (NEW step type) — backlog-driven. Loop until backlog drained or a halt:
   - Select first unchecked `- [ ]` backlog item.
   - `bin/pi-implement.sh` runs **pi** (`--print`, model `exec-cloud`/`exec-free` via LiteLLM
     :4000 — WS1 already exposed these aliases to pi's `models.json`) in the run **workspace**,
     with a ported IMPLEMENT system prompt + the item + spec + any prior failure feedback. pi
     edits files agentically (Read/Write/Edit/Bash core).
   - dispatch runs `test-runner.sh` on the workspace → **authoritative** green/red (pi
     self-checks are advisory only).
   - red → build failure feedback (reuse `orchestrate.sh:246-264` REFINE format) → re-invoke
     pi; count cycles; **stuck-detection** (N identical failure signatures) + iter cap →
     escalate model (`exec-cloud`→`plan-frontier`) or pause for human.
   - green → flip the item to `[x]` in the backlog key, advance.

### Components to build
1. **`hermes-dispatch/bin/pi-implement.sh`** — pi worker. Inputs: workspace dir, current item,
   spec, optional failure-feedback file. Runs pi `--print` (model from an env/step field) with
   the ported IMPLEMENT prompt; pi edits files in the workspace. One clear responsibility:
   turn (item + context) into workspace file edits. Depends on: `pi` binary, LiteLLM :4000.
2. **`pi-loop` step type** in `lib/orchestrate.sh` — a *new* function (e.g. `pipeline_pi_loop`)
   modeled on `pipeline_test_loop` but: iterates backlog items, calls `pi-implement.sh` (not a
   text agent), owns the test-runner verification + feedback + halts + backlog checkbox flips.
   Does NOT modify the existing `pipeline_test_loop` (the text-agent path `dev-workflow.json`
   uses stays intact).
3. **`hermes-dispatch/pipelines/coding-loop.json`** — plan → spec-approval → pi-loop.
4. **Ported prompts** — ralph's `prompts/{plan,implement,validate}.md` adapted into the dispatch
   `impl-planner` SOUL (plan+backlog) and the pi IMPLEMENT system prompt. VALIDATE logic becomes
   the orchestrator's test-runner gate (already deterministic), not a prompt.
5. **Retire `bin/ralph`** — replace its body with a deprecation notice pointing at
   `coding-loop.json`; keep `ralph-loop/prompts/` as the source the ported prompts derive from
   until the migration is verified, then archive.

### Backlog state
The backlog checklist is a dispatch state key (`backlog`, a `.md` file under `run/<id>/`).
`pi-loop` reads the first `- [ ]`, and on green rewrites the file flipping that item to `- [x]`
(same discipline as ralph VALIDATE). `state.json` gains a `backlog_progress` field
(items total / checked) so command-center (WS6) can render it.

## 4. Ralph-discipline mapping

| Ralph property | Converged mechanism |
|---|---|
| backlog granularity (one item/pass) | `pi-loop` selects one `- [ ]` per pass |
| VALIDATION.md specific feedback | reuse REFINE infile (`orchestrate.sh:246-264`), fed to pi |
| ground-truth verify (never self-report) | `test-runner.sh` exit codes are the sole authority |
| safety halts (stuck/maxiter/ctx) | NEW stuck-signature + iter caps in `pi-loop`; pi owns its own turn/ctx caps |
| resumability | reuse `state.json` + `--resume`; backlog key persists item progress |
| two-model split (plan vs exec) | planner=`plan-frontier`, executor=`exec-cloud`/`exec-free` |

## 5. Error handling & halts

- **Test red after `max_cycles`** → escalate the pi model tier once; if still red → set step
  `needs-human`, pause pipeline (reuse existing pause/return-2 path).
- **Stuck** (N identical failure signatures across cycles) → halt early with a clear reason
  rather than burning cycles (ralph's stuck-detection).
- **pi worker failure** (non-zero exit, no edits) → treat as a red cycle with the pi stderr as
  feedback; after 2 consecutive worker failures → pause.
- **Halt reasons** recorded on the terminal step status (`HALTED_STUCK`/`_MAXITER`/`_WORKER`) so
  WS6 can surface them.

## 6. Testing

- **`extract`/state helpers:** unchanged — covered by existing dispatch behavior.
- **`pi-loop` unit-ish:** a fixture pipeline against a tiny golden-reference repo (e.g. add one
  function with a failing test) run headless; assert backlog drains, tests go green, `state.json`
  reflects checked items, and a deliberately-unsolvable item halts with `HALTED_STUCK`.
- **Model-free CI path:** stub `pi-implement.sh` with a deterministic script that writes known
  files, so `pi-loop` orchestration is testable without a live model.
- **Parity check:** run the same golden-reference goal through old `bin/ralph` and new
  `coding-loop` and compare cost/outcome via OTel/Langfuse before retiring ralph.

## 7. Risks / caveats

- **pi-in-workspace safety** — pi has no sandbox by default and its Bash tool can touch anything
  the user can. Run the loop in the dispatch workspace dir and prefer the existing sandbox path
  (`/Users/Shared/hermes-agents-sandbox/<run-id>`, `orchestrate.sh:156-171`); constrain pi's cwd.
- **Two verification layers** — pi may self-test; dispatch re-tests. Intentional (ground truth is
  the orchestrator), but document it so pi's prompt doesn't over-invest in self-testing.
- **Prompt-porting drift** — ralph's prompts are tuned; port faithfully and parity-check (§6)
  before retiring ralph.
- **pi model via LiteLLM** — VERIFIED (spike 2026-07-02, pi 0.80.3): `pi -p --mode text
  --model litellm/exec-free "…"` agentically created a file via its Write tool, routed through
  LiteLLM :4000 → NIM. `models.json` carries `exec-free`/`exec-cloud`/`plan-frontier` (WS1);
  `--print`, `--mode json|rpc`, and `--append-system-prompt <file>` all exist. So `pi-implement.sh`
  is: `cd <workspace> && pi -p --model litellm/<alias> --append-system-prompt <impl-prompt> "<item
  + spec + feedback>"`.
- **pi cwd artifacts** — the spike showed pi writes a `.pi/` session dir and a `MEMORY.md` into
  its cwd. `pi-implement.sh` must isolate these (point pi's session/home elsewhere, or clean
  `.pi/`+`MEMORY.md` before `test-runner.sh` runs) so they never pollute the workspace diff or
  test discovery.

## 8. Out of scope

- Command-center SSE frames + UI for the new loop (backlog/halt/resume) — that is **WS6**.
- WS2 per-workflow key wiring for the loop — layer on after (WS2 follow-on).
- Touching the existing text-agent `test-loop` / `dev-workflow.json` path — left intact.
- Rebuilding pi's agentic loop inside dispatch (rejected approach B).
