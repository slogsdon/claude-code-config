# WS6 — Command-Center pi-loop Exposure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the pi-loop coding step's backlog progress + safety-halt reason in command-center, and add a Resume button that re-enters a halted loop — all additive (existing dispatch UX unchanged).

**Architecture:** pi-loop prints `▸`/`✓` item markers (mirroring test-loop's `⟳`/`GREEN`) and writes `backlog_progress` to `state.json`; `dispatch/server.py` emits two new SSE frames (`pipeline-backlog`, `pipeline-halt`); `command-center/dispatch.js` renders them + a Resume button; the dispatch resume endpoint clears a halted run's `error` status so the loop resumes from the persisted backlog.

**Tech Stack:** bash + jq (orchestrate), Python stdlib http.server (dispatch/server.py), vanilla JS (command-center). Dispatch tests: `tests/test_pi_loop.sh` (bash) + `tests/test_server.py` (python). Command-center JS: manual verify (no JS test suite).

**Repos:** `~/Code/hermes-dispatch` (branch `feature/ws5-pi-loop` merged to main — create `feature/ws6-cc-piloop`), `~/Code/command-center` (create `feature/ws6-piloop-ui`). Spec: `~/Code/claude-code-config/docs/superpowers/specs/2026-07-02-ws6-command-center-pi-loop-design.md`.

---

## File Structure

- **Modify** `hermes-dispatch/lib/orchestrate.sh` — `pipeline_pi_loop`: item markers + `backlog_progress` in state.json.
- **Modify** `hermes-dispatch/dispatch/server.py` — `_pipeline_worker`/`_emit_step_dones`: new `pipeline-backlog` + `pipeline-halt` frames; resume endpoint: reset halted run.
- **Modify** `hermes-dispatch/tests/test_pi_loop.sh` — assert `backlog_progress` written + markers printed.
- **Modify** `hermes-dispatch/tests/test_server.py` — assert frame emission (follow existing conventions).
- **Modify** `command-center/web/js/screens/dispatch.js` — render new frames + Resume in `wirePipelineForms` and `streamRunInto`.

---

## Phase A — dispatch backend

### Task A1: pi-loop emits progress + `backlog_progress`

**Files:** Modify `hermes-dispatch/lib/orchestrate.sh` (`pipeline_pi_loop`); Test `tests/test_pi_loop.sh`.

- [ ] **Step 1: Add failing test** — append to `tests/test_pi_loop.sh` before the summary line:

```bash
echo "== pipeline_pi_loop writes backlog_progress + prints item markers =="
RD9="$(state_init pi-prog)"
printf 'spec' > "$RD9/spec.md"; state_put_key "$RD9" spec - spec.md
printf -- '- [ ] one\n- [ ] two\n' > "$RD9/backlog.md"; state_put_key "$RD9" backlog - backlog.md
PROG_ERR="$(PI_IMPLEMENT="$FPI" TEST_RUNNER="$FTR" pipeline_pi_loop "$RD9" \
  '{"id":"build","type":"pi-loop","reads":"spec","backlog":"backlog","writes":"validated","model":"exec-free","max_cycles":3,"max_items":10}' 2>&1 >/dev/null)"
eq "backlog_progress total"   "$(jq -r '.steps[] | select(.id=="build") | .backlog_progress.total' "$RD9/state.json")" "2"
eq "backlog_progress checked" "$(jq -r '.steps[] | select(.id=="build") | .backlog_progress.checked' "$RD9/state.json")" "2"
eq "prints an item marker"    "$(printf '%s\n' "$PROG_ERR" | grep -c '▸ build: backlog item')" "2"
```

- [ ] **Step 2: Run → fails** (`backlog_progress` is null, no markers): `cd ~/Code/hermes-dispatch && tests/test_pi_loop.sh`.

- [ ] **Step 3: Implement.** In `pipeline_pi_loop` (`lib/orchestrate.sh`), after the `state_step_start`/guards and before the `while` loop, add totals:

```bash
  local total checked; total="$(grep -c '^- \[' "$backlog_file" 2>/dev/null || echo 0)"; checked=0
```

Inside the `while item=...` loop, right after `item_no=$((item_no+1))` (and the maxitem guard), print the start marker:

```bash
    printf '  ▸ %s: backlog item %s/%s — %s\n' "$id" "$item_no" "$total" "$item" >&2
    _sj "$rd" --arg id "$id" --argjson t "$total" --argjson c "$checked" --arg cur "$item" --arg now "$(_now)" \
      '(.steps[] | select(.id==$id and .status=="running")) |= (.backlog_progress={total:$t, checked:$c, current:$cur}) | .updated_at=$now'
```

On green, replace the existing `if [ "$ok" = "true" ]; then backlog_check_item "$backlog_file" "$item"; break; fi` with:

```bash
      if [ "$ok" = "true" ]; then
        backlog_check_item "$backlog_file" "$item"; checked=$((checked+1))
        printf '  ✓ %s: item %s/%s done\n' "$id" "$item_no" "$total" >&2
        _sj "$rd" --arg id "$id" --argjson c "$checked" --arg now "$(_now)" \
          '(.steps[] | select(.id==$id and .status=="running")) |= (.backlog_progress.checked=$c) | .updated_at=$now'
        break
      fi
```

- [ ] **Step 4: Run → passes** (new test + all prior): `tests/test_pi_loop.sh` (~28) and `tests/test_orchestrate.sh` (26).

- [ ] **Step 5: Commit**

```bash
git add lib/orchestrate.sh tests/test_pi_loop.sh
git commit -m "feat: pi-loop emits item markers + backlog_progress in state.json"
```

### Task A2: `pipeline-backlog` + `pipeline-halt` SSE frames

**Files:** Modify `hermes-dispatch/dispatch/server.py`; Test `tests/test_server.py`.

- [ ] **Step 1: Read** `dispatch/server.py` `_pipeline_worker` (~L1103-1161) and `_emit_step_dones` (~L1163-1178) to learn the exact regex-table style, the `push(...)` helper, and how `_emit_step_dones` reads `state.json` per step. Match those exactly.

- [ ] **Step 2: Write a failing test** in `tests/test_server.py` following its existing style. It should exercise the frame-emission helpers with representative input: a stdout line `  ▸ build: backlog item 1/2 — one` must yield a `pipeline-backlog` frame `{type:"pipeline-backlog", id:"build", item_no:1, total:2, item:"one"}`; and a `state.json` step `{"id":"build","status":"error","halt":"HALTED_STUCK"}` fed to the step-done emitter must yield a `pipeline-halt` frame `{type:"pipeline-halt", id:"build", halt_reason:"HALTED_STUCK"}`. (If the emitters aren't unit-addressable, add a thin pure helper `pipeline_progress_frame(line)` + `halt_frame(step)` and test those; wire them into `_pipeline_worker`.)

- [ ] **Step 3: Run → fails.** Run: `cd ~/Code/hermes-dispatch && python3 -m pytest tests/test_server.py -q` (or the repo's test runner) — the new assertions fail.

- [ ] **Step 4: Implement.** Add a regex + branch in `_pipeline_worker`'s line loop (mirroring the existing `cycle_re` branch):

```python
backlog_re = re.compile(r"▸ (\S+): backlog item (\d+)/(\d+) — (.*)")
# ... in the per-line loop, alongside step_re/cycle_re:
mb = backlog_re.search(line)
if mb:
    push({"type": "pipeline-backlog", "id": mb.group(1),
          "item_no": int(mb.group(2)), "total": int(mb.group(3)), "item": mb.group(4).strip()})
```

In `_emit_step_dones` (where it reads each completed step from `state.json`), after emitting `pipeline-step-done`, add:

```python
if st.get("status") == "error" and st.get("halt"):
    push({"type": "pipeline-halt", "id": st.get("id"), "halt_reason": st.get("halt")})
```

Do NOT add `pipeline-halt` to any terminal-type set — the run can be resumed. Leave all existing frames unchanged.

- [ ] **Step 5: Run → passes.** `python3 -m pytest tests/test_server.py -q`.

- [ ] **Step 6: Commit**

```bash
git add dispatch/server.py tests/test_server.py
git commit -m "feat: emit pipeline-backlog + pipeline-halt SSE frames"
```

### Task A3: resume-after-halt (reset errored run)

**Files:** Modify `hermes-dispatch/dispatch/server.py` (resume endpoint).

- [ ] **Step 1: Read** the `/resume-pipeline` handler (`_resume_pipeline_endpoint`, ~L1085-1101) and how it invokes `run-pipeline.sh --resume`. Understand the current gate-approve flow.

- [ ] **Step 2: Implement.** Before invoking `run-pipeline.sh --resume <id>`, detect a halted run and clear it so the pi-loop step (last status `error`) re-runs:

```python
# Resume-after-halt: a pi-loop halt left the run status "error". Clear it so
# pipeline_run(resume=1) re-enters the errored pi-loop step (it resumes from the
# persisted backlog). Gate approvals (status "paused") are unaffected.
state_path = RUN_ROOT / run_id / "state.json"
try:
    st = json.loads(state_path.read_text())
    if st.get("status") == "error" and any(
        s.get("halt") for s in st.get("steps", []) if s.get("status") == "error"):
        st["status"] = "running"
        state_path.write_text(json.dumps(st))
except FileNotFoundError:
    pass
```

(Use the module's existing `RUN_ROOT`/path helpers and `json` import; match the file's conventions. If the handler already reads/writes `state.json`, fold this in there.)

- [ ] **Step 3: Verify manually** (offline reasoning + a scripted check): create a run dir with an errored halted pi-loop step + a partially-checked backlog, POST resume, confirm the run status flips to `running` and the pi-loop resumes from the first unchecked item. A minimal check:

```bash
cd ~/Code/hermes-dispatch
# (author a tiny state.json + backlog.md under a fake run dir, call the resume code path)
```
Confirm existing tests still pass: `tests/test_server.py`, `tests/test_orchestrate.sh`, `tests/test_pi_loop.sh`.

- [ ] **Step 4: Commit**

```bash
git add dispatch/server.py
git commit -m "feat: resume a halted pi-loop run (reset error status, resume from backlog)"
```

---

## Phase B — command-center frontend

### Task B1: render `pipeline-backlog` + `pipeline-halt` + Resume

**Files:** Modify `command-center/web/js/screens/dispatch.js`.

- [ ] **Step 1: Branch the repo** — `cd ~/Code/command-center && git checkout -b feature/ws6-piloop-ui`.

- [ ] **Step 2: Add frame handling in `wirePipelineForms`'s `onFrame`** (the Pipelines-tab launcher, ~L961-1027). Alongside the existing `pipeline-step`/`gate` branches, add:

```javascript
} else if (frame.type === "pipeline-backlog") {
  let bl = progressEl.querySelector(".dispatch-pipeline-backlog");
  if (!bl) {
    bl = document.createElement("div");
    bl.className = "dispatch-pipeline-backlog meta";
    progressEl.appendChild(bl);
  }
  bl.textContent = `Backlog ${frame.item_no}/${frame.total} · ${frame.item || ""}`;
} else if (frame.type === "pipeline-halt") {
  const halt = document.createElement("div");
  halt.className = "dispatch-pipeline-halt";
  halt.innerHTML = `
    <p class="meta">⚠️ ${escapeHtml(frame.id || "")} halted: <strong>${escapeHtml(frame.halt_reason || "")}</strong></p>
    <button class="btn" data-piloop-resume>Resume</button>`;
  progressEl.appendChild(halt);
  halt.querySelector("[data-piloop-resume]").addEventListener("click", async () => {
    halt.innerHTML = `<p class="meta">Resuming…</p>`;
    try {
      await streamSSE("/api/resume-pipeline", {
        method: "POST", body: { run_id: frame.run_id || undefined, approve: true },
        onFrame(rf) {
          if (rf.type === "pipeline-backlog") {
            let bl = progressEl.querySelector(".dispatch-pipeline-backlog");
            if (bl) bl.textContent = `Backlog ${rf.item_no}/${rf.total} · ${rf.item || ""}`;
          } else if (rf.type === "pipeline-done") {
            halt.innerHTML = `<p class="meta">Pipeline complete.</p>`;
          } else if (rf.type === "pipeline-halt") {
            halt.innerHTML = `<p class="meta">⚠️ halted again: ${escapeHtml(rf.halt_reason || "")}</p>`;
          } else if (rf.type === "error") {
            halt.innerHTML = `<p class="meta">Error: ${escapeHtml(rf.message || "")}</p>`;
          }
        },
      });
    } catch (e) { halt.innerHTML = `<p class="meta">Resume failed: ${escapeHtml(String(e))}</p>`; }
  });
}
```

(Note: `frame.run_id` may be absent — the resume endpoint already resolves the current run for the session; pass it if the frame carries it. Confirm against how the existing gate resume calls `/api/resume-pipeline`.)

- [ ] **Step 3: Add the same two branches to `streamRunInto`'s `onFrame`** (the live-watch path, ~L365-375) so a run watched live also shows progress + halt. Render as meta bubbles via `appendBubble(list, "system", ...)` mirroring the existing `pipeline-step` branch style. For halt, include the Resume button wired the same way (stream into `list`).

- [ ] **Step 4: Manual verify** — start command-center, run the `coding-loop` pipeline from the Pipelines tab with a small goal, watch the `Backlog N/total` line advance; then force a halt (e.g. an unsolvable item) and confirm the halt + Resume button appear and Resume continues. Confirm the existing dispatch/pipeline UX (gates, steps) is unchanged.

- [ ] **Step 5: Commit**

```bash
cd ~/Code/command-center
git add web/js/screens/dispatch.js
git commit -m "feat: render pi-loop backlog progress + halt/resume in dispatch screen"
```

---

## Phase C — end-to-end

### Task C1: e2e verify + docs

- [ ] **Step 1: End-to-end** — with LiteLLM up, run the WS5 D1 goal (`mathx.py`) through command-center's `coding-loop`, approve the gate, watch backlog progress render, confirm completion. Then run a goal with a deliberately-unsatisfiable acceptance check; confirm halt + Resume surface.

- [ ] **Step 2: Update the WS6 spec** status to done and note any deviations. Commit in claude-code-config.

- [ ] **Step 3: Merge branches** to main (both repos) after verification.

---

## Self-Review

- **Spec coverage:** backlog progress (§3.1) → A1; new SSE frames (§3.2) → A2; CC render + Resume (§3.3) → B1; resume-after-halt (§3.4) → A3 + B1; testing (§6) → A1/A2 tests + B1/C1 manual; additive/no-regression (§7) → A2 "leave existing frames unchanged" + B "add branches, don't alter existing".
- **Placeholder scan:** orchestrate.sh + dispatch.js steps carry complete code; server.py steps (A2/A3) name the exact insertion points + code but instruct reading the real handler first (server.py verbatim not in hand) — this is grounding, not a placeholder.
- **Consistency:** frame names/fields identical across producer (A2 `pipeline-backlog {id,item_no,total,item}`, `pipeline-halt {id,halt_reason}`) and consumer (B1 reads the same fields); marker string `▸ <id>: backlog item N/total — item` matches between A1 (printf) and A2 (regex).
- **Carried assumptions (flagged in tasks):** exact server.py `_pipeline_worker`/resume handler shape (A2.S1/A3.S1 read first); `frame.run_id` availability for resume (B1.S2 note); whether `_emit_step_dones` is unit-addressable (A2.S2 fallback to pure helpers).
