---
name: compress-prompt
description: Use when about to write a long prompt, include verbose text in context, or when any block of text needs to be made token-efficient before use. Delegates compression to Qwen.
---

# Skill: compress-prompt

Compress verbose text into a token-efficient version using Qwen. Preserves meaning and intent; strips filler, redundancy, and padding.

## When to Use

- Before writing a long prompt to the user
- Before including verbose content in context (notes, docs, logs)
- When a block of text is longer than it needs to be

## Steps

1. Identify the text to compress (from user message, clipboard, or current context)
2. Call `mcp__lmstudio-agent__qwen_start` (standalone) or `mcp__plugin_shane-config_lmstudio-agent__qwen_start` (plugin — use whichever is available) with:
   - `task`: `"Compress the following into a token-efficient version. Preserve all meaning, intent, and key details. Remove filler words, redundancy, and padding. Do not summarize — compress. Output only the compressed text, no commentary.\n\n[TEXT TO COMPRESS]"`
   - No `skill` or `context` fields needed
3. Loop: if `status` is `"running"`, call `mcp__lmstudio-agent__qwen_continue` (or `mcp__plugin_shane-config_lmstudio-agent__qwen_continue` in plugin) with `session_id`; repeat until `status` is `"done"` or `"error"`
4. Return Qwen's `result` as the compressed output

## Notes

- **Compress ≠ summarize.** Summarizing loses detail. Compressing preserves it in fewer tokens.
- If the input is already tight, say so rather than padding the output.
- Works on prompts, notes, documentation, session logs, or any prose.
