# WS5 — Ralph→Dispatch Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make hermes-dispatch the single autonomous coding orchestrator by adding a backlog-driven `pi-loop` step that invokes `pi` as the agentic file-editing worker, verified by dispatch's own `test-runner.sh`; then retire `ralph-loop/bin/ralph`.

**Architecture:** Approach C from the spec. A new `pipeline_pi_loop` in `lib/orchestrate.sh` iterates a backlog checklist; per item it calls `bin/pi-implement.sh` (which runs `pi -p` agentically in the run workspace against `exec-cloud`/`exec-free` via LiteLLM :4000), then runs `test-runner.sh` for ground-truth pass/fail, feeds failures back, applies ralph's safety halts, and flips the backlog checkbox on green. The existing text-agent `test-loop` path is left untouched.

**Tech Stack:** bash + jq + python3 (dispatch's existing stack); `pi` 0.80.3; LiteLLM :4000. Tests follow `tests/test_orchestrate.sh` (source the lib, sandbox `REPO_ROOT`, inject fakes, assert `state.json` via jq — no models).

**Repo:** `~/Code/hermes-dispatch` (main). Spec: `~/Code/claude-code-config/docs/superpowers/specs/2026-07-02-ws5-ralph-dispatch-convergence-design.md`.

---

## File Structure

- **Create** `bin/pi-implement.sh` — pi worker: one item → workspace file edits. Isolates pi's `.pi/`+`MEMORY.md`. `PI_BIN` override for tests.
- **Modify** `lib/orchestrate.sh` — add pure backlog helpers (`backlog_first_unchecked`, `backlog_check_item`), `pipeline_pi_loop()`, and a `pi-loop` case in `pipeline_run`'s step dispatch. Do NOT change `pipeline_test_loop`.
- **Create** `tests/test_pi_loop.sh` — hermetic tests (fake pi-implement + fake test-runner via env seams).
- **Modify** `tests/run.sh` — include the new test file.
- **Create** `pipelines/coding-loop.json` — plan → spec-approval gate → pi-loop.
- **Modify** `agents/impl-planner/SOUL.md` — emit a spec + a `- [ ]` backlog checklist (ported from `ralph-loop/prompts/plan.md`).
- **Create** `prompts/pi-implement.md` — pi IMPLEMENT system prompt (ported from `ralph-loop/prompts/implement.md`).
- **Modify** `ralph-loop/bin/ralph` — deprecation notice pointing to `coding-loop` (final task).

Overridable seams (env vars, default to real paths) so tests run model-free:
- `PI_IMPLEMENT` → `$REPO_ROOT/bin/pi-implement.sh`
- `TEST_RUNNER` → `$ORCH_LIB_DIR/test-runner.sh`
- `PI_BIN` (inside pi-implement.sh) → `pi`

---

## Phase A — pi worker

### Task A1: `bin/pi-implement.sh`

**Files:** Create `bin/pi-implement.sh`; Test `tests/test_pi_loop.sh` (created here, extended later).

- [ ] **Step 1: Write the failing test** (create `tests/test_pi_loop.sh`)

```bash
#!/usr/bin/env bash
# test_pi_loop.sh — hermetic tests for the pi-loop convergence (bin/pi-implement.sh +
# lib/orchestrate.sh pipeline_pi_loop). No models: a fake PI_BIN / PI_IMPLEMENT / TEST_RUNNER
# are injected. Run: tests/test_pi_loop.sh
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); printf '  ok   %s\n' "$1"; }
bad(){ FAIL=$((FAIL+1)); printf '  FAIL %s\n     %s\n' "$1" "${2:-}"; }
eq(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "expected '$3', got '$2'"; fi; }

echo "== pi-implement.sh runs the worker in the workspace and cleans pi artifacts =="
WS="$(mktemp -d)"; trap 'rm -rf "$WS"' EXIT
# Fake pi: emulate pi writing a file AND leaving a .pi/ dir + MEMORY.md in cwd.
FAKEPI="$(mktemp)"; cat > "$FAKEPI" <<'PI'
#!/usr/bin/env bash
mkdir -p .pi; echo junk > .pi/session; echo mem > MEMORY.md
echo "done" > implemented.txt
PI
chmod +x "$FAKEPI"
printf 'spec text' > "$WS/spec.md"
PI_BIN="$FAKEPI" "$ROOT/bin/pi-implement.sh" "$WS" "add feature X" "$WS/spec.md" "" exec-free >/dev/null 2>&1
eq "worker wrote file in workspace"   "$(cat "$WS/implemented.txt" 2>/dev/null)" "done"
eq "pi .pi/ dir cleaned"              "$([ -e "$WS/.pi" ] && echo present || echo gone)" "gone"
eq "pi MEMORY.md cleaned"             "$([ -e "$WS/MEMORY.md" ] && echo present || echo gone)" "gone"

echo ""; printf 'pi_loop: %d passed, %d failed\n' "$PASS" "$FAIL"; [ "$FAIL" -eq 0 ]
```

- [ ] **Step 2: Run it — fails (script absent)**

Run: `cd ~/Code/hermes-dispatch && chmod +x tests/test_pi_loop.sh && tests/test_pi_loop.sh`
Expected: FAIL — `bin/pi-implement.sh: No such file or directory`.

- [ ] **Step 3: Implement `bin/pi-implement.sh`**

```bash
#!/usr/bin/env bash
# pi-implement.sh — run pi agentically for ONE backlog item, editing files in a workspace.
# Usage: pi-implement.sh <workspace> <item> <spec-file> <feedback-file|""> <model-alias>
# pi routes through LiteLLM :4000 (models.json provider "litellm"); model e.g. exec-cloud/exec-free.
# Isolates pi's cwd artifacts (.pi/, MEMORY.md) so they never pollute the workspace diff/tests.
set -euo pipefail
ws="${1:?workspace required}"; item="${2:?item required}"
spec="${3:?spec file required}"; feedback="${4:-}"; model="${5:?model alias required}"
PI_BIN="${PI_BIN:-pi}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
sys="$DIR/prompts/pi-implement.md"

msg="## Backlog item to implement\n$item\n\n## Spec / context\n$(cat "$spec")"
[ -n "$feedback" ] && [ -f "$feedback" ] && msg="$msg\n\n## Prior test failures — make these pass, do not weaken tests\n$(cat "$feedback")"

cd "$ws"
args=(-p --mode text --model "litellm/$model")
[ -f "$sys" ] && args+=(--append-system-prompt "$sys")
# Keep pi's session state out of the workspace.
export PI_HOME="$ws/.pi-home"
printf '%b' "$msg" | "$PI_BIN" "${args[@]}" || true
# Clean pi cwd artifacts regardless of how pi was configured.
rm -rf "$ws/.pi" "$ws/.pi-home" "$ws/MEMORY.md"
```

- [ ] **Step 4: Run — passes**

Run: `cd ~/Code/hermes-dispatch && tests/test_pi_loop.sh`
Expected: 3 passed, 0 failed.

- [ ] **Step 5: Live smoke (manual, needs LiteLLM up)** — confirm the real pi path still works:

Run:
```bash
cd ~/Code/hermes-dispatch && WS=$(mktemp -d) && printf 'Add a file greeting.txt saying hello.' > "$WS/spec.md"
bin/pi-implement.sh "$WS" "create greeting.txt containing: hello" "$WS/spec.md" "" exec-free; cat "$WS/greeting.txt"
```
Expected: `greeting.txt` exists with hello-ish content; no `.pi/`/`MEMORY.md` left in `$WS`.

- [ ] **Step 6: Commit**

```bash
cd ~/Code/hermes-dispatch
git add bin/pi-implement.sh tests/test_pi_loop.sh
git commit -m "feat: add pi-implement worker (agentic per-item editor via LiteLLM)"
```

---

## Phase B — pi-loop step type

### Task B1: backlog helpers in `lib/orchestrate.sh`

**Files:** Modify `lib/orchestrate.sh` (add two pure functions near the other helpers); Test `tests/test_pi_loop.sh`.

- [ ] **Step 1: Add failing tests** (append inside `test_pi_loop.sh`, before the final summary)

```bash
echo "== backlog helpers =="
# shellcheck source=/dev/null
source "$ROOT/lib/orchestrate.sh"; set +e +u
BL="$(mktemp)"; printf -- '- [ ] first item\n- [ ] second item\n- [x] already done\n' > "$BL"
eq "first unchecked"        "$(backlog_first_unchecked "$BL")" "first item"
backlog_check_item "$BL" "first item"
eq "first now checked"      "$(grep -c -- '- \[x\] first item' "$BL")" "1"
eq "next unchecked"         "$(backlog_first_unchecked "$BL")" "second item"
printf -- '- [x] a\n- [x] b\n' > "$BL"
eq "none left -> empty"     "$(backlog_first_unchecked "$BL")" ""
```

- [ ] **Step 2: Run — fails** (`backlog_first_unchecked: command not found`)

Run: `cd ~/Code/hermes-dispatch && tests/test_pi_loop.sh`
Expected: FAIL on the backlog section.

- [ ] **Step 3: Implement** — add to `lib/orchestrate.sh` (near the other small helpers, above `pipeline_test_loop`)

```bash
# --- backlog helpers (WS5 pi-loop) -----------------------------------------------------------
# Backlog is a markdown checklist: "- [ ] item" / "- [x] item".
backlog_first_unchecked() {  # <file> -> first unchecked item text (empty if none)
  [ -f "$1" ] || { printf ''; return; }
  sed -n 's/^- \[ \] //p' "$1" | head -1
}
backlog_check_item() {       # <file> <item-text> -> flip that item's [ ] to [x] (first match)
  local f="$1" it="$2" tmp; tmp="$(mktemp)"
  awk -v it="$it" 'BEGIN{done=0}
    !done && $0=="- [ ] " it { print "- [x] " it; done=1; next }
    { print }' "$f" > "$tmp" && mv "$tmp" "$f"
}
```

- [ ] **Step 4: Run — passes.** Run: `tests/test_pi_loop.sh` → backlog tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/orchestrate.sh tests/test_pi_loop.sh
git commit -m "feat: add backlog checklist helpers for pi-loop"
```

### Task B2: `pipeline_pi_loop()` in `lib/orchestrate.sh`

**Files:** Modify `lib/orchestrate.sh`; Test `tests/test_pi_loop.sh`.

- [ ] **Step 1: Add failing tests** (append to `test_pi_loop.sh` before summary)

```bash
echo "== pipeline_pi_loop: green path drains backlog =="
SB="$(mktemp -d)"; RUN_ROOT="$SB/run"; mkdir -p "$RUN_ROOT"
RD="$(state_init pi-demo)"
printf 'spec' > "$RD/spec.md"; state_put_key "$RD" spec - spec.md
printf -- '- [ ] item-A\n- [ ] item-B\n' > "$RD/backlog.md"; state_put_key "$RD" backlog - backlog.md
# Fake worker: append the item name to progress.txt in the workspace.
FPI="$(mktemp)"; cat > "$FPI" <<'W'
#!/usr/bin/env bash
echo "$2" >> "$1/progress.txt"
W
chmod +x "$FPI"
# Fake test-runner: green once progress.txt has as many lines as there are total items so far.
FTR="$(mktemp)"; cat > "$FTR" <<'T'
#!/usr/bin/env bash
echo '{"ok":true,"layers":{}}'
T
chmod +x "$FTR"
STEP='{"id":"build","type":"pi-loop","reads":"spec","backlog":"backlog","writes":"validated","model":"exec-free","max_cycles":3,"max_items":10}'
PI_IMPLEMENT="$FPI" TEST_RUNNER="$FTR" pipeline_pi_loop "$RD" "$STEP" >/dev/null 2>&1
eq "backlog fully checked"    "$(grep -c -- '- \[ \]' "$RD/backlog.md")" "0"
eq "both items implemented"   "$(wc -l < "$RD/progress.txt" | tr -d ' ')" "2"
eq "step done"                "$(jq -r '.steps[] | select(.id=="build") | .status' "$RD/state.json")" "done"

echo "== pipeline_pi_loop: stuck halts (test never green) =="
RD5="$(state_init pi-stuck)"
printf 'spec' > "$RD5/spec.md"; state_put_key "$RD5" spec - spec.md
printf -- '- [ ] hard\n' > "$RD5/backlog.md"; state_put_key "$RD5" backlog - backlog.md
FTR_RED="$(mktemp)"; printf '#!/usr/bin/env bash\necho '\''{"ok":false,"layers":{"unit":{"present":true,"status":"fail","cmd":"t","excerpt":"boom"}}}'\''\n' > "$FTR_RED"; chmod +x "$FTR_RED"
STEP5='{"id":"b","type":"pi-loop","reads":"spec","backlog":"backlog","writes":"v","model":"exec-free","escalation_model":"plan-frontier","max_cycles":2,"max_items":10}'
PI_IMPLEMENT="$FPI" TEST_RUNNER="$FTR_RED" pipeline_pi_loop "$RD5" "$STEP5" >/dev/null 2>&1
eq "stuck -> item still unchecked" "$(grep -c -- '- \[ \] hard' "$RD5/backlog.md")" "1"
eq "stuck -> step error/halted"    "$(jq -r '.steps[] | select(.id=="b") | .status' "$RD5/state.json")" "error"
eq "halt reason recorded"          "$(jq -r '.steps[] | select(.id=="b") | .halt' "$RD5/state.json")" "HALTED_STUCK"
```

- [ ] **Step 2: Run — fails** (`pipeline_pi_loop: command not found`).

Run: `cd ~/Code/hermes-dispatch && tests/test_pi_loop.sh`

- [ ] **Step 3: Implement `pipeline_pi_loop`** — add to `lib/orchestrate.sh` after `pipeline_test_loop`

```bash
# pipeline_pi_loop <run-dir> <step-json> — backlog-driven agentic loop (WS5).
# Per unchecked backlog item: run the pi worker in the workspace, verify with the test-runner
# (ground truth), feed failures back, apply safety halts, flip the checkbox on green.
pipeline_pi_loop() {
  local rd="$1" step="$2"
  local id reads backlog writes model esc maxc maxi
  id="$(printf '%s' "$step" | jq -r .id)"
  reads="$(printf '%s' "$step" | jq -r .reads)"
  backlog="$(printf '%s' "$step" | jq -r .backlog)"
  writes="$(printf '%s' "$step" | jq -r '.writes // "validated"')"
  model="$(printf '%s' "$step" | jq -r '.model // "exec-cloud"')"
  esc="$(printf '%s' "$step" | jq -r '.escalation_model // .model // "exec-cloud"')"
  maxc="$(printf '%s' "$step" | jq -r '.max_cycles // 5')"
  maxi="$(printf '%s' "$step" | jq -r '.max_items // 50')"
  local pi_impl="${PI_IMPLEMENT:-$REPO_ROOT/bin/pi-implement.sh}"
  local test_runner="${TEST_RUNNER:-$ORCH_LIB_DIR/test-runner.sh}"

  local ws="$rd/workspace"; mkdir -p "$ws"
  local spec_file backlog_file; spec_file="$(state_key_file "$rd" "$reads")"
  backlog_file="$(state_key_file "$rd" "$backlog")"
  state_step_start "$rd" "$id" pi-loop "$reads" "$writes"

  local item_no=0 item feedback results ok cycle sig last_sig stuck m
  while item="$(backlog_first_unchecked "$backlog_file")"; [ -n "$item" ]; do
    item_no=$((item_no+1))
    if [ "$item_no" -gt "$maxi" ]; then
      _halt "$rd" "$id" HALTED_MAXITER; return 1; fi
    cycle=0; last_sig=""; stuck=0; feedback=""
    while : ; do
      m="$model"; [ "$cycle" -ge "$maxc" ] && m="$esc"
      "$pi_impl" "$ws" "$item" "$spec_file" "$feedback" "$m" >>"$rd/$id.stderr" 2>&1 || true
      results="$("$test_runner" "$ws" 2>>"$rd/$id.stderr")" || true
      [ -n "$results" ] || results='{"ok":false,"layers":{}}'
      ok="$(printf '%s' "$results" | jq -r '.ok' 2>/dev/null || echo false)"
      if [ "$ok" = "true" ]; then
        backlog_check_item "$backlog_file" "$item"; break; fi
      sig="$(printf '%s' "$results" | jq -rS '.layers' 2>/dev/null | shasum | cut -d' ' -f1)"
      if [ "$sig" = "$last_sig" ]; then stuck=$((stuck+1)); else stuck=0; last_sig="$sig"; fi
      [ "$stuck" -ge 2 ] && { _halt "$rd" "$id" HALTED_STUCK; return 1; }
      cycle=$((cycle+1))
      if [ "$cycle" -gt $((maxc + 2)) ]; then _halt "$rd" "$id" HALTED_MAXCYCLES; return 1; fi
      feedback="$rd/.fix.$id"
      { printf '===== test failures (cycle %s) =====\n' "$cycle"
        printf '%s' "$results" | jq -r '.layers | to_entries[]
          | select(.value.present and (.value.status!="pass"))
          | "## \(.key) — \(.value.status)\n\(.value.excerpt)\n"' 2>/dev/null || true
      } > "$feedback"
    done
  done
  cp -R "$ws" "$rd/$writes.workspace" 2>/dev/null || true
  printf 'ok' > "$rd/$writes.md"; state_put_key "$rd" "$writes" pi-loop "$writes.md"
  state_step_done "$rd" "$id" 0 "$writes.md"
}

# _halt <run-dir> <step-id> <reason> — mark the step errored with a halt reason for WS6.
_halt() {
  local rd="$1" id="$2" reason="$3"
  _sj "$rd" --arg id "$id" --arg r "$reason" --arg t "$(_now)" \
    '(.steps[] | select(.id==$id and .status=="running")) |= (.status="error" | .halt=$r | .ended_at=$t)
     | .updated_at=$t'
  state_set_status "$rd" error
  printf '✗ %s: halted (%s)\n' "$id" "$reason" >&2
}
```

(If `state_step_start`'s arg order differs from `<rd> <id> <agent> <reads> <writes>`, match the existing signature in the file — read it first.)

- [ ] **Step 4: Run — passes** (green-path + stuck tests). Run: `tests/test_pi_loop.sh`.

- [ ] **Step 5: Commit**

```bash
git add lib/orchestrate.sh tests/test_pi_loop.sh
git commit -m "feat: add pipeline_pi_loop (backlog-driven agentic loop with halts)"
```

### Task B3: wire `pi-loop` into `pipeline_run`

**Files:** Modify `lib/orchestrate.sh` (`pipeline_run` step dispatch); Test `tests/test_pi_loop.sh`.

- [ ] **Step 1: Add failing test** (append)

```bash
echo "== pipeline_run dispatches a pi-loop step =="
mkdir -p "$SB/pipelines" "$SB/bin"
REPO_ROOT="$SB"
cp "$FPI" "$SB/bin/pi-implement.sh"; chmod +x "$SB/bin/pi-implement.sh"
cat > "$SB/pipelines/cl.json" <<PIPE
{ "name":"cl", "steps":[ {"id":"build","type":"pi-loop","reads":"spec","backlog":"backlog","writes":"validated","model":"exec-free","max_cycles":3,"max_items":10} ] }
PIPE
RD6="$(state_init cl)"
printf 'spec' > "$RD6/spec.md"; state_put_key "$RD6" spec - spec.md
printf -- '- [ ] only\n' > "$RD6/backlog.md"; state_put_key "$RD6" backlog - backlog.md
TEST_RUNNER="$FTR" pipeline_run "$RD6" "$SB/pipelines/cl.json" >/dev/null 2>&1
eq "pi-loop pipeline complete"  "$(jq -r .status "$RD6/state.json")" "complete"
eq "backlog drained via run"    "$(grep -c -- '- \[ \]' "$RD6/backlog.md")" "0"
```

- [ ] **Step 2: Run — fails** (pipeline treats `pi-loop` as a gate/unknown → won't run).

- [ ] **Step 3: Implement** — in `pipeline_run`'s per-step dispatch (where `type` is examined, near the `test-loop` handling), add a branch BEFORE the generic gate/agent handling:

```bash
    if [ "$typ" = "pi-loop" ]; then
      pipeline_pi_loop "$rd" "$stepjson" || { i=$((i+1)); continue; }
      i=$((i+1)); continue
    fi
```

(Use the same variable names the surrounding loop uses for the step JSON and index — read the `pipeline_run` loop first; `test-loop` is dispatched the same way and is the model to copy.)

- [ ] **Step 4: Run — passes**, and confirm the whole suite still green: `tests/run.sh` (or `tests/test_orchestrate.sh && tests/test_pi_loop.sh`).

- [ ] **Step 5: Add `test_pi_loop.sh` to the runner** — in `tests/run.sh`, add the line that runs `test_pi_loop.sh` alongside `test_orchestrate.sh` (match the existing invocation style in that file).

- [ ] **Step 6: Commit**

```bash
git add lib/orchestrate.sh tests/test_pi_loop.sh tests/run.sh
git commit -m "feat: dispatch pi-loop step type in pipeline_run"
```

---

## Phase C — pipeline + ported prompts

### Task C1: `pipelines/coding-loop.json`

**Files:** Create `pipelines/coding-loop.json`.

- [ ] **Step 1: Create the pipeline**

```json
{
  "name": "coding-loop",
  "description": "Autonomous coding loop (WS5): plan -> human gate -> backlog-driven pi-loop.",
  "steps": [
    { "id": "plan", "type": "agent", "agent": "impl-planner", "reads": "input",
      "writes": "spec", "format": "md",
      "note": "Emits spec + a '- [ ]' backlog checklist. High-stakes: seed 'spec' from Claude Code instead." },
    { "id": "backlog", "type": "tool", "cmd": "bin/extract-backlog.sh", "reads": "spec", "writes": "backlog",
      "note": "Pull the '- [ ]' checklist out of the plan into its own key." },
    { "id": "spec-approval", "type": "gate", "gate": "Approve spec + backlog before autonomous build" },
    { "id": "build", "type": "pi-loop", "reads": "spec", "backlog": "backlog", "writes": "validated",
      "model": "exec-cloud", "escalation_model": "plan-frontier", "max_cycles": 5, "max_items": 50 }
  ]
}
```

- [ ] **Step 2: Create `bin/extract-backlog.sh`** (tool step: spec md on stdin → backlog md on stdout)

```bash
#!/usr/bin/env bash
# extract-backlog.sh — read a plan on stdin, emit only its markdown checklist lines.
set -euo pipefail
grep -E '^- \[[ x]\] ' || true
```

- [ ] **Step 3: Verify offline** — reuse the Task B3 harness idea against the real pipeline file with fakes:

Run:
```bash
cd ~/Code/hermes-dispatch && chmod +x bin/extract-backlog.sh
printf '# spec\n- [ ] a\n- [ ] b\n' | bin/extract-backlog.sh
```
Expected: prints the two `- [ ]` lines only.

- [ ] **Step 4: Commit**

```bash
git add pipelines/coding-loop.json bin/extract-backlog.sh
git commit -m "feat: add coding-loop pipeline (plan/gate/pi-loop)"
```

### Task C2: port planner prompt (backlog output)

**Files:** Modify `agents/impl-planner/SOUL.md`.

- [ ] **Step 1: Read both** — `agents/impl-planner/SOUL.md` (current) and `~/Code/ralph-loop/prompts/plan.md` (source of the backlog discipline).

- [ ] **Step 2: Edit `SOUL.md`** so the planner's output contract ends with an explicit, machine-parseable backlog: a `## Backlog` section containing only `- [ ] <one independently-verifiable task>` lines, each with a concrete acceptance check, ordered by dependency (port the decomposition rules from `ralph-loop/prompts/plan.md`: discrete, independently verifiable, small slices). Keep the rest of the planner's spec output intact.

- [ ] **Step 3: Sanity check** — run the planner on a trivial idea and confirm the output contains a `## Backlog` with `- [ ]` items (needs LiteLLM up):

Run: `cd ~/Code/hermes-dispatch && echo "Add an add(a,b) function with a test" | agents/impl-planner/run.sh | grep -c '^- \[ \] '`
Expected: ≥ 1.

- [ ] **Step 4: Commit**

```bash
git add agents/impl-planner/SOUL.md
git commit -m "feat: impl-planner emits a parseable backlog checklist"
```

### Task C3: pi IMPLEMENT system prompt

**Files:** Create `prompts/pi-implement.md`.

- [ ] **Step 1: Read** `~/Code/ralph-loop/prompts/implement.md` (source) and `~/Code/ralph-loop/workflow/DEVELOPMENT_WORKFLOW.md` (test-first discipline).

- [ ] **Step 2: Write `prompts/pi-implement.md`** — a system prompt telling pi: implement ONLY the single backlog item given; edit files directly with your tools; follow test-first where a test is specified; do NOT weaken tests to pass; the orchestrator runs the authoritative tests, so do not fabricate success; keep changes minimal and scoped to the item. (Port the substance of `implement.md`, dropping ralph's `<phase-done/>` signalling — the orchestrator owns completion via the test-runner.)

- [ ] **Step 3: Live smoke** — rerun the Task A1 Step-5 live smoke; confirm pi edits sensibly with the system prompt attached.

- [ ] **Step 4: Commit**

```bash
git add prompts/pi-implement.md
git commit -m "feat: add ported pi IMPLEMENT system prompt"
```

---

## Phase D — parity + retire

### Task D1: parity check against a golden reference

**Files:** none (verification); optionally record results under `docs/`.

- [ ] **Step 1: Pick a golden goal** — e.g. `~/Code/ralph-loop` smoke (`add(a,b)` with the `python3 -c "import add; assert add.add(2,3)==5"` check from ralph's README).

- [ ] **Step 2: Run it through the OLD path** — `ralph-loop`, capture cost/tokens (Langfuse :3001) + outcome.

- [ ] **Step 3: Run it through the NEW path** — seed the goal as `input`, run `bin/run-pipeline.sh coding-loop "<goal>"`, approve the gate, let the pi-loop drive. Capture cost/outcome.

- [ ] **Step 4: Compare** — both reach the same passing state; note cost-per-accepted-artifact delta. Record a short note (pass/fail + numbers). If the new path fails to reach parity, STOP and fix before Task D2 (do not retire ralph on a regression).

### Task D2: retire `bin/ralph`

**Files:** Modify `~/Code/ralph-loop/bin/ralph`.

- [ ] **Step 1: Only if D1 reached parity.** Replace `bin/ralph`'s body with a deprecation notice:

```bash
#!/usr/bin/env bash
echo "ralph-loop is retired. The autonomous coding loop now lives in hermes-dispatch:" >&2
echo "  cd ~/Code/hermes-dispatch && bin/run-pipeline.sh coding-loop \"<goal>\"" >&2
echo "Prompts here (prompts/) remain the source for the ported dispatch prompts." >&2
exit 1
```

- [ ] **Step 2: Commit (ralph-loop repo)**

```bash
cd ~/Code/ralph-loop && git add bin/ralph
git commit -m "chore: retire bin/ralph; loop converged into hermes-dispatch coding-loop"
```

---

## Self-Review

- **Spec coverage:** pi-loop step (§3) → B2/B3; pi worker (§3.1) → A1; coding-loop.json (§3.3) → C1; ported prompts (§3.4) → C2/C3; retire ralph (§3.5) → D2; backlog state (§3) → B1 + pi-loop; discipline mapping (§4): granularity→B2 loop, feedback→B2 `.fix` infile, ground-truth→TEST_RUNNER, halts→B2 `_halt`, resumability→reuses `state.json`/`pipeline_run` (gate test in test_orchestrate.sh already covers resume; pi-loop restart re-reads the backlog file, which persists item progress); two-model split→B2 `model`/`escalation_model`. Error handling (§5)→`_halt` reasons. Testing (§6)→hermetic `test_pi_loop.sh` + D1 parity. pi artifacts caveat (§7)→A1 cleanup + test.
- **Placeholder scan:** every code step has complete code; the two prompt tasks (C2, C3) describe the exact contract and cite the ralph source files to port — content is authored during the task from a named source, not left vague.
- **Type/signature consistency:** `pipeline_pi_loop <rd> <step-json>`, `_halt <rd> <id> <reason>`, `backlog_first_unchecked <file>`, `backlog_check_item <file> <item>`, env seams `PI_IMPLEMENT`/`TEST_RUNNER`/`PI_BIN` — used identically across tasks. Step JSON fields (`reads`/`backlog`/`writes`/`model`/`escalation_model`/`max_cycles`/`max_items`) match between C1 pipeline and B2 parser.
- **Carried assumption:** `pipeline_run`'s step-dispatch variable names (`stepjson`, `typ`, `i`) are illustrative — Task B3 Step 3 instructs reading the existing loop and copying the `test-loop` dispatch style exactly.
```
