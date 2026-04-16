---
name: biz-brief
description: Use BEFORE superpowers:brainstorming when building a product feature, tool, or initiative that has commercial or strategic stakes. Generates a Business Context Brief — the commercial/strategic layer superpowers skips — then hands off to superpowers:brainstorming with that context loaded.
---

# Skill: /biz-brief

Generates a concise Business Context Brief and saves it to `docs/superpowers/briefs/`. Output feeds directly into `superpowers:brainstorming` so the resulting spec is technically sound AND grounded in real business intent.

## When to use

- Before any brainstorm that has a user, a market, or a business model
- When the user says "let's build X" and X isn't purely internal tooling
- When `superpowers:brainstorming` would otherwise start from a blank context

## Steps

### 1. Ask targeted questions (unless user says skip)

Ask these 3–5 questions in a single message. Do not ask one at a time.

```
Before I write the brief, I need to nail the business context:

1. Who is the primary user — job title, situation, what they're doing right now to solve this?
2. What does success look like in 6 months — growth, conversion, retention, revenue, adoption? Pick one primary metric.
3. Is this free, paid, freemium, or internal? If unclear, what's your current assumption?
4. Who hears about this first and how — direct sales, product-led, word of mouth, press?
5. What's the one business risk that keeps you up at night — even if we ship this perfectly?
```

If the user says "skip questions" or "just generate it," proceed with explicit stated assumptions and surface them clearly in the brief.

### 2. Generate the brief

Write a tight 1-page brief. No padding. No academic structure. No feature lists, no tech stack, no implementation detail.

Structure:

```markdown
# Business Context Brief: [Feature Name]
**Date:** YYYY-MM-DD  
**Status:** Draft

## Problem + Persona
[Who has this problem. What they're doing now. Why that's not working. 3–5 sentences max.]

## Opportunity
[What success looks like in business terms — not "better UX", but growth/conversion/retention/revenue/adoption numbers or directional goals. 2–4 sentences.]

## Monetization Angle
[Free / paid / freemium / internal. If assumption, flag it explicitly: "ASSUMED: freemium."]

## Success Metrics
- [KPI 1]: [target or direction]
- [KPI 2]: [target or direction]
- [KPI 3]: [target or direction]
(3–5 metrics max. Business KPIs only — not Lighthouse scores or test coverage.)

## Go-to-Market Sketch
[Who hears about this first, how, through what channel. 2–3 sentences. Flag if this is an assumption.]

## Top Business Risks
1. [Risk: one sentence. Why it makes this irrelevant even if built correctly.]
2. [Risk]
3. [Risk]
(2–3 risks max. Technical risks belong in the spec, not here.)

---
## Handoff to Superpowers

Run: `superpowers:brainstorming` with this brief as context.

Key questions to resolve in the spec:
- [Question 1 derived from the brief — usually the biggest assumption or risk]
- [Question 2]
- [Question 3]
```

### 3. Save the brief

Save to:
```
docs/superpowers/briefs/YYYY-MM-DD-<kebab-feature-name>.md
```

Create the directory if it doesn't exist.

### 4. Hand off

Tell the user:

> Brief saved to `docs/superpowers/briefs/[filename]`. Ready to run `superpowers:brainstorming` — invoke it now and paste the brief as context, or I can do it directly.

## Rules

- 1 page max. If it's longer, cut it.
- Explicitly NOT a PRD. No feature lists, no tech stack, no wireframes.
- Tone: direct, opinionated, surfaces tradeoffs. Not neutral, not padded.
- If a monetization model is unclear, surface the assumption explicitly — don't silently pick one.
- Business risks ≠ technical risks. "The API might be slow" is not a business risk. "Enterprise buyers won't trust a new vendor in this space" is.
