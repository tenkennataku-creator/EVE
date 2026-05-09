# EVE — Project Overview

AI chatbot with an animated 2D character face, driven by an emotional state machine.
The character reacts visually to the conversation — its animation changes based on mood.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Character | EsotericSoftware Spine Player (CDN) |
| AI | Google Gemma 4 via Gemini REST API (free tier) |
| TTS | Web Speech API (browser-native) |
| Hosting | GitHub Pages via GitHub Actions |
| PWA | Web app manifest, standalone display |

## Key Design Decisions

**No SDK** — `src/lib/gemini.js` uses raw `fetch()` instead of `@google/genai`.
Keeps the bundle at ~150KB vs 440KB. API key goes in `.env` as `VITE_GEMINI_API_KEY`
or the user enters it at runtime (persisted in `localStorage`).

**Gemma thinking leak** — Gemma 4 sometimes prepends bullet-point reasoning before
its JSON output. `parseJsonResponse()` scans right-to-left for the last valid
`{message, emotion}` block. This handles most cases. Note: `responseMimeType:
'application/json'` and `thinkingConfig` are both unsupported on Gemma models via
this API — do not add them.

**Spine player version** — Currently pinned to `@4.2` (spineboy demo). NIKKE game
assets were exported with Spine **3.8**. Switching characters requires swapping the
CDN link in `index.html` to `@3.8`.

**PWA cache** — After deploying a breaking change, users may need to clear site data
in Chrome (Settings → Site information → Delete data) then re-add to home screen.
The service worker caches aggressively.

## File Map

```
src/
  App.jsx                 — root; owns all state, API key flow, model cycling
  main.jsx                — React entry point, imports App.css
  styles/App.css          — dark theme, layout, chat bubbles, badges
  config/
    character.js          — active character export + NIKKE template (commented)
  components/
    SpineViewer.jsx       — spine-player wrapper; RAF delay prevents layout-before-CSS bug
    ChatBox.jsx           — message list + thinking dots
    ChatInput.jsx         — text field + send button
  lib/
    gemini.js             — API client, model list, JSON parser
    emotionFSM.js         — 5-state FSM (IDLE/HAPPY/SAD/EXCITED/THINKING)
    tts.js                — Web Speech API wrapper, female voice preference
public/
  manifest.json           — PWA config
  assets/                 — local spine assets go here (git-ignored if large)
index.html                — loads spine-player CDN, PWA meta
vite.config.js            — base: '/EVE/' for GitHub Pages
.github/workflows/
  deploy.yml              — builds on push → deploys dist/ to gh-pages branch
```

## Emotion States

| State | Trigger | Spineboy anim |
|---|---|---|
| IDLE | neutral | idle |
| HAPPY | greetings, good news | walk |
| SAD | apologies, bad news | death |
| EXCITED | surprises, enthusiasm | run |
| THINKING | questions, mid-reply | idle |

FSM valid transitions are in `src/lib/emotionFSM.js`. Not all states can jump to
all others — this prevents jarring animation cuts.

## Models

Two Gemma 4 models, cycled by tapping the model badge in the UI:

- `gemma-4-31b-it` — larger, smarter (default)
- `gemma-4-26b-a4b-it` — mixture-of-experts, different personality

Both are free via Google AI Studio key.

## NIKKE Character Layer (in progress)

NIKKE spine assets use Spine **3.8** format. To add a character:

1. Open [nikke-db](https://www.nikke-db.com) in a browser, navigate to the
   character's live2D/spine viewer, and capture the `.skel`, `.atlas`, and `.png`
   files from DevTools → Network → filter by `skel`/`atlas`.
2. Copy files to `/public/assets/{name}/` (e.g. `public/assets/neon/neon.skel`).
3. Change the spine-player CDN in `index.html` from `@4.2` to `@3.8`.
4. In `src/config/character.js`, uncomment the NIKKE template and update animation
   names to match the ones in the `.atlas` file.
5. Change the last line from `export const character = DEMO_CHARACTER` to
   `export const character = NIKKE_NEON` (or whichever character).

NIKKE animation names vary by character. Common ones:
- `idle` → IDLE / THINKING
- `victory` or `win` → HAPPY / EXCITED
- `hit` or `hurt` → SAD
- `skill` or `special` → EXCITED

Direct CDN fetching from `nikke-db.github.io` is blocked by CORS — assets must be
self-hosted in `/public/`.

## Local Dev

```bash
npm install
npm run dev          # http://localhost:5173
```

Set `VITE_GEMINI_API_KEY=AIza...` in a `.env` file to skip the API key prompt.

## Deploy

Push to `dev` branch → GitHub Actions builds and deploys automatically to:
`https://tenkennataku-creator.github.io/EVE/`
