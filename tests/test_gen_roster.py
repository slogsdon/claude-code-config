# tests/test_gen_roster.py
import json


def test_local_model_list_unchanged(gr, roster):
    out = gr.build_model_list_inner(roster)
    assert "model_list:" in out
    assert "  - model_name: code" in out
    assert "      model: openai/code" in out
    assert "      api_key: sk-llama-swap-noauth" in out


def test_no_cloud_key_is_backward_compatible(gr, roster):
    # Forward-looking guard for the cloud-tier feature: currently trivially passes
    # (no code path emits os.environ/ yet); becomes a live regression guard once
    # Task 3 emits cloud entries. roster has no "cloud_models" key -> must not raise.
    out = gr.build_model_list_inner(roster)
    assert "os.environ/" not in out


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


def test_cloud_entry_max_price_zero_is_emitted(gr):
    # max_price: 0 must NOT be swallowed by a truthiness check (guarded by `is not None`)
    m = {"alias": "exec-free", "slug": "openrouter/z:free",
         "api_key_env": "OPENROUTER_API_KEY", "max_price": 0}
    out = gr.cloud_litellm_entry(m)
    assert "      extra_body:" in out
    assert "          max_price: { completion: 0 }" in out


def test_cloud_models_appear_after_locals(gr, roster):
    roster["cloud_models"] = [
        {"alias": "exec-cloud", "slug": "openrouter/moonshotai/kimi-k2.7:exacto",
         "api_key_env": "OPENROUTER_API_KEY", "fallbacks": ["minimax/minimax-m3"]}
    ]
    out = gr.build_model_list_inner(roster)
    assert "      model: openai/code" in out          # local still present
    assert "  - model_name: exec-cloud" in out         # cloud present
    assert "      api_key: os.environ/OPENROUTER_API_KEY" in out
    lines = out.split("\n")  # line-based ordering: robust to substrings in slugs/aliases
    assert lines.index("  - model_name: code") < lines.index("  - model_name: exec-cloud")


def test_llamaswap_ignores_cloud(gr, roster):
    roster["cloud_models"] = [
        {"alias": "exec-cloud", "slug": "openrouter/x/y", "api_key_env": "OPENROUTER_API_KEY"}
    ]
    # Must not raise (cloud has no gguf_path) and must not include the cloud alias.
    cfg = gr.build_llamaswap_config(roster)
    assert "exec-cloud" not in cfg
    assert "qwen3-coder" in cfg  # local model still emitted


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
