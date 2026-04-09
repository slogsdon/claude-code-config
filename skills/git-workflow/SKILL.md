---
name: git-workflow
description: Use this skill when you need comprehensive Git workflow management including branching strategies, conflict resolution, release management, and team collaboration optimization. Examples include designing and implementing Git branching strategies (GitFlow, GitHub Flow, GitLab Flow); resolving complex merge conflicts and rebase issues safely; managing release workflows with semantic versioning and changelog generation; optimizing Git history and repository health; implementing pre-commit hooks and Git automation; coordinating team collaboration through standardized Git workflows.
---
Provide Git workflow expertise focused on branching strategies, merge management, conflict resolution, release workflows, and team collaboration.

## Core Git Workflow Domains

**Branching Strategies**: Design and implement appropriate workflows:
- **GitFlow**: Feature/develop/release/hotfix branches for structured releases
- **GitHub Flow**: Simple main + feature branches for continuous deployment
- **GitLab Flow**: Environment branches (production, staging) with feature branches
- **Trunk-Based**: Short-lived branches merged frequently to main

**Merge Management**: Advise on merge strategies:
- Fast-forward merges for linear history
- Merge commits to preserve branch context
- Squash merging for clean history
- Rebase for cleaner commit sequences

**Conflict Resolution**: Guide through complex merge conflicts:
- Analyze conflicting changes and suggest resolution strategies
- Recommend three-way merge approaches
- Advise on when to use rebase vs merge
- Help recover from failed merges or rebases

**Release Management**: Implement version control workflows:
- Semantic versioning (MAJOR.MINOR.PATCH)
- Tag creation and management
- Changelog generation from commit history
- Release branch workflows
- Hotfix procedures

**Repository Health**: Optimize repository maintenance:
- Identify large files and repository bloat
- Cleanup stale branches
- Optimize commit history (interactive rebase)
- Implement commit message standards

**Automation & Hooks**: Set up Git automation:
- Pre-commit hooks (linting, testing, formatting)
- Pre-push hooks (test suites)
- Commit message validation
- Automated changelog generation

## Team Collaboration Standards

**PR Guidelines**: Structure pull requests with:
- Conventional commit titles (feat, fix, docs, etc.)
- Clear description of changes and motivation
- Testing checklist
- Documentation updates
- Breaking change indicators

**Branch Naming**: Use consistent conventions:
- `feature/description` for new features
- `fix/description` for bug fixes
- `chore/description` for maintenance
- `release/version` for release preparation
- `hotfix/description` for production fixes

## Strategy Selection Guide

- **Small Teams (<5)**: GitHub Flow - simple, continuous deployment
- **Medium Teams (5-15)**: GitFlow - structured with release management
- **Large Teams (15+)**: GitLab Flow - environment-based with staging
- **Open Source**: Fork-based workflow with maintainer review

Example pre-commit hook structure:
```bash
#!/bin/sh
# Run tests, linting, and formatting checks
vendor/bin/phpunit --testsuite=unit || exit 1
vendor/bin/php-cs-fixer fix --dry-run || exit 1
composer audit || exit 1
```

Provide specific commands, step-by-step instructions, and recovery strategies when issues arise.
