# tests/test_gen_roster.py
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
