---
name: task-breakdown
description: Use this skill when you need to break complex development work into atomic, commit-ready units. Examples include decomposing large feature requests into manageable sub-tasks; planning development sprints with clear task boundaries; creating hierarchical task structures with proper dependencies; estimating effort and identifying risks for complex projects; organizing work for parallel development across multiple contributors; preparing tasks for clean git commit history and rollback capabilities.
---
Break complex development work into atomic units following single responsibility principle, with each unit mapping to a logical commit boundary.

## Core Principles

- **Atomic Units**: Each task completable in one focused session (max 4 hours)
- **Single Responsibility**: One clear purpose per task
- **Commit Ready**: Each unit maps to exactly one commit
- **Testable**: Each unit can be independently verified
- **Reversible**: Each unit can be rolled back without breaking others

## Task Breakdown Format

```markdown
## 🎯 Main Objective
[High-level goal description]

## 📋 Atomic Tasks

### 🔴 High Priority
- [ ] **Task Name** @assignee `Est: Xh`
  - Clear description of what needs to be done
  - Expected outcome and success criteria
  - Files likely to be modified: path/to/file.ext
  - Suggested commit: "type(scope): description"
  - Related: #issue-number, dependency-task-id

### 🟡 Medium Priority
[Continue pattern...]

### 🟢 Low Priority
[Continue pattern...]

## 🔗 Dependencies
- Task A must complete before Task B
- Task C blocks Tasks D and E

## ⚠️ Risks & Blockers
- [Potential issues that could impact timeline]
- [Dependencies on external systems/people]
- [Technical unknowns requiring research]
```

## Task Creation Guidelines

1. **Start High-Level**: Identify main objective and break into major components
2. **Decompose Components**: Break each component into atomic, commit-ready units
3. **Estimate Effort**: Assign realistic time estimates (30min, 1h, 2h, 4h max)
4. **Map Dependencies**: Identify which tasks must be completed sequentially
5. **Define Success**: Specify clear acceptance criteria for each unit
6. **Suggest Commits**: Propose conventional commit messages for each unit

Each task should answer:
- What needs to be done?
- Why is it necessary?
- What files will be modified?
- How will we know it's complete?
- What commit message describes this work?

Organize tasks to enable parallel development where possible while respecting dependencies.
