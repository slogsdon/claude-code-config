# shane-config

Shane's personal Claude plugin — all skills and MCP config from `claude-code-config`, packaged for Cowork.

## Skills

### Vault & Daily Workflow
- **morning** — Start-of-day focus review, surfaces carryovers, writes Today's Focus
- **log** — Lightweight session note, appended to today's daily note
- **eod** — End-of-day audit, diffs focus vs session log, flags deferrals
- **plan-tomorrow** — Proposes tomorrow's focus based on today's EOD audit
- **inbox-process** — Interactive Obsidian inbox triage with routing recommendations
- **meeting** — Processes raw meeting/chat notes into clean structured notes
- **weekly-signals** — Surfaces deferral patterns and flagged items for weekly review
- **weekly-learnings** — Prepares weekly reflection and learning summary
- **backlinks** — Audits and repairs vault backlink structure
- **obsidian** — General-purpose vault access: read, search, create, append notes

### Knowledge Exploration
- **bloom** — Maps branching questions from a topic
- **challenge** — Pressure-tests a belief or steelmans an opposing view
- **compound** — Shows how knowledge has accumulated around a topic
- **connect** — Finds non-obvious connections between vault concepts
- **contradict** — Surfaces contradictions or inconsistencies in thinking
- **drift** — Analyzes gaps between stated intentions and behavior
- **emerge** — Surfaces hidden patterns and implicit ideas in the vault
- **ghost** — Writes in Shane's voice
- **learned** — Transforms vault insights into polished written content
- **level-up** — Assesses skill proficiency and recommends growth actions
- **map** — Audits and maps the knowledge graph structure
- **stranger** — Builds an outside-observer portrait of Shane from the vault
- **trace** — Traces the evolution of an idea over time

### Development & Technical
- **auth** — Secure authentication and authorization systems
- **css-architecture** — Modern CSS architecture and design systems
- **database** — Database design and optimization
- **dependencies** — PHP dependency management and security (Composer)
- **php-project-structure** — PHP project organization with PSR-4 compliance
- **typescript** — Advanced TypeScript configuration and type-safe patterns
- **vanilla-js** — Modern vanilla JavaScript architecture
- **web-standards** — Web standards compliance and progressive enhancement

### Meta & Utility
- **biz-brief** — Business Context Brief before brainstorming/planning
- **compress-prompt** — Token-efficient prompt compression via Qwen
- **factory-check** — Evaluates build-vs-do for automation tasks
- **qwen-executor** — Delegates tasks to local Qwen via LM Studio
- **work** / **work-tracking** — Markdown-based task tracking (TASKS.md)
- **agents-md-generator** — Generates AGENTS.md for multi-language sample repos
- **fix-nested-code-fences** — Repairs nested code fence rendering issues

## MCP Servers

- **lmstudio-agent** — Local Qwen via LM Studio. Requires LM Studio running at `localhost:11434` and the server script at `/Users/shane/Code/claude-code-config/mcp-servers/lmstudio-agent/server.py`.
