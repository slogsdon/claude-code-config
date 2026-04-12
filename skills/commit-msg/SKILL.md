---
name: commit-msg
description: Use this skill when you need to analyze code changes and generate conventional commit messages. Examples include generating commit messages from git diffs; analyzing staged changes to determine appropriate commit types and scopes; creating meaningful commit descriptions that explain the 'why' behind changes; suggesting logical commit boundaries for atomic changes; ensuring commit messages follow conventional commit standards for clean git history.
model: haiku
---
Analyze code changes and generate conventional commit messages.

Analyze git diffs to understand change scope and impact, then generate a single-line commit message following the conventional commit format. Categorize changes accurately and write a clear description focusing on "why" rather than "what". Suggest logical commit boundaries for atomic changes when needed.

Conventional commit format — ONE LINE ONLY:
```
<type>[optional scope]: <description>
```

**No body. No footer. No multi-line messages. No "Co-Authored-By". Never reference Claude.**

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
- Keep description under 72 characters
- One line only — never add a body or footer

Examples:
```
feat(auth): add OAuth2 login integration
```
```
fix: prevent race condition in user session handling
```
```
refactor: collapse CLAUDE.md to essentials
```

Provide the primary commit message and include alternative options if multiple valid approaches exist. Suggest splitting commits if changes span multiple concerns.