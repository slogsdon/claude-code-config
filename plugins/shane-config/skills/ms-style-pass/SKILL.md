---
name: ms-style-pass
description: >
  Apply Microsoft Writing Style Guide term preferences, bias-free language rules, and heading conventions to a blog draft — without disrupting voice or structure that humanize already established. Use after the humanize skill when Shane says: "ms style pass", "apply the style guide", "style check this", "run the style guide on this", "check for outdated terms", "bias check this", "clean up the terminology", "add headings". Also invoke proactively when a humanized draft contains terms like blacklist, whitelist, master/slave, sanity check, guys, or disability metaphors.
---

# MS Style Pass

This skill runs after humanize. Its job is to catch the specific term preferences, bias-free language rules, and heading conventions from the Microsoft Writing Style Guide that humanize doesn't cover, without touching the voice and structure humanize already established.

Don't rewrite for clarity — humanize did that. Don't restructure prose — that's done. You're here to fix specific terms and add or correct headings for scannability.

## What to check

### 1. Outdated or deprecated terms

Read `references/terms.md` for the full substitution list. Apply substitutions where they make sense in context — don't apply mechanically when a term is being _discussed_ rather than _used_ (e.g., "the old term was 'blacklist'" should stay as-is).

Priority terms most likely to appear in developer/AI blog content:

| Use instead | Not |
|---|---|
| blocklist | blacklist |
| allowlist | whitelist |
| primary / secondary, main / replica | master / slave |
| soundness check, confidence check, validation | sanity check |
| placeholder, sample, example | dummy |
| people, everyone, the team, folks | guys (generic group) |
| stop, cancel, end | abort, kill (for user-facing processes) |
| select, press | hit (for keys/buttons) |

### 2. Bias-free language

Flag or fix uses that MS Style identifies as problematic:

- **Disability metaphors used figuratively**: "blindly following", "deaf to feedback", "crippled performance", "lame excuse", "dumb approach" (when not a specific technical term like "dumb terminal")
- **Gendered defaults for generic roles**: "he" for a generic engineer or developer → "they"
- **Culturally insensitive idioms**: flag rather than replace if you're not certain — add a note in the changelog

Note: humanize already cuts "crazy" and "insane" — don't re-check unless they survived.

### 3. Mechanical formatting conventions

These are unambiguous — apply them:

- **email** (not e-mail)
- **internet** (lowercase, unless starting a sentence)
- **website** (one word, lowercase)
- **setup, login** as nouns or adjectives; **set up, log in** as verbs ("your login", "log in to your account")
- **Oxford comma**: A, B, and C — not A, B and C
- **Numbers**: spell out zero through nine; numerals for 10 and above. Exception: use numerals when mixing with a numeral in the same sentence ("3 of the 10 checks passed")

### 5. Headings — add if absent, correct if present

Both Microsoft and Google style guides treat headings as an accessibility and scannability requirement, not just a formatting preference. Apply this check last, after all term substitutions are done.

**If headings are already present:**
- Convert title case to sentence case: capitalize only the first word and proper nouns. "Setting Up Your CI Pipeline" → "Setting up your CI pipeline"
- Flag vague headings that label rather than describe: "Introduction", "Overview", "Background", "Conclusion", "Summary" → suggest something specific to the content
- Check for parallel structure across headings at the same level — if two H2s are noun phrases and one is a question, flag the mismatch
- Don't change heading levels the author set intentionally

**If headings are absent:**
- Add H2 headings if the draft has three or more distinct sections or runs longer than roughly 400 words. Short, single-topic posts don't need headings.
- Don't add an H1 — that's the post title, set outside the draft
- Aim for one H2 per major topic shift, not one per paragraph
- Write headings that name what follows specifically — a reader skimming headings alone should understand the post's shape
- Match the voice: sentence case, specific over generic, action-oriented or topic-focused where natural
- Log all inserted headings in the changelog

### 4. Tech term capitalization

Don't over-capitalize. Preserve what's actually a proper name or acronym:

- Acronyms stay all-caps: API, URL, UI, SDK, CLI, JSON, REST
- Preserve vendor capitalization: JavaScript, TypeScript, GitHub, macOS, iOS
- Common nouns stay lowercase: the cloud, the internet, a webhook, a feature flag, a pull request
- Don't capitalize generic tech concepts just because they feel important: "the pipeline", "the agent", "the model"

## What not to touch

The voice work is done. Don't:

- Change sentence structure or phrasing unless a term substitution requires it
- Add or remove hedges, or rebalance tone
- Break up or merge sentences
- Touch inline code, code samples, variable names, or quoted strings
- Apply MS structural conventions (numbered steps, procedure formatting) beyond what's listed here — those are for Microsoft docs, not personal blog posts
- Enforce any additional "clarity" edits beyond what's listed here — scope creep from this skill erodes humanize's work

## Process

1. Read the full draft. Understand what terms appear and in what context (used vs. discussed). Assess whether headings are present and whether the draft is long enough to warrant them.
2. Check the term list in `references/terms.md` — scan for any listed terms.
3. Check for bias-free language issues.
4. Apply the mechanical formatting conventions (email, internet, Oxford comma, numbers, capitalization).
5. Apply the heading check: correct existing headings (sentence case, specificity, parallel structure) or insert H2s if the draft needs them.
6. Return the edited draft followed by a brief changelog.

## Changelog format

After the edited draft, include a "Style pass changes" section:

```
**Style pass changes:**
- "blacklist" → "blocklist" (3 instances)
- "sanity check" → "soundness check" (1 instance)
- Added Oxford comma in 2 sentences
- Left "master branch" as-is — referring to the specific git branch name; may be worth noting the rename in context if the audience is mixed
- No bias-free language issues found
```

Flagging what was left alone is as important as what was changed. When you make a judgment call — especially around terms that are technical names rather than generic usage — note it explicitly so Shane can decide whether to override.
