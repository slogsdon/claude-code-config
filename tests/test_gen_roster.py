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
