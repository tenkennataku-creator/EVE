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

**Spine player version** — Currently pinned to `@4.0` for NIKKE compatibility.
NIKKE game assets (Rapi, Neon, Snow White, etc.) were exported with Spine **4.0**.
The spineboy demo uses 4.2 — switch the CDN link in `index.html` if reverting to demo.

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

Two Gemini 2.0 models, cycled by tapping the model badge in the UI:

- `gemini-2.0-flash` — fast, capable (default)
- `gemini-2.0-flash-lite` — lighter, lower latency

Both are free via Google AI Studio key.

## NIKKE Character Layer

NIKKE spine assets use Spine **4.0** format. Assets are loaded directly from
`raw.githubusercontent.com/nikke-db/nikke-db.github.io` which has open CORS —
**no self-hosting required**.

Asset URL pattern:
```
https://raw.githubusercontent.com/nikke-db/nikke-db.github.io/main/l2d/{id}/{id}_00.skel
https://raw.githubusercontent.com/nikke-db/nikke-db.github.io/main/l2d/{id}/{id}_00.atlas
https://raw.githubusercontent.com/nikke-db/nikke-db.github.io/main/l2d/{id}/{id}_00.png
```

Character IDs follow the pattern `c` + 3 digits. Known characters:

| ID | Name | ID | Name |
|---|---|---|---|
| c010 | Rapi | c011 | Neon |
| c220 | Snow White | c222 | Scarlet |
| c260 | Modernia | c191 | Alice |
| c270 | Blanc | c271 | Noir |
| c170 | Privaty | c200 | Rupee |

To add a new character:
1. Find their ID from `Characters.json` in the nikke-db repo.
2. Extract animation names: `curl -s ".../{id}/{id}_00.skel" | strings | grep -E "^[a-z][a-z_]+$"`
3. Add a new `nikke(id, name, animations)` entry in `src/config/character.js`.
4. Add them to the `CHARACTERS` array for UI cycling.

Common animation names (vary per character):
- `idle` → IDLE / THINKING  
- `delight` → HAPPY
- `pain` or `angry` → SAD
- `special` or `action` → EXCITED
- `talk_start` → THINKING

Note: `nikke-db.github.io` returns 403 from server-side requests; use
`raw.githubusercontent.com` instead (CORS open, works from browsers).

## Local Dev

```bash
npm install
npm run dev          # http://localhost:5173
```

Set `VITE_GEMINI_API_KEY=AIza...` in a `.env` file to skip the API key prompt.

## Deploy

Push to `dev` branch → GitHub Actions builds and deploys automatically to:
`https://tenkennataku-creator.github.io/EVE/`
