---
name: arch-review
description: Use this skill when you need comprehensive architecture review and assessment for software projects. Examples include evaluating scalability and performance bottlenecks; assessing maintainability and code organization; reviewing security architecture and design patterns; analyzing technology stack choices and integration patterns; identifying technical debt and refactoring opportunities; providing strategic recommendations for architectural evolution across any technology stack.
---
Conduct comprehensive architecture reviews for software projects across any technology stack with focus on scalability, maintainability, performance, security, and long-term evolution.

## Review Process

### 1. Project Context Analysis
Before conducting the review, gather context:
- Read existing CLAUDE.md or project documentation for project-specific patterns
- Analyze package.json, composer.json, requirements.txt, go.mod, Cargo.toml, or similar for tech stack
- Review project structure, directory organization, and existing conventions
- Identify primary language(s), frameworks, and architectural patterns in use
- Understand deployment model (cloud, on-premise, hybrid, serverless)

### 2. Architecture Assessment Framework

**Scalability Analysis**:
- Horizontal vs vertical scaling capabilities
- Database scaling strategies (sharding, replication, partitioning)
- Caching layers and strategies (CDN, application cache, database cache)
- Load balancing and distributed system patterns
- Message queues and asynchronous processing
- Microservices vs monolith considerations
- Resource utilization and capacity planning

**Maintainability Evaluation**:
- Code organization and module boundaries
- Separation of concerns (layered architecture, clean architecture)
- Dependency management and coupling analysis
- SOLID principles adherence
- Design patterns usage and appropriateness
- Configuration management strategy
- Documentation quality and completeness
- Onboarding complexity for new developers

**Performance Assessment**:
- Identified bottlenecks (CPU, memory, I/O, network)
- Database query optimization opportunities
- N+1 query problems and eager loading strategies
- API response times and latency issues
- Asset optimization (bundling, compression, lazy loading)
- Memory leaks and resource management
- Concurrent processing and parallelization opportunities
- Algorithmic complexity issues (Big O analysis)

**Security Architecture**:
- Authentication and authorization architecture
- Data encryption at rest and in transit
- Secrets management and credential storage
- API security (rate limiting, input validation, CORS)
- Network security and firewall rules
- Dependency vulnerabilities and update policies
- Logging and monitoring for security events
- Compliance requirements (GDPR, HIPAA, SOC2, PCI-DSS)

**Testability Review**:
- Test coverage and quality
- Dependency injection and inversion of control
- Testable architecture patterns
- Mock/stub capabilities
- Integration test strategies
- End-to-end test coverage
- CI/CD pipeline integration

### 3. Technology Stack Evaluation

**Framework and Library Choices**:
- Version currency (are dependencies up to date?)
- Community support and maintenance status
- Performance characteristics
- Security track record
- Migration path complexity
- Team expertise and learning curve
- Licensing considerations

**Infrastructure Analysis**:
- Deployment architecture (containers, VMs, serverless)
- Orchestration strategy (Kubernetes, Docker Swarm, ECS)
- Database choices and data modeling
- Caching strategies (Redis, Memcached, in-memory)
- Message brokers (RabbitMQ, Kafka, SQS)
- Observability stack (logging, metrics, tracing)

**Integration Patterns**:
- API design patterns (REST, GraphQL, gRPC)
- Event-driven architecture
- Service mesh considerations
- Third-party integrations
- Webhook and callback handling
- Circuit breakers and retry logic
- API versioning strategy

### 4. Risk Assessment

Evaluate and categorize risks:
- 🔴 **Critical**: Major architectural flaws, security vulnerabilities, scalability blockers
- 🟡 **Important**: Performance issues, maintainability concerns, technical debt
- 🟢 **Minor**: Optimization opportunities, documentation gaps, minor improvements

For each risk provide:
- Clear description of the architectural issue
- Impact on business objectives (performance, cost, security, velocity)
- Likelihood of issues manifesting (high/medium/low)
- Mitigation strategies with effort estimates

## Recommendations Structure

### Immediate Improvements (Low Effort, High Impact)
Quick wins that can be implemented within 1-2 weeks:
- Configuration optimizations
- Simple refactoring opportunities
- Documentation updates
- Tool or library upgrades
- Performance quick fixes

### Medium-term Refactoring (1-3 months)
Moderate effort improvements:
- Introduce caching layers
- Refactor critical modules
- Improve test coverage
- Implement monitoring and observability
- Database optimization
- API redesign or versioning

### Long-term Architectural Evolution (3-12 months)
Strategic initiatives:
- Migration to microservices (if warranted)
- Infrastructure modernization
- Technology stack upgrades
- Scalability improvements
- Security hardening programs
- Technical debt reduction programs

### Risk Mitigation Strategies
For each identified risk:
- Specific mitigation approach
- Resource requirements (time, people, budget)
- Dependencies and prerequisites
- Success criteria and validation methods
- Rollback plans

## Technology-Specific Considerations

**Frontend (JavaScript/TypeScript, React, Vue, Angular)**:
- Component architecture and reusability
- State management patterns (Redux, MobX, Zustand)
- Build optimization (code splitting, tree shaking)
- Accessibility (WCAG compliance)
- SEO considerations
- Progressive Web App capabilities

**Backend (Node.js, Python, PHP, Java, Go, Ruby, .NET)**:
- API design and versioning
- ORM usage and query optimization
- Middleware and request processing pipelines
- Background job processing
- Session management
- Error handling and logging

**Mobile (iOS, Android, React Native, Flutter)**:
- Offline-first architecture
- Data synchronization strategies
- Battery and memory optimization
- Platform-specific best practices
- App size optimization

**DevOps & Infrastructure**:
- IaC (Infrastructure as Code) maturity
- CI/CD pipeline efficiency
- Deployment strategies (blue-green, canary, rolling)
- Disaster recovery and backup strategies
- Cost optimization opportunities
- Monitoring and alerting coverage

## Output Format

Structure the architecture review as follows:

```markdown
# Architecture Review: [Project Name]

## Executive Summary
[2-3 paragraph overview of findings and key recommendations]

## Current Architecture Overview
[High-level description of existing architecture]

## Assessment Findings

### Scalability
[Findings and rating: Excellent/Good/Needs Improvement/Critical]

### Maintainability
[Findings and rating]

### Performance
[Findings and rating]

### Security
[Findings and rating]

### Testability
[Findings and rating]

## Technology Stack Evaluation
[Assessment of current choices]

## Risk Analysis
[Categorized by severity with specific issues]

## Recommendations

### Immediate (0-2 weeks)
- [ ] Recommendation 1 with effort estimate
- [ ] Recommendation 2 with effort estimate

### Medium-term (1-3 months)
- [ ] Recommendation 1 with effort estimate
- [ ] Recommendation 2 with effort estimate

### Long-term (3-12 months)
- [ ] Strategic initiative 1
- [ ] Strategic initiative 2

## Success Metrics
[How to measure improvement]

## Next Steps
[Prioritized action items]
```

## Quality Standards

- Context-aware recommendations that fit the existing technology stack
- Pragmatic balance between ideal architecture and practical constraints
- Clear prioritization with business impact justification
- Specific, actionable recommendations with effort estimates
- Consider team size, expertise, and velocity when recommending changes
- Acknowledge well-architected components and good practices
- Focus on high-ROI improvements aligned with business objectives
