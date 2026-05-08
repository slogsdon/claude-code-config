# Claude Code Configuration

Personal configuration repository for Claude Code with custom agents, coding standards, and development workflows.

## Structure

- **`CLAUDE.md`** - Global coding standards, preferences, and workflow automation
- **`mcp.json`** - MCP server configurations (reference copy mirroring Claude desktop config)
- **`agents/`** - Specialized AI agents for development tasks (PHP, security, testing, etc.)
- **`commands/`** - Custom commands for project management and development workflows
- **`todos/`** - Task tracking and project coordination files
- **`projects/`** - Project-specific session data and history

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
- **Coding Standards** - TypeScript, PHP 8.2+, PSR-12, conventional commits
- **Quality Gates** - Automated testing, linting, security scanning, and code review

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

Skills now live in plugin directories under `plugins/shane/<plugin>/skills/<skill>/`. The monolithic `shane-config` plugin has been decomposed into 8 focused plugins registered in `.claude-plugin/marketplace.json`:

- `plugins/shane/skills-design/` — design system + 23 artifact generators + PNG export
- `plugins/shane/skills-vault-knowledge/` — vault knowledge work (obsidian, bloom, connect, etc.)
- `plugins/shane/skills-vault-rituals/` — daily rituals (morning, eod, log)
- `plugins/shane/skills-writing/` — humanize + ms-style-pass
- `plugins/shane/skills-engineering-reference/` — language and standards references
- `plugins/shane/skills-audit-business/` — commercial-grade audit + brief skills (PRIVATE)
- `plugins/shane/skills-workflows/` — pipeline orchestrators
- `plugins/shane/skills-meta-utils/` — compress-prompt, qwen-executor

MCP servers are defined in `.mcp.json` and auto-registered via `install.sh`.