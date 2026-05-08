# extensions/

Auxiliary configs and runtime extensions that live alongside the main Claude Code config but target adjacent runtimes.

## What "Pi-specific" means here

Some files in this directory target [Pi Coding Agent](https://github.com/mariozechner/pi-coding-agent) — a long-running, headless coding-agent host that the maintainer runs on a Raspberry Pi as a persistent background agent. "Pi" in this codebase always refers to that runtime, not the hardware (though the hardware is where it runs in practice).

These files are **not** Claude Code hooks, MCP servers, or skills — Claude Code does not load them. They are kept in this repo because the Pi setup mirrors and extends the same configuration surface (vault paths, memory layout, conventions) that Claude Code uses, and shipping them together keeps both runtimes coherent.

If you are using this repo only as a Claude Code config, you can ignore everything in this directory.

## Files

### `obsidian-memory.ts` — Pi extension

A Pi extension that keeps per-project memory in sync between three locations, with the Obsidian vault as the source of truth:

| Location | Role |
| --- | --- |
| `Context/Memory/<project-name>/MEMORY.md` in the vault | Source of truth — versioned in the vault's git repo |
| `<project>/MEMORY.md` | Convenient in-tree mirror used by tools that read from cwd |
| `~/.claude/projects/<cwd-key>/memory/MEMORY.md` | Claude Code's per-project memory cache |

Lifecycle:

- `session_start` — vault note → both local mirrors (auto-creates the vault note from a template on first visit).
- `tool_result` — when a memory-writing tool (`memory_learn`, `remember`) runs, the in-tree `MEMORY.md` is pushed back to the vault.
- `session_shutdown` — final flush from the in-tree mirror to the vault.

Every vault write is followed by an atomic `git add -A && git commit` in the vault, so memory edits are versioned alongside the rest of the vault.

#### Runtime requirements

- **Node.js 18+** — the file uses `node:fs`, `node:os`, `node:path`, and `node:child_process`.
- **`@mariozechner/pi-coding-agent`** — the Pi runtime that loads this extension and provides `ExtensionAPI`.
- **Obsidian vault at the expected path** — the file hardcodes `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal`. On the Pi this assumes iCloud Drive (or an equivalent mount) syncs the vault to the device. Adjust the `VAULT` constant if your vault lives elsewhere.
- **`git` on PATH** — the vault directory must already be a git repository for commits to succeed. Commit failures are swallowed silently (`commitVault` catches errors), so a missing repo or git binary degrades cleanly to "no version history" rather than crashing the agent.
- **No environment variables** — paths are derived from `homedir()` and the session `cwd`.

#### How to run

Register the file as an extension with the Pi runtime per Pi's extension docs (typically a `pi.config.ts` or extensions-directory pointer). The runtime calls the default export with its `ExtensionAPI`; this module wires up the three lifecycle handlers above. There is no standalone CLI entry point — running `node obsidian-memory.ts` directly will not do anything useful.

### `guardrails.json`

Static config consumed elsewhere in the repo. Not Pi-specific.
