# Claude Configuration

## Behavior
- Treat me as an expert. Be terse, direct, accurate.
- Give the answer first, explain after if needed.
- Suggest solutions I haven't considered — anticipate needs.
- Flag speculation clearly but don't avoid it.
- No moral lectures or unnecessary safety caveats.
- Ask clarifying questions before providing detailed responses.
- Do not provide incorrect or made-up information.
- If you do not have valid information, say so explicitly rather than guessing.
- Cite sources at end, not inline.
- When adjusting code I've provided, show only changed lines + minimal context. Don't repeat my full code back.

## Coding Standards
- TypeScript over JavaScript; PHP 8.2+
- ESLint + Prettier for JS/TS; PSR-12 for PHP
- 2-space indentation for web, 4-space for PHP
- Functional programming patterns preferred
- Meaningful variable names; no abbreviations
- RESTful APIs with OpenAPI specs

## Version Control
- Conventional commits: feat:, fix:, docs:, refactor:, test:, chore:
- Branch prefixes: feature/, fix/, chore/
- Small atomic commits — one logical unit per commit
- Never reference Claude in commit messages
- Suggest commits proactively after each completed work unit
- Always stage and present diff + message for approval before committing

## Project Conventions
- Always check for existing conventions first (CLAUDE.md, package.json, composer.json)
- README-driven development; inline JSDoc/PHPDoc
- Update docs alongside code changes
- Use TASKS.md for multi-task coordination within a session

## Skills
All specialized workflows (code review, PRD writing, architecture review, security audits, etc.) are handled by skills in plugin submodules under `plugins/shane/`. Invoke them when relevant — don't replicate their logic here.

Skills now live at `plugins/shane/<plugin>/skills/<skill>/`:
- `plugins/shane/skills-design/` — design system + artifact generators
- `plugins/shane/skills-vault-knowledge/` — vault knowledge work (obsidian, bloom, connect, etc.)
- `plugins/shane/skills-vault-rituals/` — daily rituals (morning, eod, log)
- `plugins/shane/skills-writing/` — humanize + ms-style-pass
- `plugins/shane/skills-engineering-reference/` — language and standards references
- `plugins/shane/skills-audit-business/` — commercial-grade audit + brief skills (PRIVATE)
- `plugins/shane/skills-workflows/` — pipeline orchestrators
- `plugins/shane/skills-meta-utils/` — compress-prompt, qwen-executor

To add a new skill, add it inside the appropriate plugin directory. Don't create skills at the top-level repo.

## Obsidian / Vault

- **Never** access vault files via Read, Write, Edit, Grep, Glob, or direct bash file paths
- Always use the `obsidian` skill or `obsidian` CLI commands for all vault operations
- After **any** vault write (create, append, or update), commit atomically:
  ```bash
  VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal"
  git -C "$VAULT" add -A && git -C "$VAULT" commit -m "docs: [brief description]"
  ```
- This applies whether the write comes from the obsidian skill, a vault skill, or a fallback path

## Memory

Memory is stored in Obsidian, per-project, and synced to local at session start via a `SessionStart` hook.

- **Source of truth:** `Context/Memory/<project-name>/MEMORY.md` in the vault (e.g., `Context/Memory/claude-code-config/MEMORY.md`)
- **Local cache:** `~/.claude/projects/<project-key>/memory/MEMORY.md` — auto-synced from vault; do not write to it directly
- **Add a memory:** `obsidian append path='Context/Memory/<project>/MEMORY.md' content='...'` then update the Index section
- **Update/delete a memory:** use the Write tool directly on the vault file path (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal/Context/Memory/<project>/MEMORY.md`) — this is an explicit exception to the no-direct-vault-access rule, limited to `Context/Memory/` files only
- After any memory write, commit the vault

## Accountability
At the start of every session, use the obsidian skill to read `Context/accountability` and load current OKRs and known avoidance patterns. Use it to:
- Flag tasks that match known avoidance patterns
- Prioritize work aligned with active OKRs
- Surface items in patterns.md with 3+ deferrals
