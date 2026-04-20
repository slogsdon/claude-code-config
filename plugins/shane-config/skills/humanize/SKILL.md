---
name: humanize
description: >
  Edit a draft to sound like Shane wrote it — removing AI-typical patterns, restoring conversational flow, and preserving technical precision. Use whenever Shane says: "humanize this", "edit in my voice", "AI detector pass", "make this sound like me", "rewrite this", "edit this post", "clean this up". Also invoke proactively if presented with a draft that contains staccato fragments, dramatic colon-reveals, em-dash lists, or semicolons between independent clauses — these are reliable markers that text needs a voice pass.
---

# Humanize / Voice Edit

Edit draft text to match Shane's writing voice. The goal is prose that tests clean in AI detectors and reads like a person wrote it — not because it's dumbed down, but because it has the structural and rhythmic properties of careful human writing.

## What this skill does

You're not rewriting for style points. You're systematically removing the patterns that make text read as machine-generated, while preserving the technical precision and self-aware confessional register that characterizes Shane's work. The two goals reinforce each other: AI detectors flag the same structural tics that make writing feel stiff.

Read the full draft before making any changes. Understand the argument. Then apply the edits below.

## Structural edits

### Em-dash lists → prose with connectives

AI writing loves em-dash enumerations. Convert them to sentences.

**Before:** `This affects three things: clarity, speed, and cost.`
**After:** `This affects clarity, and it compounds into speed and cost problems.`

**Before:** `What you lose: auditability, traceability, and control.`
**After:** `There's one thing you lose when you defer: your ability to audit the work.`

When a colon-reveal lands on a single abstract noun, expand it into a phrase that includes a verb. `auditability` → `your ability to audit the work`. This is the single highest-signal AI pattern to eliminate.

### Semicolons between independent clauses → period + new sentence

**Before:** `The spec defines the work; the agent executes against it.`
**After:** `The spec defines the work. The agent executes against it.`

### Fragment sequences → complete sentences

Staccato fragments — `More specific. More examples. More precise.` — are a common AI rhythm. Merge them into prose.

**Before:** `More specific. More actionable. Closer to the real problem.`
**After:** `More specific, more actionable, and closer to the real problem.`

### Em-dash interjections → commas

**Before:** `The model — to its credit — usually finds a path.`
**After:** `The model, to its credit, usually finds a path.`

### Parentheses for inline definitions, not em-dashes

**Before:** `AX — Agent Experience — is the term I use for this.`
**After:** `AX (Agent Experience) is the term I use for this.`

### Break academic compound sentences

Long sentences chained with "which" or "that" clauses feel generated. Split them.

**Before:** `This is a mechanism which, when understood correctly, changes how you think about the whole problem.`
**After:** `This is a mechanism. When you understand it correctly, it changes how you think about the whole problem.`

## Vocabulary and phrasing

### Prefer concrete over abstract

- "in outcome" → "in practice"
- "leveraging" → whatever it actually means in context
- "consistently reach a state where" → "inevitably realize"
- "productive shift" → "important thing the shift requires" (or whatever the actual substance is)
- Technical labels → descriptions when speaking to a general audience ("computer scientists" → "people who built them"), but preserve precision when the audience is technical

### Add qualifiers where they're warranted

Shane hedges accurately. Add: "so far", "with any certainty", "not only...but also" where the claim genuinely is uncertain or partial. Don't add hedges that weaken true claims.

### Remove moral-weight filler

Cut: "simply", "just", "obviously", "of course", "clearly" — these carry condescension. Also cut sentence-starting "And" unless it's load-bearing rhythmically.

### Colloquial asides at natural moments

A well-placed colloquialism breaks the register productively. These only work if they're grounded and specific — Shane's example: "nor do they phone a friend." Don't force it. One per section at most.

## AI-detection avoidance (structural)

These are the patterns that reliably get flagged:

1. **Single-noun colon-reveals** — `What you lose: auditability.` Expand the noun into a phrase.
2. **Parallel staccato fragments** — Convert to flowing prose.
3. **"which is [adjective], consistently, in ways that [verb]"** — This pattern almost never appears in human writing. Rewrite it.
4. **Sentence-final list of three** with identical grammatical structure — Break up or convert one element to a clause.
5. **Repetitive sentence-opening rhythm** — If five consecutive sentences start with "The [noun]", vary the openers.

## What to preserve

Do not over-edit. These things should survive the pass:

- **Technical precision** — If a specific term (JSONL, `run_started_at`, AX) is the right word, keep it. Don't replace technical accuracy with accessibility theater.
- **The confessional hook** — Shane's writing often opens with a self-implicating admission. Preserve this register. "I got quite good at prompting" is different from "I became skilled at prompting" — the first is honest, the second is résumé language.
- **First-person grounding** — Claims that start with "I" or "we" are load-bearing. Don't convert them to passive or impersonal constructions.
- **The argument structure** — You're editing prose, not restructuring the argument. If a section makes a claim in a specific order, preserve that order.
- **Intentional short sentences** — A one-sentence paragraph after a dense block is often deliberate pacing. Don't merge it.

## Process

1. Read the full draft. Identify the core argument and voice register.
2. Scan for the AI patterns listed above (colon-reveals, fragment sequences, em-dash lists, semicolons as clause connectors).
3. Apply structural edits first, then vocabulary/phrasing.
4. Read the result aloud (mentally). If a sentence sounds like it could have come from a corporate blog, rewrite it.
5. Verify nothing load-bearing was lost — especially hedges, confessional moments, and technical terms.
6. Return the edited draft. Note any places where you made a judgment call or where a TODO was present in the original — flag those explicitly rather than editing around them.

## Example patterns in practice

These are drawn from actual edits on the AX Shift post:

| Original | Edited | Why |
|---|---|---|
| `What you lose when you defer: auditability` | `there's one thing you lose when you defer: your ability to audit the work` | Expands single-noun reveal into a phrase |
| `The problem was somewhere I hadn't looked yet.` | (preserved as-is) | First-person confessional, load-bearing |
| `It's not a failure; it's the mechanism.` | `It's not a failure to find gaps here. That's the mechanism you need.` | Semicolon → period; expands the claim |
| `More specific. More examples. Closer to real use.` | `More specific, with more examples, and closer to real use.` | Fragment sequence → prose |
| `AX — Agent Experience —` | `AX (Agent Experience)` | Em-dash definition → parenthetical |
| `people who built them` instead of `computer scientists` | (context-dependent) | Concrete description when audience isn't technical |
