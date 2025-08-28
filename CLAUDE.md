# Global Claude Code Configuration

## My Coding Standards & Preferences
- **Language Style**: Prefer TypeScript over JavaScript, PHP 8.2+
- **Code Style**: 
  - Use ESLint + Prettier for JS/TS projects
  - Follow PSR-12 for PHP
  - 2-space indentation for web, 4-space for PHP
  - Prefer functional programming patterns
  - Use meaningful variable names, avoid abbreviations

## Integration Preferences
- **Version Control**: Git with conventional commits
- **Testing**: Jest for JS/TS, PHPUnit for PHP, prefer TDD approach
- **CI/CD**: GitHub Actions preferred, include security scanning
- **Documentation**: README-driven development, inline JSDoc/PHPDoc comments
- **Package Management**: npm/yarn for JS/TS, Composer for PHP

## Templates & Patterns
- **API Design**: RESTful with OpenAPI specs
- **Error Handling**: Consistent error response formats
- **Logging**: Structured logging with appropriate levels
- **Security**: OWASP guidelines, dependency scanning, secrets management

## Workflow Preferences
- **Code Reviews**: Focus on architecture, security, performance
- **Commits**: Small, atomic commits with clear messages
- **Work Breakdown**: Break tasks into smallest possible units, each targeting single responsibility
- **Commit Mapping**: Each completed atomic unit should trigger a commit suggestion
- **Branches**: feature/fix/chore prefixes
- **Documentation**: Update docs with code changes

## Instructions for Claude
- Always check for existing project conventions first (look for CLAUDE.md, package.json, composer.json)
- Adapt recommendations to match project's existing patterns
- Suggest improvements that align with modern best practices
- When creating new files, follow the project's existing structure
- Include relevant tests and documentation for new features
- **Proactive Commit Suggestions**: After completing any atomic work unit, automatically suggest a commit with pre-drafted message
- **Commit Timing**: Suggest commits immediately upon task completion, don't wait for explicit requests
- **Pre-staging**: Automatically identify and stage relevant files before presenting commit suggestion
- **Conventional Messages**: Always prepare commit messages following conventional commit format

## Agent Utilization Guidelines
- Use specialized agents for complex, multi-step tasks requiring domain expertise
- Delegate research tasks to general-purpose agents when searching across large codebases
- Leverage agents for code review, security analysis, and optimization tasks
- Run agents concurrently when possible to maximize efficiency
- Provide detailed, specific prompts to agents for optimal results

### Custom Agents Available

#### Core Development Agents
- **php-code-reviewer**: Comprehensive PHP code review focusing on PSR-12 compliance, security vulnerabilities, performance optimizations, and maintainability
  - *Auto-trigger when*: PHP files are modified, before commits, when performance issues mentioned
  - *Capabilities*: Security scanning, standards compliance, performance analysis, test coverage validation

- **atomic-task-breaker**: Decomposes complex development work into atomic, commit-ready units with clear dependencies
  - *Auto-trigger when*: User describes large features, epic stories, or multi-step implementations
  - *Capabilities*: Task decomposition, dependency mapping, effort estimation, parallel work identification

- **commit-message-craft**: Analyzes code changes and generates perfect conventional commit messages
  - *Auto-trigger when*: Code changes are ready for commit, git diff analysis needed
  - *Capabilities*: Git diff analysis, conventional commit formatting, change categorization

- **work-tracker**: Maintains comprehensive markdown task lists for AI-human collaboration projects
  - *Auto-trigger when*: Multiple tasks mentioned, project coordination needed, progress tracking required
  - *Capabilities*: TASKS.md creation, status tracking, dependency management, progress reporting

#### Architecture & Planning Agents
- **product-requirements-architect**: Creates comprehensive Product Requirements Documents (PRDs) that guide development teams
  - *Auto-trigger when*: Starting new feature development cycles, stakeholder requests for formal documentation, sprint planning preparation
  - *Capabilities*: PRD creation, scope definition, business requirements documentation, technical specifications, stakeholder coordination

- **feature-planner**: Creates comprehensive feature planning and requirements analysis
  - *Auto-trigger when*: New features requested, requirements gathering needed, user stories mentioned
  - *Capabilities*: Requirements analysis, user story breakdown, acceptance criteria, technical specifications

- **project-organizer**: PHP project organization and architecture planning with PSR-4 compliance focus
  - *Auto-trigger when*: New projects started, directory structure questions, namespace organization needed
  - *Capabilities*: PSR-4 autoloading, directory structures, architectural patterns, coding standards

- **api-designer**: Comprehensive RESTful API design and implementation guidance
  - *Auto-trigger when*: API endpoints mentioned, REST architecture needed, authentication systems required
  - *Capabilities*: OpenAPI specs, REST design, authentication flows, API documentation, versioning strategies

- **database-architect**: Comprehensive database design and optimization expertise
  - *Auto-trigger when*: Database schema questions, performance issues, migration needs mentioned
  - *Capabilities*: Schema design, query optimization, indexing strategies, data scaling, migrations

#### Quality & Security Agents
- **test-architect**: Comprehensive PHP testing strategies and PHPUnit expertise
  - *Auto-trigger when*: Testing mentioned, TDD workflows needed, test coverage analysis required
  - *Capabilities*: Test architecture design, PHPUnit implementations, coverage analysis, TDD workflows

- **security-auditor**: Comprehensive security auditing and OWASP compliance verification
  - *Auto-trigger when*: Security concerns raised, authentication implemented, data handling questions
  - *Capabilities*: Vulnerability assessment, OWASP compliance, dependency scanning, privacy compliance

- **performance-optimizer**: PHP application performance optimization, database tuning, caching strategies
  - *Auto-trigger when*: Performance issues mentioned, slow queries, scalability concerns raised
  - *Capabilities*: Performance profiling, database optimization, caching implementation, scalability analysis

- **dependency-manager**: PHP dependency management and security expertise with Composer
  - *Auto-trigger when*: Package updates needed, security vulnerabilities found, dependency conflicts arise
  - *Capabilities*: Security audits, version conflicts resolution, license compliance, automated workflows

#### Specialized Development Agents
- **refactor-specialist**: Systematic code refactoring focused on SOLID principles and design patterns
  - *Auto-trigger when*: Code smells mentioned, SOLID violations found, legacy code improvements needed
  - *Capabilities*: SOLID analysis, design pattern implementation, technical debt reduction, incremental refactoring

- **documentation-writer**: Comprehensive technical documentation for PHP projects
  - *Auto-trigger when*: Documentation requests made, API changes implemented, developer guides needed
  - *Capabilities*: PHPDoc generation, README creation, API documentation, troubleshooting guides

- **git-workflow-manager**: Comprehensive Git workflow management including branching and release management
  - *Auto-trigger when*: Git conflicts arise, branching strategy questions, release management needed
  - *Capabilities*: Branching strategies, conflict resolution, release workflows, Git automation

- **auth-specialist**: Secure authentication and authorization systems implementation
  - *Auto-trigger when*: Authentication mentioned, user management needed, security systems required
  - *Capabilities*: OAuth2/OpenID Connect, JWT implementation, RBAC systems, MFA, session management

#### Frontend & Modern Web Agents
- **vanilla-js-architect**: Modern vanilla JavaScript architecture without framework dependencies
  - *Auto-trigger when*: Vanilla JS projects, Web Components needed, framework-free development mentioned
  - *Capabilities*: ES6 architecture, Web Components, DOM patterns, progressive enhancement

- **typescript-specialist**: Advanced TypeScript configuration and type-safe development patterns
  - *Auto-trigger when*: TypeScript projects, type safety issues, advanced typing patterns needed
  - *Capabilities*: TypeScript configuration, advanced generics, type-safe APIs, build optimization

- **css-craftsperson**: Modern CSS architecture and design systems without heavy frameworks
  - *Auto-trigger when*: CSS architecture questions, design systems needed, responsive layout issues
  - *Capabilities*: CSS Grid/Flexbox, BEM methodology, design tokens, accessibility, performance

- **web-standards-expert**: Comprehensive web standards compliance and progressive enhancement
  - *Auto-trigger when*: Web standards questions, accessibility requirements, cross-browser compatibility needed
  - *Capabilities*: Semantic HTML, Web APIs, progressive enhancement, WCAG compliance, performance optimization

### Agent Usage Patterns

#### Automatic Agent Triggering
- **Context Analysis**: Continuously analyze user requests and code context to identify when specialized agents should be automatically invoked
- **Multi-Agent Workflows**: Run multiple agents concurrently when tasks span multiple domains (e.g., security + performance + documentation)
- **Proactive Engagement**: Agents should be used proactively based on trigger conditions, not just when explicitly requested
- **Cascade Triggering**: One agent's completion may trigger another (e.g., feature-planner → api-designer → security-auditor)

#### Standard Development Workflows
- **Feature Development**: `atomic-task-breaker` → `feature-planner` → `work-tracker` → specialized agents → `php-code-reviewer` → `commit-message-craft`
- **Bug Fixes**: `performance-optimizer` or `security-auditor` (if relevant) → `test-architect` → `php-code-reviewer` → `commit-message-craft`
- **Refactoring**: `refactor-specialist` → `test-architect` → `php-code-reviewer` → `commit-message-craft`
- **API Development**: `api-designer` → `auth-specialist` → `security-auditor` → `documentation-writer`
- **Database Work**: `database-architect` → `performance-optimizer` → `test-architect`

#### Quality Assurance Patterns
- **Pre-Commit**: Always run `php-code-reviewer` for PHP changes, `security-auditor` for auth/data handling
- **Post-Implementation**: `test-architect` for coverage validation, `documentation-writer` for public APIs
- **Performance Critical**: `performance-optimizer` for database queries, caching, scalability concerns
- **Security Sensitive**: `security-auditor` + `auth-specialist` for authentication, data handling, external integrations

### Automatic Agent Selection Criteria

#### Keyword-Based Triggers
- **"requirements", "prd", "product requirements", "stakeholder", "specification"** → `product-requirements-architect`
- **"authentication", "login", "auth", "oauth", "jwt", "session"** → `auth-specialist`
- **"security", "vulnerability", "owasp", "xss", "sql injection"** → `security-auditor`
- **"performance", "slow", "optimize", "cache", "scale"** → `performance-optimizer`
- **"database", "schema", "migration", "query", "index"** → `database-architect`
- **"test", "testing", "phpunit", "tdd", "coverage"** → `test-architect`
- **"api", "endpoint", "rest", "openapi", "swagger"** → `api-designer`
- **"refactor", "solid", "clean code", "design pattern"** → `refactor-specialist`
- **"documentation", "phpdoc", "readme", "guide"** → `documentation-writer`
- **"git", "branch", "merge", "conflict", "release"** → `git-workflow-manager`
- **"composer", "dependency", "package", "update"** → `dependency-manager`

#### Context-Based Triggers
- **Large/Complex Requests** → `atomic-task-breaker` first, then `work-tracker`
- **Multiple PHP Files Modified** → `php-code-reviewer` automatically
- **Pre-Commit State** → `php-code-reviewer` + `commit-message-craft`
- **New Project/Directory Structure** → `project-organizer`
- **Feature Requests** → `feature-planner` → domain-specific agents
- **TypeScript/JavaScript Projects** → `typescript-specialist` or `vanilla-js-architect`
- **CSS/Styling Issues** → `css-craftsperson`
- **Web Standards/Accessibility** → `web-standards-expert`

### Development Workflow Integration

#### Project Lifecycle Phases
- **Initialization**: `project-organizer` → `feature-planner` → `database-architect` (if data involved)
- **Planning**: `atomic-task-breaker` → `work-tracker` → `api-designer` (if APIs involved)
- **Development**: domain agents → `test-architect` → `php-code-reviewer`
- **Security Review**: `auth-specialist` + `security-auditor` (for auth/data features)
- **Quality Assurance**: `performance-optimizer` → `dependency-manager`
- **Documentation**: `documentation-writer` (for public APIs/complex logic)
- **Release**: `git-workflow-manager` → `commit-message-craft`

#### Agent Coordination Principles
- **Shared Context**: All agents access TASKS.md and project documentation for coordination
- **Single Responsibility**: Each agent focuses on their domain expertise with clear handoff points
- **Concurrent Execution**: Run multiple agents simultaneously when domains don't conflict
- **Progressive Enhancement**: Each agent builds upon previous agents' outputs
- **Validation Chains**: Later agents validate earlier agents' recommendations
- **Holistic Assessment**: Combine multiple agent outputs for comprehensive project evaluation

## Work Tracking & Collaboration
- Use markdown task lists (`- [ ]` / `- [x]`) to track work items in project files
- Create `TASKS.md` files for ongoing project work coordination
- Include priority levels: `🔴 High`, `🟡 Medium`, `🟢 Low`
- Add assignee notation: `@claude`, `@human`, `@team`
- Use status indicators: `📋 Planning`, `⚡ In Progress`, `✅ Complete`, `🚫 Blocked`
- Link related issues/PRs: `Related: #123, PR #456`
- Include estimated effort: `Est: 2h`, `Est: 1d`
- Break large tasks into sub-tasks with proper indentation
- Update task status in real-time during collaborative sessions
- Archive completed tasks to maintain clean active task lists

## Automated Commit Workflow
- **Commit Readiness Criteria**: 
  - Feature/fix is functionally complete
  - Tests pass (if applicable)
  - Code follows project style guidelines
  - No TODO/FIXME comments remain
  - Documentation is updated
- **Auto-Suggest Commits**: Proactively offer commit creation when readiness criteria are met
- **Commit Boundaries**: Align commits with completed atomic work units
- **Pre-drafted Messages**: Prepare conventional commit messages for user approval
- **Safety Requirement**: All commits require explicit user approval before execution

## Systematic Commit Process
- **Completion Detection**: Monitor task completion status and suggest commits
- **Status Check Automation**: Run git status, tests, and linting before suggesting commits
- **Message Templates**: Use conventional commits format (feat:, fix:, docs:, refactor:, test:, chore:)
- **Staging Strategy**: Automatically stage relevant files for review
- **Review Workflow**: Present complete diff and commit message for approval
- **Rollback Planning**: Document how to revert changes if needed

## Work Unit to Commit Boundaries
- **Single Feature Implementation**: One complete feature = one commit
- **Bug Fix Completion**: Each resolved issue = one commit  
- **Refactor Units**: Each self-contained refactor = one commit
- **Test Suite Additions**: New test coverage = one commit
- **Documentation Updates**: Related doc changes = one commit
- **Configuration Changes**: Related config updates = one commit
- **Dependency Updates**: Package updates = one commit per logical group
- don't refer to claude in commit messages
- always update TASKS.md with progress before making git commits
- always make a git commit after completing a task
- NEVER make a git commit message that references claude