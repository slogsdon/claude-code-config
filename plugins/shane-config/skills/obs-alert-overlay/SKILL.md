---
name: obs-alert-overlay
description: Generate an OBS browser-source alert overlay — single 1920×1080 HTML file with TRANSPARENT background and hash-routed scenes for stream events (#follow, #sub, #donation, #raid). Each scene auto-plays a single entrance animation, holds, then fades. Reads ./design/<brand-slug>/DESIGN.md, tokens.css, and components.html. Triggers include "obs alert overlay", "stream alerts", "follower alert", "/obs-alert-overlay".
---

# Skill: obs-alert-overlay

Produces ONE self-contained `obs-alert-overlay.html` file at 1920×1080 with **transparent background** that streams compositors (OBS, Streamlabs, Twitch Studio) load as a browser source. The page contains four hash-routed scenes — `#follow`, `#sub`, `#donation`, `#raid` — each with its own auto-playing entrance animation. Switching scenes is just changing the URL hash.

This is distinct from the `stream-overlay` skill (which produces persistent scene chrome — starting / brb / webcam / lower-third / ending). This skill produces TRANSIENT alert cards triggered per event.

## When to use

- User streams on Twitch / YouTube Live / Kick and wants branded alert cards
- A `DESIGN.md` exists for the brand

## Inputs

- **Required:** brand slug
- **Optional:** alert position (default: lower-right corner; alternates: lower-left, upper-right, top-bar)
- **Optional:** brand voice for alert copy (e.g. "ack." vs "thanks for the follow." vs "noted." — Shane's brand prefers terse + sentence-case)

## Output

`./design/<brand-slug>/artifacts/obs-alert-overlay.html` (single file — overwrite OK; canonical alert overlay for the brand)

## Scenes (default 4)

| Hash | Trigger | Default copy |
|---|---|---|
| `#follow` | new follower | "<name> just followed." |
| `#sub` | new subscriber | "<name> subscribed." |
| `#donation` | tip / donation | "<name> sent $<amount>." |
| `#raid` | incoming raid | "<name> raided with <count>." |

Each scene takes scene parameters via URL: `obs-alert-overlay.html#follow?name=Sam` (or via OBS alert variable substitution per stream tool).

## Steps

### 1. Verify brand exists

```bash
test -f ./design/<brand-slug>/tokens.css
```

### 2. Gather the brief

Ask in one message:

```
1. Default alert position — lower-right (default) | lower-left | upper-right | top-bar
2. Brand voice for alert copy — terse ("noted.") | declarative ("just followed.") | warm ("welcome.")
3. Hold duration (seconds) — default 4
4. Any scenes to skip — default: include all 4
```

### 3. Pick variation — applies to ALL scenes (consistency for live broadcasts)

Alert cards must read consistently across scene types — viewers shouldn't have to re-parse the visual language for each event type. Pick ONE set:

- **Card style**: `bracketed` (corner-frame L-marks) | `chromeless` (no border, type-only) | `block` (solid color block) | `hairline` (1px border + cream surface)
- **Type pressure**: `display-led` (Fraunces or brand display dominant) | `mono-led` (mono labels carry it)
- **Color usage**: `cream-card` (cream surface on transparent overlay) | `inverted-card` (dark ink card on transparent overlay)
- **Position**: `lower-right` (default) | `lower-left` | `upper-right` | `top-bar`

Differentiation between scenes comes from copy + a small mono label ("FOLLOW" / "SUB" / "TIP" / "RAID"), NOT from changing the visual treatment per scene.

### 4. Generate the HTML

The file structure mirrors `stream-overlay`: one `.scene` per hash, JS reveals the active scene. Each `.scene` contains an `.alert-card` with auto-playing CSS keyframe animation.

Template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><Brand> — OBS Alert Overlay</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=<families>&display=swap">
<style>
/* Embed tokens.css verbatim */
<contents of tokens.css>

/* Critical: page must be transparent for OBS compositing */
html, body { margin: 0; padding: 0; width: 1920px; height: 1080px; overflow: hidden; background: transparent; font-family: var(--type-sans-family); color: var(--color-ink); }

.scene { position: fixed; inset: 0; width: 1920px; height: 1080px; display: none; }
.scene.is-active { display: block; }

/* Alert card — positioned by variation choice */
.alert-card {
  position: absolute;
  /* lower-right default: */
  bottom: 80px; right: 80px;
  min-width: 480px; max-width: 720px;
  padding: 24px 32px;
  background: var(--color-surface);   /* cream-card; or var(--color-ink) for inverted-card */
  color: var(--color-ink);
  border: 1px solid var(--color-rule); /* hairline variation */
  /* Auto-play sequence: slide-in (0–600ms) → hold (600ms–4400ms) → fade (4400–4800ms) */
  animation: alert-sequence 4800ms cubic-bezier(0.2, 0.6, 0.2, 1) forwards;
}

/* Single animation per scene — entrance + hold + exit as one sequence */
@keyframes alert-sequence {
  0%      { transform: translateX(120%); opacity: 0; }     /* off-screen right */
  12%     { transform: translateX(0);    opacity: 1; }     /* slid in by ~600ms */
  92%     { transform: translateX(0);    opacity: 1; }     /* hold until 4400ms */
  100%    { transform: translateX(0);    opacity: 0; }     /* fade out by 4800ms */
}

/* Alert card structure */
.alert-card .label {
  font-family: var(--type-mono-family);
  font-size: 11px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--color-ink-3);
  margin: 0 0 8px;
}
.alert-card .copy {
  font-family: var(--type-display-family);
  font-weight: 500; font-size: 32px; line-height: 1.18;
  letter-spacing: -0.012em;
  margin: 0;
  color: var(--color-ink);
}
.alert-card .copy .name { color: var(--color-accent); }   /* the dynamic name in accent — the only place accent is used */

/* Variant: inverted card */
.alert-card--inverted {
  background: var(--color-ink); color: var(--color-surface);
  border-color: rgba(251, 250, 249, 0.18);
}
.alert-card--inverted .label { color: rgba(251, 250, 249, 0.55); }
.alert-card--inverted .copy { color: var(--color-surface); }

/* Bracketed variation */
.alert-card--bracketed { border: 0; }
.alert-card--bracketed::before, .alert-card--bracketed::after {
  content: ""; position: absolute; width: 12px; height: 12px;
  border: 1px solid var(--color-ink);
}
.alert-card--bracketed::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.alert-card--bracketed::after { bottom: -1px; right: -1px; border-left: none; border-top: none; }
</style>
</head>
<body>
<!--
Stream Alert Overlay — single file, hash-routed scenes.
Load as OBS browser source at 1920×1080 (transparent background).
Switch via URL hash:
  #follow · #sub · #donation · #raid
Each scene auto-plays its 4.8s alert sequence on load.
Pass dynamic names via URL query: ?name=Sam&amount=10

Variation choices:
  card-style:    <picked>
  type-pressure: <picked>
  color:         <picked>
  position:      <picked>
-->

<section id="scene-follow" class="scene">
  <div class="alert-card">
    <p class="label">— follow</p>
    <p class="copy"><span class="name">[name]</span> just followed.</p>
  </div>
</section>

<section id="scene-sub" class="scene">
  <div class="alert-card">
    <p class="label">— subscriber</p>
    <p class="copy"><span class="name">[name]</span> subscribed.</p>
  </div>
</section>

<section id="scene-donation" class="scene">
  <div class="alert-card">
    <p class="label">— tip</p>
    <p class="copy"><span class="name">[name]</span> sent $<span class="amount">[amount]</span>.</p>
  </div>
</section>

<section id="scene-raid" class="scene">
  <div class="alert-card">
    <p class="label">— raid</p>
    <p class="copy"><span class="name">[name]</span> raided with <span class="count">[count]</span>.</p>
  </div>
</section>

<script>
function activateScene() {
  var hash = (window.location.hash || '#follow').split('?')[0].slice(1);
  var scenes = document.querySelectorAll('.scene');
  scenes.forEach(function(el) { el.classList.toggle('is-active', el.id === 'scene-' + hash); });
  // Parse URL query for dynamic substitution (name, amount, count)
  var params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  ['name', 'amount', 'count'].forEach(function(key) {
    var val = params.get(key);
    if (!val) return;
    document.querySelectorAll('.scene.is-active .' + key).forEach(function(el) { el.textContent = val; });
  });
}
window.addEventListener('hashchange', activateScene);
activateScene();
</script>
</body>
</html>
```

### 5. Document the OBS setup for the user

After writing the file:

> OBS alert overlay generated at `./design/<brand-slug>/artifacts/obs-alert-overlay.html`.
>
> **OBS setup (one alert source per scene):**
> 1. Sources → Add → Browser
> 2. Local file → point to `obs-alert-overlay.html`
> 3. Width: 1920, Height: 1080
> 4. URL hash: `#follow` (or other scene)
> 5. Optional dynamic name via query: `…/obs-alert-overlay.html#follow?name={user}`
>
> Connect your alert provider (Streamlabs / StreamElements) to trigger a refresh of the browser source per event so the animation re-plays.
>
> Variation: `<card-style>` × `<type-pressure>` × `<color>` × `<position>`.

### 6. Verify

- [ ] Single file, 1920×1080, transparent body background (CRITICAL — OBS compositing depends on this)
- [ ] All 4 scenes present with `.is-active` toggle via hash
- [ ] **One animation per scene** — the slide-in + hold + fade is a single sequence (per anti-patterns §8)
- [ ] No decorative motion outside the alert sequence
- [ ] Variation choice consistent across all 4 scenes
- [ ] **Read `../design-anti-patterns.md` and verify the artifact violates none of its rules.** Pay special attention to §3 (no accent on a single punctuation mark — but accent on the dynamic name token IS allowed because it's doing semantic work, marking the new entity), §5 (no editorial-cosplay markers), and §8 (animation discipline)
- [ ] Dynamic name span uses `--color-accent` ONLY when the name is the new entity (not as decoration)

## Rules

- **Single file always.** OBS loads one URL; multiple files would defeat the purpose.
- **Transparent background — hard requirement.** `body { background: transparent }` must be present.
- **One animation per scene.** Slide-in + hold + fade is ONE sequence. Adding a separate spinner or pulse would be two animations — forbidden.
- **No sound.** This is a visual artifact. Audio belongs to the streaming software's alert config, not the overlay.
- **Dynamic substitution via URL query.** Name, amount, count are passed in by the streaming tool — the artifact must accept them via `?name=...` parsing.
- **Token-pure.** Same rules as other platform skills.
- **Anti-pattern compliance.** This skill defers to `../design-anti-patterns.md` as the canonical anti-tell list.
