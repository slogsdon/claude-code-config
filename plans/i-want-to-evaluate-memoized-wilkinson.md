# Plan: Qwen e4b Benchmark — LM Studio vs LM Studio

## Context

Evaluate `gemma4:4b` (LM Studio) vs `google/gemma-4-e4b` (LM Studio) across software and product development tasks. Goal: understand which runtime performs better for tool use, code generation, architecture reasoning, and product thinking — to inform which backend to route local tasks to.

## Parameters

| Setting | Value |
|---|---|
| LM Studio model | `gemma4:4b` (pull first) |
| LM Studio model | `google/gemma-4-e4b` |
| Runs per test | 5 |
| Output | Markdown report + JSON raw data |
| Script location | `~/Code/claude-code-config/scripts/gemma4-bench/` |

## Execution Order

Run LM Studio first (all 5 runs × all tests), then fully unload, then LM Studio. Never interleave backends — VRAM must be clean between switches.

## Step 1 — Pull gemma4:4b in LM Studio

```bash
ollama pull gemma4:4b
```

Verify: `curl -s http://localhost:11434/api/tags | jq '.models[] | select(.name | contains("4b"))'`

## Step 2 — Create benchmark script

**File:** `~/Code/claude-code-config/scripts/gemma4-bench/bench.py`

### Dependencies
```
pip install openai httpx rich
```

### Backends

```python
BACKENDS = {
    "ollama": {
        "base_url": "http://localhost:11434/v1",
        "api_key": "ollama",
        "model": "gemma4:4b",
    },
    "lmstudio": {
        "base_url": "http://localhost:1234/v1",
        "api_key": "lm-studio",
        "model": "google/gemma-4-e4b",
    },
}
```

### Metrics captured per run

- **TTFT** — time from request send to first streamed token chunk
- **Total time** — wall clock for full completion
- **Prompt tokens** — from usage in response
- **Completion tokens** — from usage in response  
- **TPS** — completion_tokens / total_time
- **Tool call success** — boolean (for tool use tests)

### Test suite (7 cases)

| ID | Category | Prompt summary | Tool use? |
|---|---|---|---|
| `warmup` | Warmup | "Say hello in one sentence" | No |
| `codegen` | Code generation | Write a Python JWT parser without libraries | No |
| `code_review` | Code review | Find bugs in a provided buggy Python snippet | No |
| `tool_use` | Tool use | Call a `get_file_info(path)` tool to check a file | Yes |
| `arch_design` | Architecture | Design REST API for a task management system | No |
| `user_stories` | Product thinking | Write 5 user stories for PDF export feature | No |
| `debug` | Debugging | Identify and fix the bug in a provided function | No |

Warmup run is excluded from metrics.

### Tool use test details

Define a single tool:
```json
{
  "type": "function",
  "function": {
    "name": "get_file_info",
    "description": "Returns size and last-modified date for a file path",
    "parameters": {
      "type": "object",
      "properties": {
        "path": {"type": "string", "description": "Absolute file path"}
      },
      "required": ["path"]
    }
  }
}
```

Prompt: *"Use the get_file_info tool to check /etc/hosts and tell me its size."*

Score: 1 if model emits a tool call with `name == "get_file_info"` and `path` argument present. 0 otherwise.

### Model unloading between backends

After all LM Studio runs complete:
```python
# Force LM Studio to evict model from VRAM
import requests
requests.post("http://localhost:11434/api/generate", json={
    "model": "gemma4:4b",
    "keep_alive": 0
})
time.sleep(5)  # let GPU memory clear
```

LM Studio has no explicit unload API — the gap + `time.sleep(5)` is sufficient since LM Studio frees VRAM.

### Output files

- `results/raw_YYYYMMDD_HHMMSS.json` — all per-run metrics
- `results/report_YYYYMMDD_HHMMSS.md` — comparison table

## Step 3 — Run the benchmark

```bash
cd ~/Code/claude-code-config/scripts/gemma4-bench
python bench.py
```

Execution order enforced by script:
1. Warmup LM Studio (1 run, not recorded)
2. LM Studio — 5 runs × 6 test cases
3. Unload LM Studio model
4. Warmup LM Studio (1 run, not recorded)
5. LM Studio — 5 runs × 6 test cases
6. Write results files

## Step 4 — Report format

```markdown
# Qwen e4b Benchmark Results

## Summary

| Metric | LM Studio (gemma4:4b) | LM Studio (e4b) | Winner |
|---|---|---|---|
| Avg TTFT (ms) | ... | ... | ... |
| Avg TPS | ... | ... | ... |
| Tool use accuracy | X/5 | X/5 | ... |

## Per-Test Results

[table per test case]

## Raw data: results/raw_YYYYMMDD.json
```

## Verification

1. After `ollama pull gemma4:4b`, confirm model appears in `ollama list`
2. Run script with `--dry-run` flag first to validate API connectivity to both backends
3. Confirm `results/raw_*.json` written after full run
4. Open `results/report_*.md` and verify all 6 test cases × 2 backends × 5 runs are present (60 data points)
5. Check tool use rows — if both backends score 0/5, tool calling may not be supported by this model size and we note that in the report

## Critical files

- Script: `~/Code/claude-code-config/scripts/gemma4-bench/bench.py`
- Results: `~/Code/claude-code-config/scripts/gemma4-bench/results/`
- LM Studio API reference: http://localhost:11434/api/tags (already confirmed working)
- LM Studio API reference: http://localhost:1234/v1/models (already confirmed working)
