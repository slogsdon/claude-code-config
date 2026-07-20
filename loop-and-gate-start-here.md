# The Loop & Gate System — Start Here

This is the introduction to a small stack of tools for building, marketing, and
following through on your own projects with an AI agent. It's one Foundation layer
plus three kits that sit on top of it. This page explains what each piece is, how
they fit together, and exactly how to get started, whether you've never touched
Claude Code or you already live in it.

**Two audiences, one page.** If you're **brand new to Claude** and have never used
Claude Code or any agentic setup, read straight through. If you **already know
Claude** and just want to understand this specific setup, read "The mental model"
and "The pieces," then skip to the fast-path section near the end.

The whole system runs inside **Claude Code**, Anthropic's agentic coding tool. The
one hard requirement is a **paid Claude plan (Pro or Max)**, because the free plan
doesn't include Claude Code. Everything else here is free and open source (MIT).

---

## The mental model

Most people meet an AI agent as a blank chat box. It's brilliant and it forgets
you the moment the window closes. It'll build whatever you ask, including the wrong
thing, confidently. And it has no opinion about whether you actually shipped the
work you meant to.

This stack fixes those three gaps with four pieces:

- **The Foundation** gives the agent a **memory** and a sense of **who you are** —
  your voice, your taste, your projects — that persists across every session.
- **The Build Kit** puts **human decision points** into an agentic build loop, so a
  fast agent ships good software instead of a fast mistake.
- **The Grow Kit** does the same for taking that software **to market** — the one
  claim, the design, the copy, the timing.
- **The Accountability Kit** points the same idea at **you** — did you do what you
  said, and what do you keep avoiding?

The kits share a single idea, which is where the name comes from. An agentic **loop**
can run on its own most of the time. But it has to stop at a fixed set of **gates**
where a human has to decide. The loop does the work between the gates. You work the
gates. That's it.

The Foundation sits underneath all three kits. The kits work better when it's
there, because they can read your voice and taste and write what they learn back
into your memory. One of them (Grow) needs it. The other two can start without it.

---

## The pieces, one at a time

### The Foundation — `second-brain-agent`

**What it is.** An AI agent that remembers you and gets a little sharper every
session. Its memory is plain, readable notes in an Obsidian vault — no vector
database, no cloud service, nothing to sign up for. It captures what you tell it,
files it, and writes down one lesson at the end of each session so it improves over
time. It can even edit its own skills as it learns.

**What it gives the kits.** Two things the kits build on. First, **cross-session
memory**, so your projects and decisions survive the window closing. Second, your
**voice and taste profiles** — a short interview turns "how you write" and "what
good looks like to you" into notes the Grow Kit reads so its drafts sound like you
and its design choices match your bar.

**How you use it.** Unlike the kits, the Foundation isn't a plugin you add. It's a
**folder you open and work inside**. The skills live in the folder, and a
memory-loader turns on automatically every time you open it. You capture ideas
(including from your phone, if you point the Obsidian mobile app at the same
folder), and the agent triages and files them on your say-so.

Repo: **[github.com/slogsdon/second-brain-agent](https://github.com/slogsdon/second-brain-agent)**

### The Build Kit — `loop-and-gate-build-kit`

**What it does.** Turns "an AI agent that writes code" into "an AI agent that ships
good software." It's a map of the eleven points in a build where a human has to
decide, and how to work each one — even the ones whose expertise you don't have
yet.

**The gates.** Should this exist at all? Who's it for, and what's a win? Which
direction fits the strategy? Is the plan right? Is the architecture sane? Is the
agent off the rails? Does the test actually prove it, or is it a demo? Is the cost
right? Is the risk acceptable to ship? Ship now, and to whom? And above all of
them, the master gate: how much of this process does this particular change even
deserve — because a typo fix and a billing change don't get the same treatment.

**What it needs.** The gates are a judgment layer that sits on top of an actual
build loop, so you also install two free public plugins that provide the loop
itself (`superpowers` and `agent-skills`). It works with or without the Foundation,
but it's better with it.

Repo: **[github.com/slogsdon/loop-and-gate-build-kit](https://github.com/slogsdon/loop-and-gate-build-kit)**

### The Grow Kit — `loop-and-gate-grow-kit`

**What it does.** The other half of the loop: taking finished software to the right
people and reading whether it worked. Same method, pointed at go-to-market. Its
gates cover who the audience is, what the one claim is, whether the design carries
it without looking like slop, whether the copy is true and in your voice, the right
channel and timing, and finally whether it actually moved anything.

**What it needs.** This one **requires the Foundation**, because two of its gates
*are* your Foundation profiles: the design gate reads your taste, the copy gate
reads your voice. It also uses two free public plugins for the design and writing
work (`skills-design` and `skills-writing`), and optionally a free-tier scheduler.
You can post everything by hand if you'd rather — the gate is the decision, not the
tool.

Repo: **[github.com/slogsdon/loop-and-gate-grow-kit](https://github.com/slogsdon/loop-and-gate-grow-kit)**

### The Accountability Kit — `loop-and-gate-accountability-kit`

**What it does.** Points the loop at your own follow-through. It's a daily rhythm
with eight gates: set the one thing that matters today, capture what you actually
did, reckon honestly at night about whether you did it, and get caught when you
keep quietly deferring the hard thing. The part that makes it more than a journal
is the deferral engine — every morning focus that doesn't show up in the day's log
gets counted, and at three strikes it stops being polite and forces a decision:
re-commit with a reason, or kill it.

**What it needs.** Nothing. This is the lightest of the three — it runs on Claude
alone, no extra plugins, no account, no local model. It keeps its own plain-text
state by default, and if you already have an Obsidian vault (from the Foundation or
otherwise), it uses that instead.

Repo: **[github.com/slogsdon/loop-and-gate-accountability-kit](https://github.com/slogsdon/loop-and-gate-accountability-kit)**

---

## How they fit together

The three kits close a flywheel:

**Build → Grow → Accountability → Build.**

You **build** something with the Build Kit. You take it to market with the **Grow**
Kit, whose final gate reads whether it actually landed and writes those customer
signals back into the Foundation vault. The Build Kit's first gate reads those same
signals to decide what's worth building next. And the **Accountability** Kit runs
underneath the whole thing, so when a build stalls or a launch never goes out, the
nightly reckoning is where it gets caught instead of quietly slipping.

The Foundation is the shared bus in the middle. It's how the halves talk to each
other, and it's why the profiles and memory are worth setting up first.

You do not need all four to get value. Each kit stands on its own (with the one
exception that Grow needs the Foundation). Start with what maps to your actual
problem and add the rest when you feel the seam.

---

## Getting started from scratch (new to all of this)

If you've never used Claude Code, this is the whole path from nothing to a working
setup. Budget about 20 minutes, most of it one-time.

### Step 1 — get a paid Claude plan

Go to **[claude.ai](https://claude.ai)** and make sure you're on **Pro** or **Max**, not the free plan.
This is the step people miss, and nothing here works without it. Pro is the usual
starting point.

### Step 2 — install the Claude Code Desktop app

A normal app you double-click, no terminal required.

- **Mac:** download the `.dmg`, open it, drag Claude to Applications.
- **Windows:** download the `.exe` and run it. If it asks you to install **Git**
  first, say yes, then reopen the app.

Get the installers from Anthropic's download page (**[code.claude.com/docs](https://code.claude.com/docs)**). Open
the app, sign in (a browser window opens for a second), and click the **Code** tab.

### Step 3 — set up the Foundation first

The Foundation is the base everything else builds on, so start there.

1. On the Foundation repo's GitHub page
   ([github.com/slogsdon/second-brain-agent](https://github.com/slogsdon/second-brain-agent)), click the green **Code** button,
   then **Download ZIP**. Unzip it — you'll get a `second-brain-agent` folder. Move
   it somewhere you'll find it, like Documents.
2. In the Claude Code Desktop app: **File → Open folder**, and pick that folder.
3. That's the whole install. The skills are already inside, and the memory-loader
   turns on automatically when you open the folder.

Then run your first session. In the chat, type a plain-language goal:

> Get to know me: ask about my current project and my preferences, then save what
> you learn.

The agent loads its memory (empty for now), asks you questions, saves the answers
as notes, and writes down what it learned at the end. Do this once and it starts
remembering you.

While you're here, seed your voice and taste — the Grow Kit will need them:

> Run the profile interview so you know how I write and what good looks like to me.

### Step 4 — add your first kit

Now layer a kit on top. Kits install differently from the Foundation — they're
**plugins**, added with one command in the chat, no download. Pick the one that
matches what you're trying to do (the next section covers all three).

The simplest to start with is the **Accountability Kit**, because it needs nothing
else. In the Code chat, type:

```
/plugin marketplace add slogsdon/loop-and-gate-accountability-kit
```

Click **Install** on the menu that appears, then start the daily loop:

```
/morning
```

That's a complete, working setup: a Foundation that remembers you, and a kit that
keeps you honest about your days. Add the Build and Grow kits when you're ready to
ship and market something.

---

## Layering in the kits (once the Foundation is in place)

With the Foundation set up, each kit is a one-time plugin install plus, in two
cases, a couple of free public plugins that provide the underlying loop. Add
whichever you need.

### Accountability Kit — needs nothing else

```
/plugin marketplace add slogsdon/loop-and-gate-accountability-kit
```

Install it, then use the five daily commands: `/morning` sets the one thing today,
`/log` captures what you did as you go, `/eod` reckons honestly at night,
`/plan-tomorrow` sets you up to start cold, and `/weekly-signals` reads your
patterns once a week. It writes to your Foundation vault automatically when one is
present.

### Build Kit — needs the build-loop plugins

```
/plugin marketplace add slogsdon/loop-and-gate-build-kit
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
/plugin marketplace add addyosmani/agent-skills
/plugin install agent-skills@addy-agent-skills
```

The first line is the gates. The rest are the free public plugins that run the loop
underneath them (brainstorm, plan, build, test, review, plus a security pass, live
browser testing, and launch prep). Then, at any build decision:

```
/loop-and-gate
```

Tell it what you want to build. It sizes the change first (the master gate), then
walks you only through the gates that change actually earns. If the Foundation is
present, it reads your profiles so its framing matches how you think, and logs each
decision to your vault.

### Grow Kit — needs the Foundation plus the design/writing plugins

```
/plugin marketplace add slogsdon/loop-and-gate-grow-kit
/plugin marketplace add slogsdon/claude-code-config
/plugin install skills-design@slogsdon-claude-code-config
/plugin install skills-writing@slogsdon-claude-code-config
```

The Foundation is a hard requirement here, because the design gate reads your taste
profile and the copy gate reads your voice profile. The two `skills-*` plugins do
the actual design and writing work. Then, per piece or per campaign:

```
/grow-and-gate
```

It runs the gates for whatever cadence you're in — setting strategy, making a
single piece, or reading the results — and at the end writes what it learned back
to your vault, where the Build Kit's first gate can read it.

---

## A suggested order

You don't have to follow this, but if you want a path:

1. **Foundation** — set up memory and run the profile interview. Everything else is
   sharper once this exists.
2. **Accountability Kit** — the lightest kit and the one that makes the habit of
   using the system stick. Start running your days through it.
3. **Build Kit** — the first time you have something real to build.
4. **Grow Kit** — the first time you have something built and need to take it to
   people.

By the time all four are in place, you have the full flywheel: a system that
remembers you, helps you build the right thing well, take it to market in your own
voice, and stay honest about whether you actually did it.

---

## Reference

- **The story behind it** — "Building on the Margins" is the essay this whole system
  came out of: [Building on the Margins](https://shane.logsdon.io/articles/strategic-insights/building-on-the-margins/)
- **Foundation** — [github.com/slogsdon/second-brain-agent](https://github.com/slogsdon/second-brain-agent)
- **Build Kit** — [github.com/slogsdon/loop-and-gate-build-kit](https://github.com/slogsdon/loop-and-gate-build-kit)
- **Grow Kit** — [github.com/slogsdon/loop-and-gate-grow-kit](https://github.com/slogsdon/loop-and-gate-grow-kit)
- **Accountability Kit** — [github.com/slogsdon/loop-and-gate-accountability-kit](https://github.com/slogsdon/loop-and-gate-accountability-kit)

Every repo has its own `GETTING-STARTED.md` (a no-terminal walkthrough) and a
`reference/` folder with the gates in plain language. This page is the map; those
are the detail.
