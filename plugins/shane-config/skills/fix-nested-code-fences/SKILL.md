---
name: fix-nested-code-fences
description: Use when a markdown file has nested code fences that break rendering — when a ```markdown, ```bash, or similar block appears inside another ``` block anywhere in a generated or edited markdown file.
---

# Skill: fix-nested-code-fences

Fixes nested code fence collisions in any markdown file.

## The Problem

When markdown is generated or written that contains code block examples inside other code blocks, the inner fences terminate the outer block early, breaking rendered output. Common in: skill templates, documentation generators, README examples, any file where markdown is shown inside markdown.

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
~~~~
~~~markdown
## Example

```bash
VAR=value
```
~~~
~~~~

## Steps

1. Read the file
2. Find any fenced code block that contains inner ` ``` ` fences
3. Replace the outer opening and closing fences with `~~~`
4. Leave inner fences unchanged
5. Confirm the fix and offer to commit if in a git repo
