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

Configured in `mcp.json` (mirrors `~/Library/Application Support/Claude/claude_desktop_config.json`):

| Server | Package | Description |
|--------|---------|-------------|
| `obsidian` | `mcp-obsidian` | Access to Obsidian vault at `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal` |

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

Skills in `skills/` are available in both environments without duplication. MCP servers are defined in `.mcp.json` and auto-registered via `install.sh`.