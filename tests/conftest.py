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
