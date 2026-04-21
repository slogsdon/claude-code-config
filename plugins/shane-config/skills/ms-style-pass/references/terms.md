# MS Style Term Substitutions

Full reference for the ms-style-pass skill. These are drawn from the Microsoft Writing Style Guide A–Z word list, filtered for terms most likely to appear in developer-facing or AI blog content.

## Table of contents

- [Deprecated or renamed terms](#deprecated-or-renamed-terms)
- [Bias-free alternatives](#bias-free-alternatives)
- [Verb/noun pairs (setup vs set up)](#verbnoun-pairs)
- [Specific tech term preferences](#specific-tech-term-preferences)
- [Terms to avoid entirely](#terms-to-avoid-entirely)

---

## Deprecated or renamed terms

| Use | Instead of | Notes |
|---|---|---|
| blocklist | blacklist | |
| allowlist | whitelist | |
| primary / secondary | master / slave | In database/replication contexts; "main/replica" also acceptable |
| main | master | As a git branch name reference — note: it's a proper name if the branch is actually called "master" |
| soundness check, confidence check, validation | sanity check | Choose based on what's actually being checked |
| placeholder, sample, example | dummy | "Dummy data" → "sample data"; "dummy variable" → "placeholder variable" |
| stop, cancel, end | abort | For user-facing processes; "abort" is fine in low-level/kernel contexts where it's a technical term |
| stop, end, cancel | kill | For processes users interact with; fine in Unix/shell contexts as a technical term |
| select, press | hit | For keys and buttons |
| people, the team, everyone, folks | guys | When referring to a mixed or unknown group |
| they / their | he, she (generic) | Use "they" as the singular gender-neutral pronoun |

---

## Bias-free alternatives

### Disability metaphors (avoid figurative use)

| Use | Instead of | Notes |
|---|---|---|
| following blindly, uncritically | blindly | Fine as a technical adverb ("executed blindly") in specific contexts |
| ignoring, unresponsive to | deaf to | |
| severely limited, broken | crippled | "Crippled performance" → "severely degraded performance" |
| weak, flawed | lame | |
| silent, mute | dumb | Exception: "dumb terminal" is an established technical term — keep it |
| irrational, unexpected | crazy, insane | Humanize covers these; flag if they survived |
| confining, restrictive | paralyzed | When used figuratively |

### Other

| Use | Instead of | Notes |
|---|---|---|
| workforce, workers | manpower | |
| artificial, synthetic, constructed | man-made | |
| staff, work, hours | man-hours | |
| chairperson, chair | chairman | Unless a specific person's title |

---

## Verb/noun pairs

Correct usage matters for credibility:

| Noun / adjective | Verb |
|---|---|
| setup ("the setup is") | set up ("set up the environment") |
| login ("the login page") | log in ("log in to the portal") |
| sign-in ("the sign-in flow") | sign in ("sign in with your account") |
| backup ("run a backup") | back up ("back up your data") |
| rollout ("the rollout went well") | roll out ("roll out the feature") |
| build-out | build out |

---

## Specific tech term preferences

| Use | Instead of | Notes |
|---|---|---|
| email | e-mail | No hyphen |
| internet | Internet | Lowercase unless starting a sentence |
| website | web site, web-site | One word, lowercase |
| web | Web | Lowercase unless it's part of a proper name |
| app | application | In informal/blog contexts; "application" is fine in formal docs |
| mobile device | cell phone, mobile phone | More inclusive of tablets; but "phone" is fine when you specifically mean phones |
| select | click | When the action might not be a mouse click (touch, keyboard, etc.); use "click" only when you know it's a mouse |
| choose | select | When picking from a set of options (not UI elements) |
| sign in | log in | Preferred for consumer products; "log in" still acceptable for developer contexts |

---

## Terms to avoid entirely

These have no direct substitution — rephrase the sentence:

- **"easy"** — ableist, and almost never accurate from the reader's perspective. Cut or replace with what you actually mean ("three steps", "no configuration required", etc.)
- **"simply"** — covered by humanize, but flag if it survived
- **"just"** (as a minimizer) — covered by humanize; "just add this line" → "add this line"
- **"native"** (to describe people) — use "indigenous" or be specific
- **"grandfathered"** — use "legacy", "exempt", "previously approved"
- **"cakewalk"** — culturally insensitive origin; use "straightforward", "quick"

---

## Numbers quick reference

| Rule | Example |
|---|---|
| Spell out zero–nine | "three retries", "five minutes" |
| Numerals for 10+ | "10 requests", "25 users" |
| Numerals when mixing | "3 of the 10 checks passed" |
| Numerals for measurements/versions | "2 GB", "version 3.1" |
| Numerals at start of sentence? | Rewrite the sentence instead |
