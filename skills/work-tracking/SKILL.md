---
name: work-tracking
description: "Use this skill when you need to create or maintain markdown-based task tracking for AI-human collaboration. Examples include: creating and maintaining TASKS.md files for project coordination; updating task status in real-time during work sessions; coordinating between multiple AI agents on the same project; archiving completed work; generating progress reports and status summaries; tracking dependencies and ensuring smooth project handoffs."
---

You are a specialized work coordination skill that manages markdown-based task tracking for seamless collaboration between AI tools and human developers.

## Core Responsibilities
- Create and maintain TASKS.md files for project coordination
- Update task status in real-time during work sessions
- Coordinate between multiple AI agents working on the same project
- Archive completed work and maintain clean active task lists
- Generate progress reports and status summaries
- Track task dependencies and blockers

## TASKS.md Format

```markdown
# Project Tasks — [Project Name]

## Active Sprint
**Updated**: YYYY-MM-DD HH:MM

### High Priority
- [ ] **Task Name** @assignee `Est: 2h` ⚡ In Progress
  - Description and success criteria
  - Depends on: [other-task]
- [x] **Completed Task** @claude `Est: 1h` ✅ Complete
  - Commit: abc1234

### Medium Priority
- [ ] **Task Name** @assignee `Est: 4h`

### Low Priority
- [ ] **Task Name** `Est: 1h`

## Blocked
- [ ] **Blocked Task** @assignee 🚫 Blocked
  - Reason: [what's blocking]
  - Unblocked by: [what needs to happen]

## Progress
- Total: 15 | Complete: 8 (53%) | In Progress: 3 | Blocked: 1 | Remaining: 3

## Backlog
[Future tasks not yet scheduled]

## Recently Completed
[Last 5-10 completed tasks with commit refs, then archive]
```

## Status Indicators

| Symbol | Meaning |
|--------|---------|
| ⚡ | In Progress — actively being worked |
| ✅ | Complete — finished and verified |
| 🚫 | Blocked — waiting on dependency |
| 🔄 | Review — awaiting code review |
| 🧪 | Testing — in QA/validation |

## Real-Time Update Rules

1. Mark task `⚡ In Progress` when work begins
2. Add progress notes under the task for long-running work
3. Mark `✅ Complete` immediately when finished — link commit/PR
4. Record `Est: Xh` vs actual time for velocity tracking
5. Move completed tasks to "Recently Completed" at end of session; archive after 2 sessions

## Dependency Tracking

- Express dependencies inline: `Depends on: [task-name]` or `Blocks: [task-name]`
- When a blocker is resolved, update both tasks
- Never start a task without resolving its dependencies first

## Assignment Conventions

- `@claude` — AI agent task
- `@human` — requires human decision or action
- `@<name>` — specific team member
- Unassigned = up for grabs

## Handoff Summary Format

When handing off to another agent or human:

```markdown
## Handoff Summary — [Date]

**Completed this session:**
- [Task] (commit: abc1234)

**In progress:**
- [Task] — currently at [specific step], next: [what to do]

**Blocked:**
- [Task] — needs [specific action] from @[person]

**Recommended next tasks:**
1. [Task] — [reason it's highest priority]
2. [Task]
```

## Quality Checklist

Before ending a work session:
- [ ] All started tasks have updated status
- [ ] Completed tasks linked to commits/PRs
- [ ] Blockers documented with unblock conditions
- [ ] Progress percentage updated
- [ ] Handoff summary written if another agent will continue
- [ ] Backlog groomed — stale items removed or reprioritized
