# Multi-Model Agentic Workflow — Convergence Design

- **Date:** 2026-07-02
- **Status:** design (pending implementation plan)
- **Companion reference:** vault note `Projects/Multi-Model Agentic Workflow Architecture`
- **Owner:** single operator (Mac Mini M4 + MacBook Pro observability host)

## 1. Purpose

Turn the reference architecture (frontier-plans / cheap-executes / local-bulk, quality-per-dollar,
speed deprioritized) into a concrete build **on top of infrastructure that already exists**. The
reference note assumes most of the plumbing is greenfield; investigation shows ~80% is already built.
This spec scopes only the delta.

Two goals drive the work:

1. **Cost offset** — introduce free-tier model providers (OpenRouter `:free`, NVIDIA NIM, Gemini free,
   Groq, others) as the head of LiteLLM fallback chains, backed by paid floors, to absorb the
   high-volume executor tier at zero marginal cost.
2. **Optimal harness handover** — define a clean planner→executor→verifier handover where a frontier
   planner (Claude Code + superpowers) hands a spec+plan to an autonomous executor, which self-drives
   task-by-task with evidence-gated verification, then returns a diff for frontier review.

## 2. Existing infrastructure (do not rebuild)

| Capability | Where it lives | State |
|---|---|---|
| LiteLLM chokepoint + OTel/Langfuse cost+token tracking | `otel-local-ai/litellm/config.yaml` → llama-swap `:8081`; OTel collector → Langfuse (MacBook Pro `:3001`) | live, 100% local |
| Single-source model config | `claude-code-config/models.yaml` → `bin/gen-roster.py` regenerates LiteLLM, pi `models.json`, hermes config, llama-swap config | live |
| llama-swap one-model-at-a-time | `~/.config/llama-swap/config.yaml`, served `:8081` OpenAI-compatible | live |
| Autonomous coding loop (PLAN→IMPLEMENT→VALIDATE) | `ralph-loop/` — `pi` per phase, filesystem state (`.ralph/*.md`), real-bash evidence gate, safety halts | live |
| Multi-agent DAG pipeline engine | `hermes-dispatch/` — JSON DAG (`agent`/`gate`/`test-loop` steps), deterministic test-runner, escalation, file-based state, mobile chat + SSE + 28-agent routing | live |
| General autonomous agent | hermes (`~/.hermes/config.yaml`) — concise, local `qwythos`, aggressive context compression | live |
| Unified control UI | `command-center/` — FastAPI `:8888` + vanilla-JS PWA (Tailscale), **already proxies all dispatch endpoints** (chat, run, run-pipeline, gate approval, sessions, pipelines, artifacts) with a single-slot hardware queue | live |

**Port map:** command-center `:8888` → hermes-dispatch `:7777` → LiteLLM `:4000` → llama-swap `:8081`.
Langfuse `:3001`, life-dashboard `:8742`. All same-origin/localhost, Tailscale-fronted, no CORS/auth.

**Key lever the reference note does not mention:** `models.yaml` is the single source of truth.
Add a provider once, regenerate, and *every* consumer (pi, hermes, dispatch, Claude Code) inherits it.
No per-app wiring.

**Key fact:** the entire stack is local today. Zero cloud or free providers are wired. The only
non-local credentials in use are the LiteLLM master key and self-hosted Langfuse keys.

## 3. Decisions (locked)

1. **One orchestration engine: hermes-dispatch.** ralph's standalone `bin/ralph` retires; its loop
   becomes a dispatch pipeline. pi drops to interactive-escalation only.
2. **Planner = both, by workflow.** High-stakes work is planned interactively in Claude Code
   (superpowers brainstorm→writing-plans, frontier); routine work is planned by a dispatch `planner`
   agent on a cloud/frontier alias. Both feed the *same* downstream executor pipeline.
3. **Free tiers = public/OSS + web-research workloads only.** Vault, private repos, and client work
   never touch free endpoints (they train on submitted data). Enforced by alias tagging in `models.yaml`.

## 4. Architecture

### 4.1 Handover contract

The filesystem + git *is* the interface between harnesses. superpowers spec+plan maps onto the
dispatch pipeline's seed keys:

```
Claude Code (frontier, interactive)            hermes-dispatch pipeline (cheap/free/local, autonomous)        Claude Code
  brainstorming  → spec  ───────────────▶  seed key: plan.md (spec acceptance criteria + task backlog)
  writing-plans  → plan  ───────────────▶  [gate: spec-approval]  ← human checkpoint (high-stakes only)
                                            test-loop step:
                                              IMPLEMENT one unchecked backlog item   (cheap-cloud :exacto + :free head → paid floor)
                                              VALIDATE via real bash (exit-code truth) (local)
                                              on fail → specific feedback → re-IMPLEMENT
                                              escalate after max_cycles                ──git diff──▶  review vs spec
```

- **High-stakes path:** Claude Code produces the spec+plan and seeds the pipeline; the `spec-approval`
  gate is the human review point.
- **Routine path:** the pipeline's own `planner` agent generates the plan on a cloud/frontier alias;
  the gate auto-approves.
- **Adapter:** one thin translator — superpowers plan output → dispatch seed keys (`plan.md` +
  backlog checklist). Alternatively, teach writing-plans to emit the dispatch seed format directly.

### 4.2 Convergence: port ralph discipline into dispatch test-loop

Retiring `bin/ralph` must not regress capability. The dispatch `test-loop` already provides the
deterministic exit-code gate, `max_cycles`, and `escalation_agent`. Port the following ralph
properties into it (verify which already exist before building):

- **Backlog granularity** — IMPLEMENT addresses exactly one unchecked `- [ ]` item per turn; VALIDATE
  flips the box only on passing bash evidence.
- **Specific failure feedback** — on VALIDATE fail, write the exact command run + output + required
  change (ralph's `VALIDATION.md`), fed back to the next IMPLEMENT turn.
- **Safety halts** — stuck detection (N identical failures), max-iteration cap, context cap, user
  STOP kill-switch.
- **Resumability** — filesystem state so context/turn caps are non-fatal and a run can resume.

### 4.3 Model routing (per phase)

| Phase | Tier | Alias intent |
|---|---|---|
| PLAN | frontier | Claude Code (Anthropic-direct, high-stakes) OR cloud alias `plan-frontier` (routine) |
| IMPLEMENT | cheap-cloud + free | `exec-cloud` = OpenRouter `:exacto` (Kimi→MiniMax→GLM fallback) with a `:free` head and local floor |
| VALIDATE | local | running bash checks is cheap; no frontier needed |
| REVIEW | frontier | Claude Code diff-vs-spec (high-stakes) OR `reviewer` agent (routine) |

## 5. Workstreams (the delta to build)

1. **Tiered + free providers in `models.yaml` — requires generator extension (confirmed by spike).**
   `gen-roster.py` is hardcoded local-only today: `litellm_entry()` always emits
   `model: openai/<alias>` + llama-swap `api_base` + `sk-llama-swap-noauth`; `build_model_list_inner()`
   iterates *all* models; `build_llamaswap_groups()` hard-exits if any model lacks `gguf_path`. Cloud
   models cannot be added to the existing `models:` list without crashing llama-swap generation.
   LiteLLM-level `router_settings.fallbacks` and per-key budgets live in the preserved tail and are
   not managed by the generator at all. The extension:
   - **Schema:** add a separate `cloud_models:` section (distinct from local `models:`). Each entry:
     `alias`, upstream `slug` (e.g. `openrouter/moonshotai/kimi-k2.7:exacto`), `api_key_env`, optional
     `fallbacks:` (OpenRouter-side `extra_body.models` chain), optional `max_price`, `free: true|false`,
     `free_eligible` privacy tag.
   - **Generator:** branch `litellm_entry()` on local vs cloud; include `cloud_models` in
     `build_model_list_inner()`; **exclude** them from llama-swap + `gguf_path` checks; decide pi/hermes
     exposure.
   - **Router fallbacks + budgets:** manage `router_settings.fallbacks` (free head → paid floor →
     local) and per-workflow virtual keys either via a second marker block in the LiteLLM tail or a
     documented hand-edit — the current generated block is `model_list` only.

   Then: verify current provider slugs + prices before wiring; regenerate; confirm every consumer
   (pi, hermes, dispatch, Claude Code) inherits with no per-app change (property holds — all point at
   LiteLLM `:4000`).
2. **Free-eligibility tagging + privacy enforcement.** Tag each alias public/OSS-eligible vs
   local-only. Ensure vault/private workloads cannot resolve to a free endpoint.
3. **Per-workflow budget caps.** Replace single-master-key usage with per-workflow LiteLLM virtual
   keys (`max_budget`, `duration`) so a runaway free→paid fallback hard-stops.
4. **Planner→executor handover adapter.** superpowers spec+plan → dispatch seed keys. Wire the
   high-stakes path (Claude Code seeds pipeline) and the routine path (dispatch `planner` agent).
5. **Convergence: ralph → dispatch pipeline.** Author the coding pipeline definition; port ralph
   discipline (§4.2); retire `bin/ralph`; repoint pi to interactive-escalation use.
6. **Command-center exposure of the converged engine.** command-center already proxies all dispatch
   endpoints and lists pipelines dynamically, so the new coding pipeline is runnable in CC with **no
   CC change**. The delta is surfacing the ralph-ported semantics (§4.2) that current SSE frames don't
   carry:
   - **New SSE frames from dispatch:** backlog item-level progress (`pipeline-backlog`:
     items + checked state), safety-halt reason on terminal `pipeline-done` (`HALTED_STUCK` /
     `_MAXITER` / `_CTX` / `_STOP`), and a resume-after-halt affordance (extend `/resume-pipeline` or
     surface `--resume <run-id>` against existing `/pipeline-status?run_id`).
   - **CC UI:** render the backlog checklist in the session drawer; show halt reason; add a
     resume/STOP control (STOP maps to existing `cancelRun`).
   - **Contract stability:** additive frames only — existing frame shapes must not change, so the
     current dispatch UX never regresses.
   - Model-tier/budget visibility (which tier a run used, per-workflow spend) is **optional** — Langfuse
     already tracks cost; a CC Ops/analytics tile can link it later. Not in initial scope.

## 6. Validation

- Run one dev workflow (high-stakes path: Claude Code plan → dispatch execute → Claude Code review)
  against a golden-reference project. Measure **cost per accepted artifact** via existing
  OTel/Langfuse, not cost per token.
- Confirm free-head → paid-floor fallback triggers correctly on a forced 429 (rate-limit).
- Confirm a private-tagged workload never resolves to a free endpoint.
- Confirm a per-workflow budget key hard-stops a runaway loop.
- Confirm the new coding pipeline appears and runs in command-center unchanged (dynamic `/pipelines`),
  and that the new backlog/halt/resume SSE frames render without breaking the existing dispatch UX.

## 7. Risks / caveats

- **Free-tier reliability + rate limits** — free endpoints have no SLA and low request ceilings; they
  are the fallback *head*, never the only path. Paid floor + local backstop are mandatory.
- **Free-tier data training** — mitigated by §3.3 tagging; must be enforced, not advisory.
- **hermes 64K context floor** — if any hermes executor path remains, route it only to big-context
  free tiers (NIM, Gemini free, large OpenRouter `:free` models), never tiny ones.
- **Convergence regression** — retiring ralph risks losing its discipline; §4.2 is the guard.
- **Benchmark numbers are harness-dependent** — treat reference-note tiers as directional; validate
  on the golden-reference project.
- **Provider slugs/prices reprice monthly** — verify before wiring; pin providers if output quality
  drifts.

## 8. Out of scope

- Learned/dynamic per-request routing (static role assignment is deliberate).
- Concurrency / speed optimization (explicitly deprioritized).
- Rebuilding LiteLLM, OTel, llama-swap, or the dispatch engine — all exist and are reused.
