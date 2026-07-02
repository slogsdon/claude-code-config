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
