# Claude Code Configuration

Personal configuration repository for Claude Code with custom agents, coding standards, and development workflows.

## Structure

- **`CLAUDE.md`** - Global coding standards, preferences, and workflow automation
- **`AGENTS.md`** - Agent-facing copy of the same context
- **`.mcp.json`** - MCP server configuration (registered at user scope via `install.sh`)
- **`.claude-plugin/`** - `marketplace.json` and `plugin.json` defining the plugin marketplace
- **`plugins/shane/`** - 8 plugin submodules (each is its own GitHub repo)
- **`mcp-servers/`** - Local MCP server source (currently `lmstudio-agent`)
- **`scripts/`** - Repo utilities (`build-plugin.sh`, `sync-memory.sh`, `gemma4-agent`, `gemma4-bench`)
- **`extensions/`** - Auxiliary configs (`guardrails.json`, `obsidian-memory.ts`)

## MCP Servers

Configured in `.mcp.json` and registered at user scope via `install.sh`:

| Server | Description |
|--------|-------------|
| `lmstudio-agent` | Local LM Studio agent for Qwen model access (`mcp-servers/lmstudio-agent/server.py`) |

The `obsidian` MCP has been removed. Vault access now uses the **obsidian CLI** directly via Bash commands (see below).

## Obsidian CLI

Vault access uses the `obsidian` CLI binary bundled with the Obsidian desktop app:

```
/Applications/Obsidian.app/Contents/MacOS/obsidian-cli
```

The `install.sh` script creates a symlink at `/opt/homebrew/bin/obsidian` for PATH access. Requires the Obsidian desktop app to be installed first:

```bash
brew install --cask obsidian
```

## Key Features

- **Automated Workflows** - Proactive commit suggestions, task breakdown, and quality checks
- **Specialized Agents** - Domain-specific agents for PHP, security, architecture, and more
  > Roadmap: not yet implemented. Tracked as a future direction; today the repo provides skills, not bespoke agents.
- **Coding Standards** - TypeScript, PHP 8.2+, PSR-12, conventional commits
- **Quality Gates** - Automated testing, linting, security scanning, and code review
  > Roadmap: not yet implemented. Aspirational — no enforced gates ship with this config today.

## Usage

This repository automatically configures Claude Code with:
- Custom coding preferences and patterns
- Automated agent triggering based on context
- Task management and progress tracking
- Proactive commit workflow with conventional messages

## Cowork Plugin

This repo doubles as a **Cowork plugin source** (`personal-skills`). It serves two roles simultaneously:

- **Claude Code config** — `~/.claude` symlinks here, making all settings, skills, and MCP configs available in every Claude Code session.
- **Cowork plugin** — the `.claude-plugin/plugin.json` manifest registers this repo as the `personal-skills` plugin, making its skills available to any Cowork-enabled session that installs it.

Skills live in plugin directories under `plugins/shane/<plugin>/skills/<skill>/`. The monolithic `shane-config` plugin has been decomposed into 8 focused plugins (1 private, 7 public) registered in `.claude-plugin/marketplace.json` — 75 skills total:

- `plugins/shane/skills-design/` — design system + 22 artifact generators + PNG export utility (23 skills)
- `plugins/shane/skills-vault-knowledge/` — Obsidian access + 21 knowledge-work skills (22 skills)
- `plugins/shane/skills-engineering-reference/` — TypeScript, vanilla JS, CSS, PHP, web standards, database, dependencies, auth (8 skills)
- `plugins/shane/skills-workflows/` — 5 `workflow-*` orchestrators + `publish-post`, `agents-md-generator`, `work-tracking` (8 skills)
- `plugins/shane/skills-vault-rituals/` — `morning`, `eod`, `plan-tomorrow`, `log`, `inbox-process` (5 skills)
- `plugins/shane/skills-audit-business/` — commercial-grade audit + business-brief skills (5 skills, **PRIVATE**)
- `plugins/shane/skills-meta-utils/` — `compress-prompt`, `qwen-executor` (2 skills)
- `plugins/shane/skills-writing/` — `humanize`, `ms-style-pass` (2 skills)

A deprecated `shane-config` source plugin remains in the marketplace for one release cycle to give existing installs time to migrate.

MCP servers are defined in `.mcp.json` and auto-registered via `install.sh`.

Each plugin submodule is independently MIT-licensed (see each plugin's `LICENSE`). The root repo is MIT-licensed via [`LICENSE.md`](LICENSE.md).