# Cloud/Free Tier Roster Generator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `gen-roster.py` so `models.yaml` can declare external cloud/free model providers (OpenRouter, NVIDIA NIM, Gemini free, Groq) with OpenRouter-side fallback chains and price ceilings, and have them emitted into the live LiteLLM `model_list` without disturbing the local llama-swap tier.

**Architecture:** Add a new top-level `cloud_models:` list to `models.yaml`, kept separate from local `models:`. A new pure function `cloud_litellm_entry()` renders each cloud entry into a LiteLLM `model_list` block (`model: <provider/slug>`, `api_key: os.environ/<ENV>`, optional `extra_body.models` fallback chain, optional `extra_body.provider.max_price`). `build_model_list_inner()` appends the cloud section after local + judge aliases. Because `build_llamaswap_groups()` only iterates `roster["models"]`/`judge_aliases`, cloud models are excluded from llama-swap generation for free. pi's `models.json` optionally includes cloud aliases. LiteLLM-level `router_settings.fallbacks` (free head → paid floor → local) is a documented hand-edit of the preserved tail, out of the generated block.

**Tech Stack:** Python 3.11+, PyYAML, pytest 9.x. The generator's `build_*` functions are pure functions of a `roster` dict, so all logic is unit-tested against fixture dicts with zero disk I/O.

**Repo:** `~/Code/claude-code-config`. Generator: `bin/gen-roster.py`. Source of truth: `models.yaml`. This plan is committed on branch `feature/multi-model-agentic-workflow`.

**Spec:** `docs/superpowers/specs/2026-07-02-multi-model-agentic-workflow-design.md` §5.1.

---

## File Structure

- **Modify** `bin/gen-roster.py` — add `cloud_litellm_entry()`; extend `build_model_list_inner()` and `build_models_json()`.
- **Modify** `models.yaml` — add `cloud_models:` section (data).
- **Create** `tests/test_gen_roster.py` — unit tests for the generator's pure functions (loads the hyphenated module via importlib).
- **Create** `tests/conftest.py` — importlib loader + shared roster fixture.
- **Modify** `~/Code/otel-local-ai/litellm/config.yaml` — add `router_settings.fallbacks` in the preserved tail (hand-edit, documented in Task 7).
- **Modify** `~/Code/otel-local-ai/.env` — add provider API keys (gitignored; never committed).

---

## Task 1: Test scaffolding + regression guard

Establishes the importlib loader (the module filename `gen-roster.py` has a hyphen, so it can't be imported normally) and a fixture roster, and locks current local-only behavior with a regression test before any change.

**Files:**
- Create: `tests/conftest.py`
- Create: `tests/test_gen_roster.py`

- [ ] **Step 1: Write the conftest loader + fixture**

```python
# tests/conftest.py
import importlib.util
import pathlib

import pytest

_MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "bin" / "gen-roster.py"


@pytest.fixture(scope="session")
def gr():
    """The gen-roster module, loaded from its hyphenated filename."""
    spec = importlib.util.spec_from_file_location("gen_roster", _MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def roster():
    """Minimal roster: one local model, one judge, no cloud."""
    return {
        "runtime": {"proxy_to_runtime_base": "http://localhost:8081/v1"},
        "proxy": {"base_url": "http://localhost:4000/v1"},
        "models": [
            {
                "alias": "code",
                "role_label": "Code",
                "ollama_tag": "qwen3-coder:30b",
                "gguf_path": "/models/qwen3-coder-30b.gguf",
                "context_window": 32768,
                "reasoning": False,
                "input": ["text"],
                "litellm_think": False,
            }
        ],
        "judge_aliases": [],
        "pi": {
            "provider": {"api": "openai", "apiKey": "none", "authHeader": "", "compat": True},
            "comment": "test",
            "workflows": {},
            "thinking_level_map": {},
        },
    }
```

- [ ] **Step 2: Write the failing regression test**

```python
# tests/test_gen_roster.py
def test_local_model_list_unchanged(gr, roster):
    out = gr.build_model_list_inner(roster)
    assert "model_list:" in out
    assert "  - model_name: code" in out
    assert "      model: openai/code" in out
    assert "      api_key: sk-llama-swap-noauth" in out


def test_no_cloud_key_is_backward_compatible(gr, roster):
    # roster has no "cloud_models" key at all -> must not raise, no cloud output
    out = gr.build_model_list_inner(roster)
    assert "os.environ/" not in out
```

- [ ] **Step 3: Run tests to verify current behavior passes**

Run: `cd ~/Code/claude-code-config && python3 -m pytest tests/test_gen_roster.py -v`
Expected: both PASS (these assert existing behavior — they are the regression guard, green from the start).

- [ ] **Step 4: Commit**

```bash
cd ~/Code/claude-code-config
git add tests/conftest.py tests/test_gen_roster.py
git commit -m "test: add gen-roster unit scaffolding and local regression guard"
```

---

## Task 2: `cloud_litellm_entry()` — render one cloud model

**Files:**
- Modify: `bin/gen-roster.py` (add function near `litellm_entry`, ~line 96)
- Test: `tests/test_gen_roster.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_gen_roster.py  (append)
def test_cloud_entry_basic(gr):
    m = {"alias": "plan-frontier", "slug": "openrouter/anthropic/claude-opus-4.8",
         "api_key_env": "OPENROUTER_API_KEY"}
    out = gr.cloud_litellm_entry(m)
    assert "  - model_name: plan-frontier" in out
    assert "      model: openrouter/anthropic/claude-opus-4.8" in out
    assert "      api_key: os.environ/OPENROUTER_API_KEY" in out
    assert "extra_body" not in out  # no fallbacks/max_price -> no extra_body


def test_cloud_entry_fallbacks_and_price(gr):
    m = {"alias": "exec-cloud", "slug": "openrouter/moonshotai/kimi-k2.7:exacto",
         "api_key_env": "OPENROUTER_API_KEY",
         "fallbacks": ["minimax/minimax-m3", "z-ai/glm-5.2"],
         "max_price": 5.0}
    out = gr.cloud_litellm_entry(m)
    assert "      extra_body:" in out
    assert "        models:" in out
    assert "          - minimax/minimax-m3" in out
    assert "          - z-ai/glm-5.2" in out
    assert "        provider:" in out
    assert "          max_price: { completion: 5.0 }" in out
```

- [ ] **Step 2: Run to verify it fails**

Run: `python3 -m pytest tests/test_gen_roster.py::test_cloud_entry_basic -v`
Expected: FAIL — `AttributeError: module 'gen_roster' has no attribute 'cloud_litellm_entry'`

- [ ] **Step 3: Implement the function**

Add to `bin/gen-roster.py` immediately after `litellm_entry()` (after ~line 95):

```python
def cloud_litellm_entry(m: dict) -> str:
    """A LiteLLM model_list entry for an external provider (OpenRouter/NIM/etc.).

    Unlike llama-swap-backed locals, cloud entries carry the upstream provider
    slug directly and read their key from the environment. Optional OpenRouter-
    side fallback chain and per-request price ceiling are nested under extra_body.
    """
    lines = [
        f"  - model_name: {m['alias']}",
        "    litellm_params:",
        f"      model: {m['slug']}",
        f"      api_key: os.environ/{m['api_key_env']}",
    ]
    fallbacks = m.get("fallbacks") or []
    max_price = m.get("max_price")
    if fallbacks or max_price is not None:
        lines.append("      extra_body:")
        if fallbacks:
            lines.append("        models:")
            for slug in fallbacks:
                lines.append(f"          - {slug}")
        if max_price is not None:
            lines.append("        provider:")
            lines.append(f"          max_price: {{ completion: {max_price} }}")
    return "\n".join(lines)
```

- [ ] **Step 4: Run to verify it passes**

Run: `python3 -m pytest tests/test_gen_roster.py -k cloud_entry -v`
Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add bin/gen-roster.py tests/test_gen_roster.py
git commit -m "feat: add cloud_litellm_entry for external provider model_list entries"
```

---

## Task 3: Append cloud section in `build_model_list_inner()`

**Files:**
- Modify: `bin/gen-roster.py` (`build_model_list_inner`, ~lines 98-116)
- Test: `tests/test_gen_roster.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_gen_roster.py  (append)
def test_cloud_models_appear_after_locals(gr, roster):
    roster["cloud_models"] = [
        {"alias": "exec-cloud", "slug": "openrouter/moonshotai/kimi-k2.7:exacto",
         "api_key_env": "OPENROUTER_API_KEY", "fallbacks": ["minimax/minimax-m3"]}
    ]
    out = gr.build_model_list_inner(roster)
    assert "      model: openai/code" in out          # local still present
    assert "  - model_name: exec-cloud" in out         # cloud present
    assert "      api_key: os.environ/OPENROUTER_API_KEY" in out
    assert out.index("code") < out.index("exec-cloud")  # cloud after locals
```

- [ ] **Step 2: Run to verify it fails**

Run: `python3 -m pytest tests/test_gen_roster.py::test_cloud_models_appear_after_locals -v`
Expected: FAIL — `exec-cloud` absent (function ignores `cloud_models`).

- [ ] **Step 3: Implement**

In `bin/gen-roster.py`, at the end of `build_model_list_inner()` — after the `judges` loop, immediately before `return "\n".join(out)`:

```python
    cloud = roster.get("cloud_models") or []
    if cloud:
        out.append("  # cloud tier (external providers; not llama-swap-backed)")
        for m in cloud:
            out.append(cloud_litellm_entry(m))
```

- [ ] **Step 4: Run to verify it passes (plus regression)**

Run: `python3 -m pytest tests/test_gen_roster.py -v`
Expected: all PASS — including `test_no_cloud_key_is_backward_compatible` (proves `.get` guard keeps old rosters unchanged).

- [ ] **Step 5: Commit**

```bash
git add bin/gen-roster.py tests/test_gen_roster.py
git commit -m "feat: emit cloud_models into LiteLLM model_list after local tier"
```

---

## Task 4: Prove llama-swap generation excludes cloud (regression)

No code change expected — `build_llamaswap_groups()` iterates only `roster["models"]`/`judge_aliases`. This task locks that guarantee so a future refactor can't silently pull cloud models (which have no `gguf_path`) into llama-swap and crash it.

**Files:**
- Test: `tests/test_gen_roster.py`

- [ ] **Step 1: Write the test**

```python
# tests/test_gen_roster.py  (append)
def test_llamaswap_ignores_cloud(gr, roster):
    roster["cloud_models"] = [
        {"alias": "exec-cloud", "slug": "openrouter/x/y", "api_key_env": "OPENROUTER_API_KEY"}
    ]
    # Must not raise (cloud has no gguf_path) and must not include the cloud alias.
    cfg = gr.build_llamaswap_config(roster)
    assert "exec-cloud" not in cfg
    assert "qwen3-coder" in cfg  # local model still emitted
```

- [ ] **Step 2: Run to verify it passes**

Run: `python3 -m pytest tests/test_gen_roster.py::test_llamaswap_ignores_cloud -v`
Expected: PASS immediately. If it raises `SystemExit` about a missing `gguf_path`, that means cloud leaked into llama-swap generation — stop and fix `build_llamaswap_groups()` to read only `roster["models"]` before continuing.

- [ ] **Step 3: Commit**

```bash
git add tests/test_gen_roster.py
git commit -m "test: lock llama-swap generation to exclude cloud models"
```

---

## Task 5: Expose cloud aliases to pi (`build_models_json`)

**Files:**
- Modify: `bin/gen-roster.py` (`build_models_json`, ~lines 223-257)
- Test: `tests/test_gen_roster.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_gen_roster.py  (append)
import json

def test_pi_models_json_includes_cloud(gr, roster):
    roster["cloud_models"] = [
        {"alias": "exec-cloud", "slug": "openrouter/x/y", "api_key_env": "OPENROUTER_API_KEY",
         "context_window": 262144, "reasoning": False, "input": ["text"], "role_label": "Cloud exec"},
        {"alias": "exec-free", "slug": "openrouter/z:free", "api_key_env": "OPENROUTER_API_KEY",
         "context_window": 131072, "pi": False},  # pi:false -> excluded
    ]
    data = json.loads(gr.build_models_json(roster))
    ids = [m["id"] for m in data["providers"]["litellm"]["models"]]
    assert "code" in ids           # local still present
    assert "exec-cloud" in ids     # cloud with pi enabled present
    assert "exec-free" not in ids  # pi:false excluded
    cloud = next(m for m in data["providers"]["litellm"]["models"] if m["id"] == "exec-cloud")
    assert cloud["contextWindow"] == 262144
```

- [ ] **Step 2: Run to verify it fails**

Run: `python3 -m pytest tests/test_gen_roster.py::test_pi_models_json_includes_cloud -v`
Expected: FAIL — `exec-cloud` not in ids.

- [ ] **Step 3: Implement**

In `bin/gen-roster.py` `build_models_json()`, after the existing `for m in roster["models"]:` loop that appends to `models` (after ~line 241), add:

```python
    for m in roster.get("cloud_models", []):
        if m.get("pi") is False:
            continue
        models.append({
            "id": m["alias"],
            "name": m.get("pi_name", m.get("role_label", m["alias"])),
            "reasoning": bool(m.get("reasoning", False)),
            "input": list(m.get("input", ["text"])),
            "contextWindow": m["context_window"],
            "maxTokens": m.get("pi_max_tokens", PI_THINKING_DEFAULT_MAX_TOKENS),
        })
```

- [ ] **Step 4: Run to verify it passes**

Run: `python3 -m pytest tests/test_gen_roster.py -v`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add bin/gen-roster.py tests/test_gen_roster.py
git commit -m "feat: expose cloud aliases to pi models.json"
```

---

## Task 6: Add real `cloud_models` to `models.yaml`

Data task. Secrets never go here — only env-var *names*. Real keys go in `~/Code/otel-local-ai/.env` (gitignored).

**Files:**
- Modify: `models.yaml` (add top-level `cloud_models:` section)
- Modify: `~/Code/otel-local-ai/.env` (add keys — NOT committed)

- [ ] **Step 1: Verify current provider slugs + prices**

Open `https://openrouter.ai/models` and confirm the exact slugs for Kimi, MiniMax, GLM, DeepSeek, and Claude are current (they reprice/rename monthly). For NIM, confirm model IDs at `https://build.nvidia.com/models`. Note the confirmed slugs before editing.

- [ ] **Step 2: Add the `cloud_models` section to `models.yaml`**

Append at top level (sibling of `models:`). Replace the slugs below with the ones confirmed in Step 1:

```yaml
cloud_models:
  # Frontier planner (routine/autonomous PLAN; interactive high-stakes plans use Claude Code direct)
  - alias: plan-frontier
    slug: openrouter/anthropic/claude-sonnet-4.6
    api_key_env: OPENROUTER_API_KEY
    context_window: 200000
    reasoning: true
    input: [text]
    role_label: "Cloud planner (frontier)"
    free: false
    free_eligible: false

  # Bulk executor — paid floor with OpenRouter-side fallback chain + price ceiling
  - alias: exec-cloud
    slug: openrouter/moonshotai/kimi-k2.7:exacto
    api_key_env: OPENROUTER_API_KEY
    fallbacks:
      - minimax/minimax-m3
      - z-ai/glm-5.2
    max_price: 5.0
    context_window: 262144
    reasoning: false
    input: [text]
    role_label: "Cloud executor (paid floor)"
    free: false
    free_eligible: true

  # Free executor head — OpenRouter :free (rate-capped; public/OSS work only)
  - alias: exec-free
    slug: openrouter/deepseek/deepseek-v4-flash:free
    api_key_env: OPENROUTER_API_KEY
    context_window: 131072
    reasoning: false
    input: [text]
    role_label: "Cloud executor (free head)"
    free: true
    free_eligible: true

  # Free big-context executor — NVIDIA NIM (public/OSS work only)
  - alias: exec-free-nim
    slug: openai/deepseek-ai/deepseek-v4
    api_key_env: NVIDIA_NIM_API_KEY
    context_window: 131072
    reasoning: false
    input: [text]
    role_label: "NIM executor (free)"
    free: true
    free_eligible: true
```

Note: `exec-free-nim` uses `model: openai/<nim-model-id>` because NIM is OpenAI-compatible; LiteLLM needs the matching `api_base` for NIM. If Task 7's dry-run shows NIM needs an explicit `api_base`, extend `cloud_litellm_entry()` to emit `api_base` from an optional `api_base:` field (add a test first, mirroring Task 2).

- [ ] **Step 3: Add provider keys to the gitignored env file**

Edit `~/Code/otel-local-ai/.env` (confirm it is gitignored in that repo first: `git -C ~/Code/otel-local-ai check-ignore .env` should print `.env`). Add:

```
OPENROUTER_API_KEY=sk-or-...
NVIDIA_NIM_API_KEY=nvapi-...
```

Do NOT commit this file. If `check-ignore` prints nothing, stop and add `.env` to that repo's `.gitignore` before writing keys.

- [ ] **Step 4: Commit models.yaml only**

```bash
cd ~/Code/claude-code-config
git add models.yaml
git commit -m "feat: declare cloud/free model tier in roster (slugs pending verify)"
```

---

## Task 7: Regenerate + wire LiteLLM fallbacks + smoke test

**Files:**
- Run: `bin/gen-roster.py`
- Modify: `~/Code/otel-local-ai/litellm/config.yaml` (preserved tail — hand-edit)

- [ ] **Step 1: Dry-run the generator and inspect the diff**

Run: `cd ~/Code/claude-code-config && python3 bin/gen-roster.py --dry-run`
Expected: the `otel-local-ai/litellm/config.yaml` diff shows the four new cloud aliases appended to `model_list`; the llama-swap config diff shows **no** cloud aliases. If llama-swap gen errors, a cloud model leaked in — fix before proceeding.

- [ ] **Step 2: Apply the generation**

Run: `python3 bin/gen-roster.py`
Expected: "writing changes"; consumer configs updated.

- [ ] **Step 3: Add LiteLLM-level fallback chains (preserved tail — not generated)**

Edit `~/Code/otel-local-ai/litellm/config.yaml`. In `router_settings` (create if absent, outside the `>>> GENERATED <<<` marker block), add free→paid→local failover:

```yaml
router_settings:
  fallbacks:
    - exec-free: ["exec-free-nim", "exec-cloud", "code"]
    - exec-free-nim: ["exec-cloud", "code"]
    - exec-cloud: ["code"]
  num_retries: 2
```

This stacks on OpenRouter's own `extra_body.models` chain: a free-tier 429 falls to the next free head, then the paid floor, then local `code`. Confirm this block sits *outside* the generated markers so `gen-roster.py` preserves it.

- [ ] **Step 4: Restart LiteLLM and smoke-test a free alias**

Run (restart per your compose setup):
```bash
cd ~/Code/otel-local-ai && docker compose restart litellm
```
Then, with the master key from `otel-local-ai/.env`:
```bash
curl -s http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"exec-free","messages":[{"role":"user","content":"reply with OK"}]}' | head -c 400
```
Expected: a JSON completion (not an auth/route error). A 401 from the provider means the env key is missing/wrong; a LiteLLM "model not found" means regeneration or restart didn't take.

- [ ] **Step 5: Confirm the fallback fires on rate-limit (optional, best-effort)**

Hammer `exec-free` past its rate cap (loop ~30 quick calls) and confirm via Langfuse (`:3001`) that overflow requests resolved on `exec-free-nim`/`exec-cloud`, not errors.

- [ ] **Step 6: Commit the regenerated configs**

```bash
cd ~/Code/otel-local-ai
git add litellm/config.yaml
git commit -m "chore: regenerate LiteLLM config with cloud tier + fallback routing"
# (llama-swap/hermes/pi generated files: commit in their own repos if tracked)
```

---

## Remaining workstreams (separate plans, in dependency order)

Each is its own spec-referenced plan; do not fold into this one.

1. **WS2 — Free-eligibility privacy enforcement.** Consume the `free_eligible`/`free` tags added here; ensure vault/private workloads cannot resolve to a `free: true` alias. (Depends on this plan.)
2. **WS3 — Per-workflow budget keys.** LiteLLM virtual keys with `max_budget`/`duration` per long-running workflow. (Depends on this plan.)
3. **WS4 — Planner→executor handover adapter.** superpowers spec+plan → dispatch seed keys; wire high-stakes (Claude Code seeds) and routine (dispatch `planner` agent) paths.
4. **WS5 — Convergence: ralph → dispatch pipeline.** Author the coding pipeline; port ralph discipline (backlog granularity, VALIDATION.md feedback, safety halts, resumability); retire `bin/ralph`. (Depends on WS1 for tiered models.)
5. **WS6 — Command-center exposure.** New additive SSE frames (backlog items, halt reason, resume) + CC UI; contract-stable so existing dispatch UX never regresses. (Depends on WS5.)

---

## Self-Review

- **Spec coverage (this plan = spec §5.1):** cloud/free provider entries ✓ (T2,T3,T6); fallback chains ✓ (T2 OpenRouter-side, T7 LiteLLM-side); generator local/cloud fork ✓ (T2); llama-swap exclusion ✓ (T4); pi/hermes exposure ✓ (T5, pi); regenerate + inherit ✓ (T7). WS2–6 explicitly deferred to their own plans.
- **Placeholder scan:** no TBD/TODO; every code step shows full code; slug values flagged for live verification (T6.S1) rather than left vague.
- **Type consistency:** `cloud_litellm_entry(m)` signature and the `cloud_models` entry keys (`alias`, `slug`, `api_key_env`, `fallbacks`, `max_price`, `context_window`, `pi`) are identical across T2, T3, T5, T6.
- **Open risk carried forward:** NIM may require an explicit `api_base` — T6.S2 flags the extension point and T7.S1 is the detection point.
