# Description Rewrite Log — 2026-05-08

| Skill | Before TC | After TC | Rationale |
|:--|---:|---:|:--|
| `agents-md-generator` | 2 | 4 | Replaced niche multi-language case with the universal "set up CLAUDE.md" situation; added quoted trigger phrases. |
| `vault-index` | 2 | 4 | Added conversational triggers ("what's in my vault", "vault overview") and the post-batch trigger. |
| `meeting` | 2 | 4 | Replaced jargon with conversational triggers ("process this meeting", "extract action items"); added inline-content path. |
| `connect` | 2 | 4 | Added situational triggers ("what does X have to do with Y") and disambiguation from /backlinks and /emerge. |
| `learned` | 2 | 4 | Named the output formats; added "write this up" / "turn this into a post" triggers; disambiguated from /log and /ghost. |
| `drift` | 2 | 5 | Added accountability-language triggers ("am I doing what I said I would", "am I avoiding something") + named the input files. |
| `level-up` | 2 | 4 | Added growth-question triggers and named that it's vault-grounded vs generic curriculum advice. |
| `stranger` | 2 | 5 | Named the unique angle (external/observer) + added the personal-brand-bio trigger. |
| `typescript` | 2 | 4 | Replaced "Use this skill when you need" feature list with situational triggers ("set up TypeScript", "migrate this JS to TS"). |
| `vanilla-js` | 2 | 4 | Same pattern — added "no framework" / "plain JS" / "I don't want React for this" triggers. |
| `css-architecture` | 2 | 4 | Added "set up the CSS for this", "no Tailwind", "vanilla CSS only" triggers. |
| `database` | 2 | 4 | Added "design the schema for X", "this query is slow" triggers; named the engines covered. |
| `php-project-structure` | 2 | 4 | Added "structure this PHP project", "where should this class go"; disambiguated from framework scaffolding. |
| `web-standards` | 2 | 4 | Added a11y triggers ("make this accessible", "fix the a11y") + the review-before-ship trigger. |
| `auth` | 2 | 4 | Added "add login", "is this auth secure", "session vs token" triggers + refusal note. |
| `dependencies` | 2 | 4 | Added composer-specific triggers ("audit this composer.json", "find vulns") + npm/pip/cargo carve-out. |
| `work-tracking` | 2 | 4 | Merged `work` (duplicate) into `work-tracking`; deleted `work/`; rewrote description to cover combined scope. |
| `factory-check` | 3 | 4 | Added "let me write a script for this" / "I should automate this" triggers; named the failure mode (infrastructure cosplay). |
| `biz-brief` | 4 | 4 | Sharpened the "let's build X" trigger; named the carve-out (internal tooling skips it). |

## Summary (post-rewrite)

- 19 skills rewritten (1 deletion: `work` → merged into `work-tracking`)
- Average trigger-clarity score on rewritten skills: 4.11 / 5 (up from 2.0 baseline)
- All 19 rewritten skills now score TC ≥ 4
- Average composite quality on rewritten skills: 3.48 (was clustered at ~2.5–3.0 baseline)
- Lagging metric to watch: auto-trigger rate over the next 4 weeks of session transcripts.
- Total inventory: 125 unique skills (custom 71 + plugin 54). `work` deletion will reduce to 124 once the merge propagates from worktree to main.

## Caveat

The `skill-audit/scripts` live in the main repo, not the worktree, so the verification commands ran with explicit `/Users/shane/Code/claude-code-config/skills/skill-audit/scripts` paths. When the worktree merges back to main, this asymmetry resolves.
