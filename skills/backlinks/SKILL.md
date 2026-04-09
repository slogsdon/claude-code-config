---
name: backlinks
description: Use when auditing and repairing missing links in the vault's knowledge graph, or when /backlinks is invoked.
---

# Skill: /backlinks [cluster]

- Step 1: Search vault for notes in [cluster]. If no argument, full vault scan.
- Step 2: For each note: identify mentions of other vault concepts that aren't formally linked with `[[wiki links]]`
- Step 3: Find notes that SHOULD reference each other based on content but don't
- Step 4: Generate a list of specific link additions — format: "In `[[Note Name]]`, add `[[Target Note]]` after [quote from note]"
- Output: Actionable link additions in copy-paste format. Run /map afterward to verify improvement.
