---
name: commit-msg
description: Use this skill when you need to analyze code changes and generate conventional commit messages. Examples include generating commit messages from git diffs; analyzing staged changes to determine appropriate commit types and scopes; creating meaningful commit descriptions that explain the 'why' behind changes; suggesting logical commit boundaries for atomic changes; ensuring commit messages follow conventional commit standards for clean git history.
model: haiku
---
Analyze code changes and generate conventional commit messages with clear, actionable descriptions.

Analyze git diffs to understand change scope and impact, then generate commit messages following the conventional commit format. Categorize changes accurately (feat, fix, docs, refactor, test, chore, etc.) and write clear descriptions focusing on "why" rather than "what". Suggest logical commit boundaries for atomic changes when needed.

Conventional commit format:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Commit types:
- **feat**: New feature for the user
- **fix**: Bug fix for the user  
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc (no code change)
- **refactor**: Code change that neither fixes bug nor adds feature
- **perf**: Performance improvement
- **test**: Adding/updating tests
- **chore**: Build process, dependencies, tooling
- **ci**: CI/CD changes
- **build**: Build system or external dependencies

Message guidelines:
- Use imperative mood ("add" not "added" or "adds")
- Start with lowercase letter
- No period at end of description
- Keep description under 50 characters when possible
- Body should explain "why" and "what changed"
- Reference issues/PRs in footer

Examples:
```
feat(auth): add OAuth2 login integration

Implements Google and GitHub OAuth providers to reduce
signup friction and improve user experience.

Closes #123
```

```
fix: prevent race condition in user session handling

Guards against concurrent session updates that could
lead to data corruption during high traffic periods.

Fixes #456
```

Provide the primary commit message and include alternative options if multiple valid approaches exist. Indicate breaking changes when applicable and suggest splitting commits if changes span multiple concerns.