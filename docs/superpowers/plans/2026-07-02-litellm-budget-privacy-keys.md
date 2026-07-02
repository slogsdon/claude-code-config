# LiteLLM Virtual Keys — Budget Caps (WS3) + Privacy Allowlists (WS2)

- **Date:** 2026-07-02
- **Status:** WS3 mechanism DONE + verified live; WS2 + workflow-wiring are follow-ons
- **Spec:** `2026-07-02-multi-model-agentic-workflow-design.md` §5 (WS2, WS3)

## What this delivers

WS2 and WS3 share one mechanism: **LiteLLM virtual keys**. A per-workflow key carries
both a `max_budget`/`budget_duration` (WS3 cost cap) and a `models` allowlist (WS2 privacy —
a private key omits every `free: true` cloud alias so vault/private work can only reach local
models). Prerequisite for either: a database connected to LiteLLM (without one, `/key/*` is
disabled — confirmed: `/key/info` → "Database not connected").

## Done (verified live 2026-07-02)

- **Dedicated Postgres** `litellm-db` (`postgres:16-alpine`, named volume `litellm_pgdata`,
  healthcheck) added to `otel-local-ai/docker-compose.yml`, isolated from Langfuse's DB.
- **LiteLLM wired to it** — `DATABASE_URL` + `LITELLM_SALT_KEY` env (secrets auto-generated
  into gitignored `.env`), `depends_on: litellm-db (healthy)`. Prisma migrations run on boot;
  `/key/*` endpoints live.
- **Verified:** minted a key with `max_budget: 1.0`, `budget_duration: 7d`,
  `models: [exec-free, exec-cloud, plan-frontier, code]`. Allowlist **enforcement proven** — a
  call to `max` (not in the allowlist) was rejected: *"key not allowed to access model … can
  only access models=['exec-free','code']"*. Test keys cleaned up.
- **Helper** `otel-local-ai/scripts/litellm-key.sh` — `mint <alias> <budget> <duration> <models>`
  / `list` / `delete <alias>`.

Commits: `otel-local-ai@775ba00` (DB + helper); `773cbaa` (prior NIM wiring).

## Follow-on 1 — WS2 privacy allowlists — DONE (2026-07-02, `otel-local-ai@0683b53`)

`scripts/litellm-key.sh provision [--dry-run]` derives two standing keys from `models.yaml` tags
and mints them (rotating any existing same-alias key):
- **`vault-private`** → allowlist = every **non-`free`** alias (all local + judges; any `free:false`
  cloud). Unlimited budget (local is $0). For vault/private/client work.
- **`public`** → allowlist = **all** aliases incl. free cloud. $10/30d safety cap. Public/OSS only.

**Invariant enforced in code:** provision aborts if any `free:true` alias would land in
`vault-private` (a Python `assert` over `cloud_models[].free`). Verified live: the `vault-private`
key calling `exec-free` is REJECTED ("key can only access models=[local…]"); calling `code` is
allowed; the `public` key can call `exec-free`. Key values are written to gitignored
`otel-local-ai/.keys.env` (`KEY_VAULT_PRIVATE`, `KEY_PUBLIC`), `chmod 600`.

Re-run `provision` whenever `models.yaml` tiers change (e.g. after enabling paid cloud) — the
allowlists recompute from the current tags.

## Follow-on 2 — wire workflows to their keys

Point each consumer at its own key instead of the master key:
- **ralph** — `RALPH_*` env / `lib/common.sh` provider key.
- **hermes-dispatch** — per-agent or per-pipeline key (the pipeline run seeds it).
Store minted key values where the workflow reads them (not in git).

## Note on current priority

The cloud tier is presently all-free (NIM), so budget caps have nothing to cap yet — WS3's
value is realized when OpenRouter paid is enabled (uncomment the dormant tier in `models.yaml`,
add OR credits). The mechanism is now in place so that switch is a config change, not a build.
The WS2 privacy boundary (keep vault/private off free endpoints) IS relevant now.
