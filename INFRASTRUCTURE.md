# Local LLM Infrastructure

How the local model roster is served. Source of truth for the roster itself is
[`models.yaml`](models.yaml); this doc covers the **runtime** it generates into.

## Stack (2026-06-18: migrated off Ollama)

```
caller ──► LiteLLM (:4000, Docker) ──► llama-swap (:8081, host) ──► llama-server (llama.cpp) ──► GGUF
           alias as `model`           resolves alias→model,         one process per model,
           OTel + Langfuse            on-demand load + TTL unload    -ngl 99 (Metal), --jinja
```

- **LiteLLM** — unified proxy, Docker (`~/Code/otel-local-ai/docker-compose.yml`). Config
  mounted read-only from `~/Code/otel-local-ai/litellm/config.yaml`; **restart the
  `litellm` container to apply config changes** (no hot-reload).
- **llama-swap** v228 — `~/bin/llama-swap`, Go binary from the GitHub release (the
  Homebrew formula is blocked by the untrusted-tap policy). Config
  `~/.config/llama-swap/config.yaml`. Auto-starts via the LaunchAgent below.
- **llama-server** — `~/bin/llama-server` → symlink into the Homebrew `llama.cpp` keg
  (currently build 9700). `/opt/homebrew/bin/llama-server` is hijacked by an old
  `tabby` symlink — do **not** use it.
- **GGUFs** — `~/models/gguf/` (downloaded) plus three reused directly from the Ollama
  blob store (see below).

## Why we left Ollama

Ollama 0.30 diverged its inference engine. Its newest model blobs **no longer load on
upstream llama.cpp**:
- `qwen3.6:35b` (`qwen35moe`) — `rope.dimension_sections` is 3 ints `[t,h,w]`; stock
  llama.cpp demands a length-4 array. Ollama's loader is lenient; upstream rejects it.
  Fixed by using a properly-converted HF GGUF (the converter pads to 4).
- `lfm2.5-thinking:1.2b` — missing tensor `token_embd_norm.weight`. Fixed by the
  official LiquidAI GGUF.
- `gemma4:*-mlx` — nvfp4 MLX, not GGUF at all; llama-server can't run them.

There is **no standalone `llama-server` that matches Ollama's engine** (it ships an
embedded `libllama-server-impl.dylib`, not a reusable CLI), so the roster moved to
upstream-compatible GGUFs.

## ⚠️ Required: Metal GPU working-set limit

This 32 GB M4 reports a default Metal working-set of only **~21.3 GB**. The `max`
weights are ~20.6 GB, so they OOM on compute (`kIOGPUCommandBufferCallbackErrorOutOfMemory`)
unless the limit is raised. Even the 17 GB models are borderline. Set persistently via a
LaunchDaemon (root):

```bash
sudo sysctl iogpu.wired_limit_mb=28672      # immediate (28 GB GPU budget)
sudo cp ~/models/com.shanelogsdon.iogpu-wired-limit.plist /Library/LaunchDaemons/
sudo chown root:wheel /Library/LaunchDaemons/com.shanelogsdon.iogpu-wired-limit.plist
sudo launchctl load -w /Library/LaunchDaemons/com.shanelogsdon.iogpu-wired-limit.plist
```

Verify: `sysctl -n iogpu.wired_limit_mb` → `28672`.

## GGUF provenance

| alias(es) | model id | GGUF | source |
|---|---|---|---|
| max, reasoning, *-judge | qwen3.6:35b | `~/models/gguf/Qwen3.6-35B-A3B-UD-Q4_K_M.gguf` | `unsloth/Qwen3.6-35B-A3B-GGUF` |
| writing | gemma-4-26b | `~/models/gguf/gemma-4-26B-A4B-it-UD-Q4_K_M.gguf` | `unsloth/gemma-4-26B-A4B-it-GGUF` |
| fast | gemma-4-e4b | `~/models/gguf/gemma-4-E4B-it-Q4_K_M.gguf` | `unsloth/gemma-4-E4B-it-GGUF` |
| classify | lfm2.5-thinking:1.2b | `~/models/gguf/LFM2.5-1.2B-Thinking-Q8_0.gguf` | `LiquidAI/LFM2.5-1.2B-Thinking-GGUF` |
| balanced, balanced-judge | granite4.1:8b | Ollama blob `sha256-ed902ac9…` | reused (loads on upstream as-is) |
| code | qwen3-coder:30b | Ollama blob `sha256-1194192c…` | reused |
| structured | lfm2:24b | Ollama blob `sha256-d55ab0bf…` | reused (needs `--jinja`) |

The three "reused" models are read **directly from the Ollama blob store** by
llama-server — the Ollama daemon does not need to run. To fully decouple from Ollama,
copy those blobs into `~/models/gguf/` and repoint `gguf_path` in `models.yaml`.

## Thinking control

Ollama's per-request `think` became `chat_template_kwargs.enable_thinking` (llama.cpp,
needs `--jinja`). `gen-roster.py` emits `enable_thinking: false` in the LiteLLM entry for
every alias whose `litellm_think: false`. Aliases sharing a model (`max` thinking-on vs
`reasoning`/judges thinking-off, both `qwen3.6:35b`) run **one** llama-server process and
differ only per-request — no reload between them.

## Operating

```bash
# regenerate all configs after editing models.yaml
~/Code/claude-code-config/bin/gen-roster.sh        # or: python3 bin/gen-roster.py --dry-run

# llama-swap service
launchctl load ~/Library/LaunchAgents/com.shanelogsdon.llama-swap.plist
curl -s http://127.0.0.1:8081/v1/models | python3 -m json.tool   # list model ids
tail -f ~/.llama-swap/logs/llama-swap.log

# end-to-end through the proxy
KEY=$(grep '^LITELLM_MASTER_KEY=' ~/Code/otel-local-ai/.env | cut -d= -f2)
curl -s http://localhost:4000/v1/chat/completions -H "Authorization: Bearer $KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"balanced","messages":[{"role":"user","content":"hi"}],"max_tokens":20}'
```

`config.yaml`, the LaunchAgent, and the LaunchDaemon are **not** in this repo (they live
under `~/.config`, `~/Library`, `/Library`). `config.yaml` is regenerated from
`models.yaml`; the two plists are reproduced above.
