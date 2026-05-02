---
name: obs-scene-pack
description: Generate an OBS scene pack — single 1920×1080 transparent HTML file with hash-routed scenes for additional broadcast layouts beyond the basic stream-overlay set. Scenes (#just-chatting, #fullscreen-game, #guest-split) extend the brand vocabulary established by the existing stream-overlay skill (corner-frame L-marks, wordmark, hairline rules). Transparent background throughout for OBS compositing. Reads ./design/<brand-slug>/DESIGN.md, tokens.css, and components.html. Triggers include "obs scene pack", "stream scenes", "just chatting layout", "guest split layout", "/obs-scene-pack".
---

# Skill: obs-scene-pack

Produces ONE self-contained `obs-scene-pack.html` file at 1920×1080 with **transparent background** and three hash-routed scenes designed for distinct broadcast contexts:

| Hash | Use | Treatment |
|---|---|---|
| `#just-chatting` | host-on-camera segments (no game, no screen share) | Centered webcam frame + lower-third for show title + brand chrome at edges |
| `#fullscreen-game` | gameplay or screen-share dominates | Minimal corner-only brand watermark (does not obscure content) |
| `#guest-split` | host + guest both on camera | Two portrait frame zones side-by-side with named lower-thirds |

This skill EXTENDS the existing `stream-overlay` skill (which provides #starting / #brb / #webcam / #lower-third / #ending). Use them in combination for a complete broadcast workflow — `stream-overlay.html` for the per-stream chrome scenes; `obs-scene-pack.html` for the in-stream layout switches.

## When to use

- User has a basic stream overlay set already (from `/stream-overlay`) and needs additional in-stream layouts
- Stream format includes guest interviews, just-chatting segments, or gameplay
- A `DESIGN.md` exists for the brand

## Inputs

- **Required:** brand slug
- **Required:** show title / stream tagline (for the just-chatting lower-third)
- **Required:** streamer name + role/handle (for chrome on all scenes)
- **Optional:** guest scene defaults (placeholder names + roles for the split scene)
- **Optional:** webcam/guest frame dimensions if non-default

## Output

`./design/<brand-slug>/artifacts/obs-scene-pack.html` (single file — overwrite OK; canonical scene-pack for the brand)

## Steps

### 1. Verify brand exists

```bash
test -f ./design/<brand-slug>/tokens.css
```

### 2. Gather the brief

Ask in one message:

```
1. Show title / stream tagline (for just-chatting lower-third — e.g. "Live coding · payments stack")
2. Streamer name + handle (for chrome — e.g. "Shane Logsdon · @shanelogsdon")
3. Default webcam frame size: 480×270 (default) | 640×360 | 320×180
4. Guest split — default frame size: 720×405 each (16:9 each side); placeholder names for default rendering
```

### 3. Pick variation — applies to ALL scenes (consistency with existing stream-overlay set)

This pack must visually match the user's existing `stream-overlay.html` so the broadcast feels like one system, not separate sets:

- `chrome:` `bracketed` (corner-frame L-marks — brand-canonical lineart) | `chromeless` (pure type with hairlines, no brackets)
- `mark-placement:` matches existing stream-overlay (typically lower-left or lower-right; consistent across both files)
- `accent-usage:` matches existing stream-overlay (e.g. amber pulse-dot on "live" indicator)

If the user has not run `/stream-overlay` for this brand, suggest running it first so the visual choices align.

### 4. Generate the HTML

Template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><Brand> — OBS scene pack</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=<families>&display=swap">
<style>
/* Embed tokens.css verbatim */
<contents of tokens.css>

/* Critical: transparent background for OBS compositing */
html, body { margin: 0; padding: 0; width: 1920px; height: 1080px; overflow: hidden; background: transparent; font-family: var(--type-sans-family); color: var(--color-ink); }

.scene { position: fixed; inset: 0; width: 1920px; height: 1080px; display: none; }
.scene.is-active { display: block; }

/* Brand wordmark in corner — positioned by variation */
.mark-corner {
  position: absolute;
  bottom: 64px; left: 80px;
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--type-display-family); font-weight: 600; font-size: 22px;
  letter-spacing: -0.005em; color: var(--color-ink);
  background: var(--color-surface); padding: 6px 12px;
  border: 1px solid var(--color-rule);
}

/* === #just-chatting === */
#scene-just-chatting .topbar {
  position: absolute; top: 64px; left: 80px;
  display: flex; flex-direction: column; gap: 12px;
}
#scene-just-chatting .topbar .label {
  font-family: var(--type-display-family); font-weight: 600;
  font-variant-caps: small-caps; font-feature-settings: 'smcp';
  text-transform: lowercase; font-size: 18px; letter-spacing: 0.1em;
  color: var(--color-ink); background: var(--color-surface); padding: 8px 14px;
  border: 1px solid var(--color-rule);
}
#scene-just-chatting .cam {
  position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -45%);
  width: 720px; height: 405px;
  background: transparent;
  border: 1px solid var(--color-rule);
}
#scene-just-chatting .cam::before, #scene-just-chatting .cam::after {
  content: ""; position: absolute; width: 14px; height: 14px;
}
#scene-just-chatting .cam::before { top: -1px; left: -1px; border-top: 1px solid var(--color-ink); border-left: 1px solid var(--color-ink); }
#scene-just-chatting .cam::after { bottom: -1px; right: -1px; border-bottom: 1px solid var(--color-ink); border-right: 1px solid var(--color-ink); }
#scene-just-chatting .lower-third {
  position: absolute;
  bottom: 96px; left: 80px; right: 80px;
  display: grid; grid-template-columns: auto 1fr auto;
  gap: 32px; align-items: baseline;
  background: var(--color-surface);
  padding: 16px 24px;
  border: 1px solid var(--color-rule);
}
#scene-just-chatting .lower-third .name {
  font-family: var(--type-display-family); font-weight: 500;
  font-size: 32px; letter-spacing: -0.008em; color: var(--color-ink);
}
#scene-just-chatting .lower-third .role {
  font-family: var(--type-mono-family); font-size: 14px;
  letter-spacing: 0.06em; color: var(--color-ink-3);
}
#scene-just-chatting .lower-third .handles {
  font-family: var(--type-mono-family); font-size: 14px;
  letter-spacing: 0.06em; color: var(--color-ink-3);
}

/* === #fullscreen-game (corner watermark only) === */
#scene-fullscreen-game .corner-watermark {
  position: absolute;
  bottom: 32px; right: 40px;
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--type-display-family); font-weight: 600;
  font-size: 16px; letter-spacing: -0.005em;
  color: var(--color-ink);
  background: var(--color-surface);
  padding: 6px 10px;
  border: 1px solid var(--color-rule);
  opacity: 0.85;
}

/* === #guest-split === */
#scene-guest-split .topbar {
  position: absolute; top: 56px; left: 80px; right: 80px;
  display: flex; justify-content: space-between; align-items: baseline;
  background: var(--color-surface);
  padding: 10px 16px;
  border: 1px solid var(--color-rule);
  font-family: var(--type-display-family); font-weight: 600;
  font-variant-caps: small-caps; font-feature-settings: 'smcp';
  text-transform: lowercase; font-size: 14px; letter-spacing: 0.1em;
  color: var(--color-ink);
}
#scene-guest-split .frames {
  position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -45%);
  display: grid; grid-template-columns: 720px 720px;
  gap: 32px;
}
#scene-guest-split .frame {
  width: 720px; height: 405px;
  background: transparent;
  border: 1px solid var(--color-rule);
  position: relative;
}
#scene-guest-split .frame::before, #scene-guest-split .frame::after {
  content: ""; position: absolute; width: 12px; height: 12px;
}
#scene-guest-split .frame::before { top: -1px; left: -1px; border-top: 1px solid var(--color-ink); border-left: 1px solid var(--color-ink); }
#scene-guest-split .frame::after { bottom: -1px; right: -1px; border-bottom: 1px solid var(--color-ink); border-right: 1px solid var(--color-ink); }
#scene-guest-split .frame .label {
  position: absolute; top: 100%; left: 0;
  margin-top: 12px;
  background: var(--color-surface);
  padding: 6px 10px;
  border: 1px solid var(--color-rule);
  font-family: var(--type-mono-family); font-size: 13px; letter-spacing: 0.06em;
  color: var(--color-ink);
}
#scene-guest-split .frame .label .role {
  display: block; margin-top: 2px; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.18em; color: var(--color-ink-3);
}
</style>
</head>
<body>
<!--
OBS Scene Pack — single file, hash-routed.
Load as OBS browser source at 1920×1080 (transparent background).
Switch via URL hash:
  #just-chatting · #fullscreen-game · #guest-split

Variation choices:
  chrome:          <picked>
  mark-placement:  <picked>
  accent-usage:    <picked>
-->

<section id="scene-just-chatting" class="scene">
  <div class="topbar">
    <span class="label">— live · just chatting</span>
  </div>
  <div class="cam"></div>
  <div class="lower-third">
    <span class="name">[Streamer name]</span>
    <span class="role">[show title / topic]</span>
    <span class="handles">[handle / handle]</span>
  </div>
</section>

<section id="scene-fullscreen-game" class="scene">
  <span class="corner-watermark">[Wordmark]</span>
</section>

<section id="scene-guest-split" class="scene">
  <div class="topbar">
    <span>— live · guest interview</span>
    <span>[show title]</span>
  </div>
  <div class="frames">
    <div class="frame">
      <span class="label">[Host name]<span class="role">host</span></span>
    </div>
    <div class="frame">
      <span class="label">[Guest name]<span class="role">guest · [role]</span></span>
    </div>
  </div>
</section>

<script>
function activateScene() {
  var hash = (window.location.hash || '#just-chatting').slice(1);
  var scenes = document.querySelectorAll('.scene');
  var matched = false;
  scenes.forEach(function(el) {
    var isMatch = el.id === 'scene-' + hash;
    el.classList.toggle('is-active', isMatch);
    if (isMatch) matched = true;
  });
  if (!matched) document.getElementById('scene-just-chatting').classList.add('is-active');
}
window.addEventListener('hashchange', activateScene);
activateScene();
</script>
</body>
</html>
```

### 5. Verify

- [ ] Single file, 1920×1080, transparent body background (CRITICAL — OBS compositing depends on this)
- [ ] All 3 scenes present with `.is-active` toggle via hash
- [ ] Cam / guest frames have `background: transparent` so the live video shows through
- [ ] Brand chrome (mark, lower-thirds, top-bars) sits OVER backed cream surfaces with hairline borders so it stays legible against unknown video content
- [ ] Variation choice consistent across all 3 scenes AND consistent with the brand's existing stream-overlay if one exists
- [ ] **Read `../design-anti-patterns.md` and verify the artifact violates none of its rules.** Pay special attention to sections 4 (no top-metadata-row eyebrow disguise across scenes), 5 (no editorial-cosplay markers), and 8 (no decorative animations on broadcast chrome)
- [ ] No animations of any kind (broadcast chrome should be still — animation belongs in alert overlays, not scene layouts)

> OBS scene pack at `./design/<brand-slug>/artifacts/obs-scene-pack.html`.
>
> Variation: `<chrome>` × `<mark-placement>` × `<accent-usage>`.
>
> **OBS setup:** Add as a Browser Source → Local file → 1920×1080 → URL with `#just-chatting` (or other scene). Create one OBS scene per hash, all pointing to the same file with different URL hash. The transparent background composites over your video / game capture / guest layout.

## Rules

- **Single file always.** OBS loads one URL per browser source; multiple files defeat the purpose of hash routing.
- **Transparent background — hard requirement.** Scene compositing breaks without it.
- **Cam frames stay transparent.** They're cutouts for live video to show through. The brand chrome wraps around them, never inside them.
- **Backed cream surfaces for any text overlay.** Text on transparent over arbitrary video is unreadable; lower-thirds and top-bars need a 1px-bordered cream backing for legibility.
- **No animations.** This pack is for steady broadcast layouts; alerts go in `obs-alert-overlay`.
- **Token-pure.** Every visual value via `var(--*)` from tokens.css.
- **Anti-pattern compliance.** This skill defers to `../design-anti-patterns.md` as the canonical anti-tell list.
