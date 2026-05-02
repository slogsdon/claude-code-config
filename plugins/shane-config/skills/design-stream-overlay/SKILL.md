---
name: design-stream-overlay
description: Generate a single 1920×1080 stream overlay HTML file with hash-routed scenes (#starting, #brb, #webcam, #lower-third, #ending). Designed to load as a single OBS browser source — change the URL hash to switch scenes. Reads ./design/<brand-slug>/DESIGN.md, tokens.css, and components.html. Triggers include "stream overlay", "twitch overlay", "obs overlay", "/stream-overlay".
---

# Skill: stream-overlay

Produces ONE self-contained `stream-overlay.html` file at 1920×1080 that contains all the standard live-stream scenes. JavaScript reads the URL hash and shows only the matching scene. OBS / Streamlabs / Twitch Studio loads the file once as a browser source; switching scenes is just changing the hash (e.g. `file://.../stream-overlay.html#brb`).

## When to use

- User streams on Twitch, YouTube Live, Kick, etc. and needs branded overlay scenes
- A `DESIGN.md` exists for the brand

## Inputs

- **Required:** brand slug
- **Optional:** stream name / show title, social handles to display, scene customization (which scenes to include — defaults to all 5)

## Output

`./design/<brand-slug>/artifacts/stream-overlay.html` (single file — overwrite OK; the file is the brand's canonical overlay)

## Scenes (default 5)

| Hash | Purpose | Layout |
|---|---|---|
| `#starting` | "Starting Soon" pre-stream waiting screen | Full-canvas headline + countdown placeholder + brand mark |
| `#brb` | "Be Right Back" mid-stream pause | Full-canvas message + small brand mark, intentionally calm |
| `#webcam` | Webcam frame — sized + positioned for the streamer's webcam capture | Cam window region defined as a transparent cutout with frame around it; rest of canvas shows brand chrome (sidebar with stream title, lower-third with handles) |
| `#lower-third` | Just a lower-third name plate at the bottom — for code-only segments | Bottom 20% of canvas: name + role + handles, rest fully transparent |
| `#ending` | "Thanks for watching" outro screen | Full-canvas thank-you + handles + "Subscribe" prompt (rendered as text, not a button graphic) |

## Steps

### 1. Verify brand exists

```bash
test -f ./design/<brand-slug>/tokens.css
```

### 2. Gather the brief

Ask in one message:

```
1. Stream name / show title (e.g. "Live Coding with Shane" or just leave blank)
2. Social handles to display (Twitter/X, GitHub, website, etc.) — comma-separated
3. Streamer name + role for the lower-third (e.g. "Shane Logsdon · Indie Dev")
4. Webcam position for #webcam scene: top-right | bottom-right | bottom-left | top-left (default: bottom-right)
5. Webcam size: 480x270 | 640x360 | 320x180 (default: 480x270, the typical 16:9 cam window)
6. Any scenes to skip? (default: include all 5)
```

### 3. Pick variation (single set, applied across all scenes for coherence)

Unlike single-artifact skills, the overlay must be visually consistent across scenes. Pick variation ONCE for the whole file:

- **Chrome style**: `hairline` (thin rules + restrained type) | `bracketed` (corner brackets framing each scene) | `gridded` (subtle grid-paper background) | `block` (solid color blocks delineating zones) | `chromeless` (no rules, no brackets — pure type and color)
- **Type pressure**: `display-led` (large display type carries scene state) | `mono-led` (mono labels dominate, very technical feel)
- **Color usage**: `monochrome` | `single-accent-on-cam-frame` | `inverted-on-pause-scenes`
- **Brand mark placement**: `top-left` | `bottom-right` | `top-bar` | `corner-mark` | `none` (rely on the streamer's voice + camera, not a chrome mark)

**Anti-tell guardrails** (apply across all scenes):
- Read `../design-anti-patterns.md` and verify scene chrome violates none of its rules. Pay special attention to sections 5 (editorial cosplay markers — no `§ 01`, `EP. 01`, `Episode`), 4 (no top-metadata-row eyebrow disguises across scenes), and 8 (animations — at most ONE functional animation across all scenes; a pulsing dot AND a blinking cursor counts as two).
- The pause-scene headline should be a real claim, not a template default ("Starting Soon."/"Right back."/"Thanks for watching." are placeholders — substitute with something brand-voiced if the user supplies a tone).

### 4. Generate the HTML

Single self-contained file with all scenes as `<section>` elements. JS toggles visibility by hash.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><Brand> — Stream Overlay</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=<families>&display=swap">
<style>
/* Embed tokens.css verbatim */
<contents of tokens.css>

html, body { margin: 0; padding: 0; width: 1920px; height: 1080px; overflow: hidden; background: transparent; font-family: var(--type-body-md-family); color: var(--color-ink); }

/* All scenes start hidden; JS reveals the one matching the hash */
.scene { position: fixed; inset: 0; width: 1920px; height: 1080px; display: none; box-sizing: border-box; }
.scene.is-active { display: block; }

/* Full-canvas scenes get a brand surface background */
#scene-starting, #scene-brb, #scene-ending { background: var(--color-surface); }

/* #webcam and #lower-third are transparent — OBS composites the webcam underneath */
#scene-webcam, #scene-lower-third { background: transparent; }

/* Eyebrow / mono label */
.eyebrow {
  font: var(--type-label-caps-weight) var(--type-label-caps-size)/var(--type-label-caps-leading) var(--type-label-caps-family);
  letter-spacing: var(--type-label-caps-tracking);
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

/* Display headline */
.headline {
  font-family: var(--type-display-xl-family);
  font-weight: var(--type-display-xl-weight);
  letter-spacing: var(--type-display-xl-tracking);
  font-size: clamp(120px, 12vw, 180px);
  line-height: 1;
  margin: 0;
}

/* Centered scene content (for #starting, #brb, #ending) */
.scene--centered { display: flex; flex-direction: column; align-items: <by variation>; justify-content: center; padding: var(--space-4xl); }

/* Webcam frame — transparent inner, framed outer */
.cam-frame {
  position: absolute;
  /* Position from variation: bottom-right default */
  bottom: var(--space-xl);
  right: var(--space-xl);
  width: 480px; /* matches user-chosen size */
  height: 270px;
  border: 2px solid var(--color-ink);
  background: transparent; /* OBS shows webcam through this */
}
.cam-frame::after {
  /* Optional name plate beneath the cam frame */
  content: "<streamer name> · <role>";
  position: absolute;
  top: 100%; left: 0;
  margin-top: var(--space-xs);
  font: var(--type-label-caps-weight) var(--type-label-caps-size)/var(--type-label-caps-leading) var(--type-label-caps-family);
  letter-spacing: var(--type-label-caps-tracking);
  text-transform: uppercase;
  color: var(--color-ink);
  /* Add a subtle background for legibility over screen content */
  background: var(--color-surface);
  padding: var(--space-2xs) var(--space-xs);
}

/* Sidebar info column on #webcam scene */
.cam-sidebar {
  position: absolute;
  top: var(--space-xl);
  left: var(--space-xl);
  max-width: 320px;
  background: var(--color-surface);
  padding: var(--space-md);
  border: 1px solid var(--color-rule);
}
.cam-sidebar h2 { font: var(--type-headline-sm-weight) var(--type-headline-sm-size)/var(--type-headline-sm-leading) var(--type-headline-sm-family); margin: 0 0 var(--space-xs); }
.cam-sidebar .handles { font-family: var(--type-code-family); font-size: var(--type-body-sm-size); color: var(--color-ink-soft); margin: 0; line-height: 1.6; }

/* Lower-third (used both as standalone scene and inside webcam scene) */
.lower-third {
  position: absolute;
  bottom: 0; left: 0;
  width: 100%;
  background: var(--color-ink);
  color: var(--color-surface);
  padding: var(--space-md) var(--space-xl);
  display: flex;
  align-items: baseline;
  gap: var(--space-xl);
  box-sizing: border-box;
}
.lower-third .name { font: var(--type-headline-sm-weight) var(--type-headline-sm-size)/var(--type-headline-sm-leading) var(--type-headline-sm-family); margin: 0; }
.lower-third .role { font-family: var(--type-label-caps-family); letter-spacing: var(--type-label-caps-tracking); text-transform: uppercase; font-size: 14px; opacity: 0.75; }
.lower-third .handles { margin-left: auto; font-family: var(--type-code-family); font-size: var(--type-body-sm-size); opacity: 0.85; }
</style>
</head>
<body>
<!--
Stream Overlay — single file, hash-routed scenes
Load this file as an OBS Browser Source (1920x1080).
Switch scenes by changing the URL hash:
  #starting     → "Starting Soon"
  #brb          → "Be Right Back"
  #webcam       → live coding scene with webcam frame
  #lower-third  → just a name plate (transparent rest)
  #ending       → outro

Variation choices:
  chrome: <picked>
  type-pressure: <picked>
  color: <picked>
  brand-mark: <picked>
-->

<section id="scene-starting" class="scene scene--centered">
  <span class="eyebrow"><Brand mark / show title></span>
  <h1 class="headline">Starting Soon.</h1>
  <p class="eyebrow" style="margin-top: var(--space-lg);">Stream begins shortly · grab a coffee</p>
</section>

<section id="scene-brb" class="scene scene--centered">
  <span class="eyebrow"><Brand mark / show title></span>
  <h1 class="headline">Right back.</h1>
</section>

<section id="scene-webcam" class="scene">
  <aside class="cam-sidebar">
    <span class="eyebrow"><Show title / "Now playing"></span>
    <h2><Stream name></h2>
    <p class="handles">
      <handle 1><br>
      <handle 2><br>
      <handle 3>
    </p>
  </aside>
  <div class="cam-frame"></div>
</section>

<section id="scene-lower-third" class="scene">
  <div class="lower-third">
    <h2 class="name"><Streamer name></h2>
    <span class="role"><Role></span>
    <span class="handles"><handle 1> · <handle 2></span>
  </div>
</section>

<section id="scene-ending" class="scene scene--centered">
  <span class="eyebrow">Stream ended</span>
  <h1 class="headline">Thanks for watching.</h1>
  <p class="eyebrow" style="margin-top: var(--space-lg);">Subscribe / follow for next session · <handles></p>
</section>

<script>
function activateScene() {
  var hash = (window.location.hash || '#starting').slice(1);
  var scenes = document.querySelectorAll('.scene');
  var matched = false;
  scenes.forEach(function(el) {
    var isMatch = el.id === 'scene-' + hash;
    el.classList.toggle('is-active', isMatch);
    if (isMatch) matched = true;
  });
  if (!matched) {
    // Fallback to starting scene if hash doesn't match
    document.getElementById('scene-starting').classList.add('is-active');
  }
}
window.addEventListener('hashchange', activateScene);
activateScene();
</script>
</body>
</html>
```

### 5. Document the OBS setup for the user

After writing the file, give the user a copy-paste setup block:

> Stream overlay generated at `./design/<brand-slug>/artifacts/stream-overlay.html`.
>
> **OBS setup (one-time):**
> 1. Sources → Add → Browser
> 2. Local file → point to `stream-overlay.html`
> 3. Width: `1920`, Height: `1080`
> 4. Add `#starting` (or your starting scene hash) to the file URL
>
> **Scene switching:** create one OBS scene per hash, each with its own browser source pointing to the same file with a different URL hash:
> - `…/stream-overlay.html#starting`
> - `…/stream-overlay.html#brb`
> - `…/stream-overlay.html#webcam`
> - `…/stream-overlay.html#lower-third`
> - `…/stream-overlay.html#ending`
>
> The `#webcam` and `#lower-third` scenes have transparent backgrounds — composite your webcam / screen capture BENEATH them in OBS.
>
> Variation: `<chrome>` × `<type>` × `<color>` × `<mark>`.

### 6. Verify

- [ ] Single file, 1920×1080, no external deps beyond Google Fonts
- [ ] All 5 scenes present (or whichever subset the user requested)
- [ ] `#webcam` and `#lower-third` have `background: transparent` (critical for OBS compositing)
- [ ] Hash JS works — visiting `file://.../stream-overlay.html#brb` shows ONLY the BRB scene
- [ ] Webcam frame size matches user choice
- [ ] Variation comment present
- [ ] No animated GIFs, no looping CSS animations (distracting for viewers; if requested separately, that's a different artifact)

## Rules

- **Single file always.** The whole point is OBS loads one URL; multiple files would defeat the purpose.
- **Transparent where compositing is needed.** `#webcam` and `#lower-third` MUST have transparent canvas backgrounds.
- **At most one functional animation across all scenes.** A pulsing status dot OR a blinking cursor — never both. Decorative motion is forbidden.
- **Token-pure.** Same rules as other platform skills.
- **Webcam frame respects user-chosen position and size.** Default bottom-right 480×270; honor any other choice.
- **Anti-pattern compliance.** This skill defers to `../design-anti-patterns.md` as the canonical anti-tell list. If you find a new tell in the output, add it there.
