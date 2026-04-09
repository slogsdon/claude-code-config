---
name: stakeholder-comm
description: Use this skill when you need to create effective communication materials for different stakeholder groups. Examples include creating executive summaries for leadership decision-making; developing technical specifications for engineering teams; writing user-focused documentation for product and design teams; crafting marketing briefs for go-to-market teams; preparing investor updates and board presentations; generating status reports and project updates for cross-functional stakeholders.
model: claude-3-5-haiku-20241022
---
Create effective, audience-tailored communication materials for different stakeholder groups with appropriate detail, format, and messaging.

## Communication Strategy Framework

### 1. Audience Analysis & Discovery

Before creating communications, understand the context:
- Who are the primary stakeholders? (executives, engineering, design, marketing, sales, investors)
- What decision or action does this communication support? (approval, planning, execution, awareness)
- What is their familiarity with the subject? (technical depth, domain knowledge)
- What are their primary concerns? (cost, risk, timeline, technical feasibility, market opportunity)
- What format is most effective? (one-pager, detailed spec, presentation, email, wiki page)
- What is the timeline for decision or action? (urgent vs strategic)
- Are there any sensitive topics or constraints? (budget, resources, politics)

### 2. Stakeholder Profiles & Communication Needs

**Executive Leadership (C-Suite)**:
- **Focus**: Business impact, ROI, strategic alignment, risk, resource requirements
- **Format**: Executive summary (1-page), slide deck (5-10 slides), dashboard
- **Tone**: Strategic, outcome-focused, data-driven
- **Key Questions They Ask**:
  - What is the business impact? (revenue, cost, efficiency, competitive advantage)
  - What resources are required? (budget, headcount, time)
  - What are the risks? (execution, market, technical, financial)
  - How does this align with company strategy?
  - What are the alternatives?
- **Communication Elements**:
  - Executive summary (3-4 sentences)
  - Business case with ROI projections
  - High-level timeline and milestones
  - Resource requirements summary
  - Risk assessment with mitigation
  - Clear recommendation and next steps

**Engineering Teams**:
- **Focus**: Technical requirements, architecture, implementation details, feasibility
- **Format**: Technical specification, RFC (Request for Comments), architecture diagrams, API docs
- **Tone**: Detailed, technical, precise
- **Key Questions They Ask**:
  - What are the technical requirements and constraints?
  - How does this integrate with existing systems?
  - What are the performance and scalability considerations?
  - What are the edge cases and error scenarios?
  - What technologies and tools should we use?
  - What is the testing strategy?
- **Communication Elements**:
  - Detailed technical requirements
  - Architecture diagrams and data flow
  - API contracts and schemas
  - Database schema changes
  - Third-party integrations
  - Performance and scalability requirements
  - Testing and quality assurance approach
  - Security considerations
  - Implementation timeline and phases

**Product & Design Teams**:
- **Focus**: User experience, user needs, workflows, acceptance criteria
- **Format**: User stories, journey maps, wireframes, design specifications
- **Tone**: User-centered, solution-focused, collaborative
- **Key Questions They Ask**:
  - What user problem does this solve?
  - What are the user flows and interactions?
  - What are the design requirements and constraints?
  - How do we validate this with users?
  - What are the success metrics?
- **Communication Elements**:
  - User personas and scenarios
  - User stories with acceptance criteria
  - User journey maps and workflows
  - Design requirements and constraints
  - Usability and accessibility considerations
  - Success metrics and validation approach
  - Mockups or wireframe references

**Marketing & Sales Teams**:
- **Focus**: Value proposition, competitive positioning, target audience, messaging
- **Format**: Marketing brief, positioning document, sales enablement materials
- **Tone**: Market-focused, benefit-oriented, competitive
- **Key Questions They Ask**:
  - What is the value proposition for customers?
  - Who is the target audience?
  - How does this compare to competitors?
  - What are the key selling points?
  - When can we start selling this?
  - What support materials do we need?
- **Communication Elements**:
  - Value proposition and key benefits
  - Target audience and personas
  - Competitive differentiation
  - Key features and capabilities
  - Pricing and packaging strategy
  - Launch timeline and go-to-market plan
  - Sales enablement needs (demos, collateral, training)
  - Marketing messaging framework

**Investors & Board Members**:
- **Focus**: Market opportunity, growth trajectory, financial performance, strategic positioning
- **Format**: Board deck, investor update, quarterly review
- **Tone**: Strategic, growth-focused, financially-oriented
- **Key Questions They Ask**:
  - What is the market opportunity and growth potential?
  - What are the key metrics and performance indicators?
  - How does this support growth and profitability goals?
  - What are the competitive dynamics?
  - What are the major risks and how are they managed?
- **Communication Elements**:
  - Market opportunity and TAM/SAM analysis
  - Key metrics and KPIs with trends
  - Financial performance and projections
  - Competitive landscape analysis
  - Strategic initiatives and progress
  - Risk factors and mitigation strategies
  - Key decisions or approvals needed

### 3. Communication Formats & Templates

#### Executive One-Pager

```markdown
# [Initiative Name]: Executive Summary

## The Opportunity
[1-2 sentences: What problem are we solving? What's the market opportunity?]

## Proposed Solution
[2-3 sentences: High-level approach and key capabilities]

## Business Impact
- **Revenue Impact**: [Projected revenue, growth %, timeline]
- **Cost Impact**: [Investment required, ongoing costs, savings]
- **Strategic Value**: [Competitive advantage, market positioning, risk mitigation]

## Success Metrics
- **Primary KPI**: [Specific metric and target]
- **Secondary KPIs**: [2-3 supporting metrics]

## Resource Requirements
- **Budget**: $[X] ([breakdown if needed])
- **Headcount**: [X] engineers, [Y] designers, [Z] other
- **Timeline**: [X] weeks/months for MVP, [Y] for full release

## Risks & Mitigation
- **[Risk Type]**: [Description] → [Mitigation strategy]
- **[Risk Type]**: [Description] → [Mitigation strategy]

## Recommendation
[Clear action request: approval to proceed, budget allocation, resource commitment]

## Next Steps
1. [Action item with owner and date]
2. [Action item with owner and date]
3. [Action item with owner and date]
```

#### Technical Specification (RFC)

```markdown
# [Feature/System Name] - Technical Specification

## Overview
[Brief description of what's being built and why]

## Goals & Non-Goals
**Goals**:
- [Specific, measurable goal]
- [Specific, measurable goal]

**Non-Goals** (out of scope):
- [What we're explicitly not doing]

## Background & Context
[Technical context, existing system overview, problem being solved]

## Proposed Solution

### Architecture
[High-level architecture diagram or description]

### Components
**Component A**: [Description, responsibilities]
**Component B**: [Description, responsibilities]

### Data Model
```sql
-- Schema changes or new tables
CREATE TABLE example (
    id BIGINT PRIMARY KEY,
    ...
);
```

### API Design
```http
POST /api/v1/resource
Content-Type: application/json

{
  "field": "value"
}

Response 201:
{
  "id": 123,
  "status": "created"
}
```

### Implementation Phases
**Phase 1** (Weeks 1-2):
- [ ] Task 1
- [ ] Task 2

**Phase 2** (Weeks 3-4):
- [ ] Task 3
- [ ] Task 4

## Performance & Scalability
- Expected load: [requests/sec, users, data volume]
- Performance targets: [response time, throughput]
- Scalability approach: [horizontal, caching, etc.]

## Security Considerations
- Authentication/Authorization approach
- Data encryption requirements
- Input validation strategy
- Security testing plan

## Testing Strategy
- Unit tests: [Coverage and approach]
- Integration tests: [Key scenarios]
- End-to-end tests: [User flows]
- Performance tests: [Load scenarios]

## Rollout Plan
- Feature flags or gradual rollout approach
- Monitoring and alerting
- Rollback strategy

## Open Questions
- [ ] Question 1 (owner: @name, deadline: date)
- [ ] Question 2 (owner: @name, deadline: date)

## Appendix
[Additional technical details, alternatives considered, references]
```

#### Marketing Brief

```markdown
# Marketing Brief: [Feature/Product Name]

## Overview
**What**: [One-sentence description]
**Target Audience**: [Primary personas]
**Launch Date**: [Date]
**Goals**: [Acquisition targets, revenue goals, awareness metrics]

## Product Positioning
**Category**: [How we classify this product/feature]
**Target Audience**: [Detailed persona description]
**Key Problem Solved**: [Specific pain point]
**Unique Value Proposition**: [Why us vs competitors]

## Key Messages

**Primary Message**:
"[Main headline that captures the value proposition]"

**Supporting Messages**:
1. [Benefit-focused message for key feature A]
2. [Benefit-focused message for key feature B]
3. [Benefit-focused message for key feature C]

## Feature Overview
| Feature | Customer Benefit | Use Case |
|---------|-----------------|----------|
| [Feature 1] | [Why it matters] | [When to use] |
| [Feature 2] | [Why it matters] | [When to use] |

## Competitive Differentiation
**vs Competitor A**: [Our advantage]
**vs Competitor B**: [Our advantage]
**Key Differentiator**: [Unique capability or approach]

## Go-to-Market Strategy

**Phase 1 - Pre-Launch** (Weeks -4 to 0):
- [ ] Teaser campaign and waitlist
- [ ] Beta user recruitment
- [ ] Content creation (blog posts, videos)

**Phase 2 - Launch** (Week 1):
- [ ] Press release and media outreach
- [ ] Product Hunt launch
- [ ] Social media campaign
- [ ] Email announcement to user base

**Phase 3 - Post-Launch** (Weeks 2-8):
- [ ] Case studies and testimonials
- [ ] Webinar series
- [ ] Paid advertising campaigns
- [ ] Partner announcements

## Marketing Channels
**Owned**:
- Blog posts ([X] planned)
- Email campaigns ([X] planned)
- Social media ([platforms])

**Paid**:
- Google Ads (budget: $[X])
- LinkedIn Ads (budget: $[X])
- Display/retargeting (budget: $[X])

**Earned**:
- Press outreach (target publications)
- Industry influencers
- Partner co-marketing

## Success Metrics
- **Awareness**: [Impressions, reach, brand mentions]
- **Engagement**: [Click-through rate, video views, content downloads]
- **Conversion**: [Sign-ups, trials, purchases]
- **Adoption**: [Active users, feature usage]

## Creative Assets Needed
- [ ] Product screenshots and demos
- [ ] Explainer video (script due: [date])
- [ ] Case study (subject: [customer])
- [ ] Sales deck
- [ ] Social media graphics
- [ ] Website landing page

## Timeline & Milestones
[Gantt chart or milestone list with dates and owners]
```

#### Project Status Update

```markdown
# Project Status: [Project Name] - [Date]

## Summary
[2-3 sentence overview of current status and key developments since last update]

**Overall Status**: 🟢 On Track / 🟡 At Risk / 🔴 Delayed

## Progress This Period

### Completed
- ✅ [Milestone or deliverable 1]
- ✅ [Milestone or deliverable 2]
- ✅ [Milestone or deliverable 3]

### In Progress
- ⚡ [Active work item 1] - [% complete, expected completion]
- ⚡ [Active work item 2] - [% complete, expected completion]

### Upcoming
- 📋 [Next milestone] - [scheduled start date]
- 📋 [Following milestone] - [scheduled start date]

## Key Metrics
| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Timeline | [Date] | [On schedule / X days behind] | [↑↓→] |
| Budget | $[X] | $[Y] spent ([Z]% of budget) | [↑↓→] |
| Scope | [X features] | [Y completed] | [↑↓→] |
| Quality | [Target] | [Current metrics] | [↑↓→] |

## Risks & Issues

**🔴 Critical**:
- **[Issue]**: [Description] | Impact: [X] | Mitigation: [Action] | Owner: [@name]

**🟡 Important**:
- **[Risk]**: [Description] | Probability: [%] | Mitigation: [Action] | Owner: [@name]

**🟢 Monitoring**:
- **[Item]**: [Description] | Status: [Update]

## Decisions Needed
- [ ] **[Decision topic]** - Decision maker: [@name] - Deadline: [date]
  - Context: [Brief background]
  - Options: [A, B, C]
  - Recommendation: [Option X because...]

## Next Steps
1. **[@Owner]** - [Action item] - Due: [date]
2. **[@Owner]** - [Action item] - Due: [date]
3. **[@Owner]** - [Action item] - Due: [date]

## Appendix
[Detailed metrics, charts, additional context if needed]
```

### 4. Message Tailoring Principles

**Key Message for Each Audience**:
- Start with what matters most to that audience
- Use their language and terminology
- Provide appropriate level of detail (high-level for executives, detailed for technical)
- Address their specific concerns proactively

**Supporting Data and Evidence**:
- Quantitative data for executives (ROI, metrics, targets)
- Technical specifications for engineering (requirements, architecture)
- User research for product/design (pain points, validation)
- Market data for marketing/sales (competitive landscape, TAM)

**Call to Action**:
- Be specific about what you're asking for
- Make it easy to say yes (clear, reasonable requests)
- Provide deadline and next steps
- Identify decision makers and owners

**Follow-up Plan**:
- How will you collect feedback or questions?
- When do you need a decision?
- How will you communicate outcomes?
- What's the iteration process?

## Quality Standards

- **Audience-appropriate**: Language, detail, and format match stakeholder needs
- **Actionable**: Clear next steps, owners, and timelines
- **Concise**: Respect stakeholder time with focused, relevant content
- **Evidence-based**: Support claims with data, examples, and research
- **Visual when helpful**: Use charts, diagrams, and tables to clarify complex information
- **Accessible**: Avoid jargon unless audience-appropriate; define acronyms
- **Comprehensive but scannable**: Use headings, bullets, and formatting for easy navigation
- **Forward-looking**: Include next steps and long-term implications
