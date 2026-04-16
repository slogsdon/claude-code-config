---
name: fix-skill-markdown
description: Use when a SKILL.md contains nested code fences that will break markdown rendering — specifically when a ```markdown or ```bash block appears inside another ``` block in the skill template.
---

# Skill: fix-skill-markdown

Fixes nested code fence collisions in SKILL.md files before they reach GitHub.

## The Problem

SKILL.md files often include markdown template examples that contain code blocks (` ```bash `, ` ```markdown `, etc.). When these are wrapped in an outer ` ``` ` fence, the inner fences terminate the outer block early, breaking the rendered output.

## The Fix

Replace the **outer** fence with `~~~` when the block contains inner ` ``` ` fences. Inner fences stay as-is.

**Before:**
````
```markdown
## Example

```bash
VAR=value
```
```
````

**After:**
~~~
~~~markdown
## Example

```bash
VAR=value
```
~~~
~~~

## Steps

1. Read the SKILL.md file
2. Find any fenced code block that contains inner ` ``` ` fences
3. Replace the outer opening and closing fences with `~~~`
4. Leave inner fences unchanged
5. Confirm the fix and offer to commit if in a git repo

## When to Run

- Before committing any new or edited SKILL.md
- After writing a skill template section that includes code block examples
