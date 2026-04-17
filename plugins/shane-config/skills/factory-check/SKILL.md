---
name: factory-check
description: Use when about to build a tool, script, or skill to automate a task instead of doing the task directly — evaluates whether this is high-leverage engineering or infrastructure avoidance.
---

# Skill: factory-check

A quick forcing function for evaluating build-vs-do decisions before going down a tooling path.

## The Pattern

Building a tool first is high-leverage when:
- The task is genuinely repeatable (not a one-off)
- The tool is lightweight (low maintenance overhead)
- You use the tool **immediately** to complete the original task in the same session

It becomes avoidance when:
- The tool is built but the original task is left "pending integration"
- The tool grows complex enough to need its own documentation and upkeep
- The original target quietly shrinks or disappears

> "Build the factory, then immediately use it to produce the goods."

## The Check

Before building, answer three questions:

1. **Is this task repeatable?** If it's a one-off, just do it manually.
2. **Can I ship the tool and use it in the same session?** If not, reconsider scope.
3. **Will the tool stay lightweight?** If it needs its own maintenance, the ROI may flip.

If all three answers are yes — build it. Then use it before the session ends.

## The Verdict Signal

- **Leverage:** Tool shipped + original target met or exceeded in same session
- **Avoidance:** Tool shipped + original task deferred, descoped, or "pending"
