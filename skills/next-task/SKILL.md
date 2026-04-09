---
name: next-task
description: Use this skill when you need to complete the next priority task from TASKS.md. This skill reads the task file, coordinates recommended subagents, meets all acceptance criteria, updates progress, and commits changes. Use when the user requests "next task", "work on next item", or wants to progress through a task list systematically.
---
Complete the next priority task from TASKS.md or docs/TASKS.md.

## Process

1. Read TASKS.md (check both project root and docs/ directory)
2. Identify the highest priority pending task (look for priority indicators: 🔴 High, 🟡 Medium, 🟢 Low)
3. Extract all task details:
   - Requirements and success criteria
   - Files that need to be modified
   - Recommended subagents or tools
   - Acceptance criteria
   - Dependencies that must be completed first
4. If the task recommends using specific agents (via slash commands), coordinate those agents to complete the work
5. Execute the task systematically, ensuring all acceptance criteria are met
6. Update TASKS.md with progress:
   - Mark the task as complete (✅ Complete)
   - Update status indicators
   - Add completion notes if relevant
7. Stage the changes and create a commit with the commit message suggested in TASKS.md (or generate an appropriate one)
8. Push changes to origin if requested

Context: $ARGUMENTS
