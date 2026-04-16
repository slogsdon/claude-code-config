---
name: agents-md-generator
description: Use when asked to generate an AGENTS.md (or CLAUDE.md) context file for a multi-language sample repository where multiple languages implement the same core concept.
---

# Skill: agents-md-generator

Produces a concise, integrator-focused AGENTS.md for repos that demonstrate one concept across multiple language implementations.

## Steps

### 1. Explore the repo structure

- List root-level files and directories
- Identify the language implementation folders (e.g. `php/`, `java/`, `dotnet/`)
- Read each language's README if present
- Read the root README

### 2. Extract the core concept

Answer: What is the single thing this repo teaches? Distill to one sentence: *"[verb] [what] using [how]"*.

### 3. Find the critical patterns

Look for:
- Non-obvious SDK/API choices that have consequences if wrong (e.g. using `Verify` vs `Charge`)
- Flags or parameters that are required but easy to miss
- Behaviors that activate automatically (e.g. mock mode)
- Files that are canonical reference implementations

For each pattern, capture the *why* — especially if getting it wrong has a real cost (penalty, security issue, data loss). This is the highest-value content in the file.

### 4. Map the files

For each language, identify:
- The core utility/helper file (canonical implementation)
- The endpoint/controller files
- The storage layer
- The mock/test helpers
- The frontend entry point (if present)

Note specific line ranges for the most important methods (SDK config, core pattern implementation).

### 5. Extract the API surface

List all REST endpoints with method, path, and one-line purpose. All languages should expose identical endpoints — confirm this or note divergence.

### 6. Capture environment and config

- Required environment variables and their purpose
- Config file names (`.env.sample`, `appsettings.json`, etc.)
- Default behavior when config is absent

### 7. Find test credentials

- Test card numbers, API keys, or credentials needed for sandbox testing
- Where to get real credentials (developer portal link)

### 8. Check for direct API calls

If implementations make direct HTTP calls to an external API (rather than using an SDK), capture the request shape:
- Endpoint URL
- Required headers (especially auth headers — format, prefix, casing)
- Key body fields, particularly any with non-obvious values (e.g. numeric ISO codes instead of alpha codes)

Include this as a "## API Request Shape" section only if the request structure is non-obvious and getting it wrong would cause silent failures or hard-to-debug errors. Skip it for SDK-based repos where the library handles the wire format.

### 9. Note the architecture flow

Two or three bullet flows max:
- How data flows in (e.g. frontend → token → backend → SDK → stored)
- How payments/actions flow out

### 9. Identify security/production warnings

For demo repos: note what is NOT production-ready and why (no auth, no encryption, simplified storage, etc.).

### 10. Write the AGENTS.md

Use this structure, targeting 80–120 lines:

```markdown
# [Project Name]

> [One-sentence summary: verb + what + how + languages]

## Critical Patterns

[2–4 numbered items. Each: bold rule, then plain-language explanation of the WHY.
Tone: informational, written for someone integrating this — not a maintainer warning.]

## Repository Structure

### [Language] ([framework/runtime])
- [`path/to/File.ext`](path/to/File.ext) — [role, line refs for key methods if useful]
...

[Repeat per language]

### Shared
- [config files, docker-compose, etc.]

## API Surface

| Method | Path | Purpose |
|--------|------|---------|
...

## Environment Variables

```bash
VAR_NAME=value   # explanation
```

## [Test Cards / Sandbox Credentials] (if applicable)

| [Column] | [Column] | [Column] |
...

## API Request Shape (if applicable — direct API calls only)

- `field.name` — [what it is, why the value is non-obvious]
...

## Architecture Summary

**[Flow name]:** [step → step → step]
**[Flow name]:** [step → step → step]

## Security Notes

[1–3 sentences on what demo code omits for production.]

## SDK Versions

- [Language]: `package-name` vX.Y+
...
```

## Output Rules

- **Tone:** Written for a developer integrating this, not a maintainer guarding it. "The X file is the reference implementation — start there if adapting" not "CANONICAL — modify with caution."
- **No code blocks:** Line-number refs to actual source files instead of reproducing code.
- **No redundant content:** Anything derivable by reading the repo files (imports, full dependency lists) belongs in the repo, not here.
- **Front-load the non-obvious:** The Critical Patterns section is the reason this file exists. If a developer could figure it out from reading the README, it doesn't belong in Critical Patterns.
