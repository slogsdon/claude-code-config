---
name: intent-mismatch-auditor
description: >
  Audit whether the queries a page ranks for actually match what the page is about. Use when the user says "intent mismatch", "audit search intent", "why is this page not converting", "are my pages matching what people search", "wrong queries ranking", or pastes GSC query+page data plus a page title/URL and asks if they line up. Works standalone from a GSC CSV plus page titles the user provides.
---

# Intent Mismatch Auditor

For each page, compare the *intent* of the queries it ranks for against what the page actually delivers (its title, URL, and topic). Mismatches mean the page ranks for terms it can't satisfy — high impressions, low CTR, bad dwell time, no conversions. The fix is usually a new dedicated page or a content pivot, not more optimization of the wrong page.

## Input

- A GSC **Query + Page** export: `Query`, `Page`, `Clicks`, `Impressions`, `CTR`, `Position`.
- The **page's title and/or a short description of its content** — ask the user to provide titles for the pages in question (or let you infer from the URL slug and offer to refine if they paste the title/H1).

## Intent taxonomy

Classify every query into one of four intents (plus modifiers):
- **Informational** — "how to", "what is", "guide", "ideas", "examples".
- **Commercial investigation** — "best", "top", "vs", "review", "comparison", "alternatives".
- **Transactional** — "buy", "price", "coupon", "for sale", "near me", "hire", "cost".
- **Navigational** — brand or product name, "login", specific site name.

Also tag obvious **format intent** (listicle, tutorial, calculator, definition, product page) when the query implies it.

## Steps

1. **Classify the page.** From its title/content, determine the intent it serves (e.g. a how-to blog post = informational/tutorial).
2. **Classify each query** it ranks for using the taxonomy.
3. **Score alignment** per query:
   - **Match** — query intent == page intent.
   - **Soft mismatch** — adjacent intent (informational page ranking for commercial "best X" — capturable with a section, but a comparison page would win).
   - **Hard mismatch** — opposite intent (a blog guide ranking for transactional "buy X near me", or a product page ranking for "how does X work").
4. **Weight by opportunity.** A mismatch on a query with 2,000 impressions and 0.3% CTR is a real problem; a mismatch on 12 impressions is noise. Prioritize high-impression, low-CTR mismatches.
5. **Recommend the remedy:**
   - **Hard mismatch, high volume** → **new dedicated page** built for that intent; interlink with the existing page.
   - **Soft mismatch** → add a targeted section/FAQ to the existing page to capture the adjacent intent, or split if it's big enough.
   - **Match but low CTR** → not an intent problem; route to title-tag-doctor.
   - **Mismatch, low volume** → ignore.

## Output

A mismatch table sorted by opportunity (impressions × CTR gap):

| Page | Page intent | Query | Query intent | Alignment | Impressions | CTR | Recommendation |
|------|-------------|-------|--------------|-----------|-------------|-----|----------------|

For each **hard mismatch** worth acting on, write one line specifying the new page or pivot: working title, target intent, and which existing page links to it. Summarize how many genuinely new pages the data justifies (don't over-recommend — only where volume supports it), and flag any page whose *whole* query profile is mismatched (a sign the page is built around the wrong topic entirely).
