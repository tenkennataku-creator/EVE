# EVE

An AI chatbot with an animated NIKKE game character as its face. The character reacts emotionally to the conversation — switching animations based on mood in real time.

Live: **https://tenkennataku-creator.github.io/EVE/**

---

## Using the App

### First launch
1. Open the URL above in Chrome on your phone (or any browser)
2. Enter your **Google AI Studio API key** (`AIza...`) and tap **Start EVE**
   - Free key at **aistudio.google.com/apikey** — no credit card needed
   - The key is saved locally; you won't need to enter it again

### Installing to your home screen (Android)
1. Open the URL in Chrome
2. Tap the three-dot menu → **Add to Home screen**
3. The app opens fullscreen like a native app from then on

> If you update the app and the old version is stuck: go to Chrome Settings → Site settings → find the EVE URL → Clear & reset, then re-add to home screen.

### Chatting
- Type in the **Talk to EVE...** box and tap **Send** (or press Enter)
- EVE responds with a message and the character animates to match the emotion
- Tap **Voice off / Voice on** to toggle text-to-speech readout

### Switching characters
Tap the **green dropdown** in the bottom-right corner of the character viewer. Available characters:

| Name | Spine version |
|---|---|
| Rapi | 4.0 |
| Neon | 4.0 |
| Snow White | 4.0 |
| Modernia | 4.0 |
| Scarlet | 4.1 |
| c223 | 4.1 |
| c810 | 4.1 |

Switching between a 4.0 and 4.1 character causes a quick automatic reload to swap the spine runtime — your character selection is restored immediately after.

### Switching AI models
Tap the **model badge** in the bottom-right corner to cycle between:
- `gemma-4-31b-it` — larger, more capable (default)
- `gemma-4-26b-a4b-it` — mixture-of-experts, different personality

Both are free via Google AI Studio.

---

## How It Works

| Layer | What it does |
|---|---|
| **React + Vite** | UI framework, compiled and deployed via GitHub Actions |
| **Spine Player** | Renders the 2D animated character (EsotericSoftware) |
| **NIKKE assets** | Character skeletons loaded from `raw.githubusercontent.com` — open CORS, no hosting needed |
| **Google Gemma 4** | AI responses via Gemini REST API (free tier) |
| **Emotion FSM** | 5-state machine (IDLE / HAPPY / SAD / EXCITED / THINKING) maps AI output to animations |
| **Web Speech API** | Browser-native text-to-speech |
| **PWA manifest** | Enables home screen install and standalone display |

### Emotion → animation mapping

| Emotion | Trigger | Animation |
|---|---|---|
| IDLE | Neutral / startup | `idle` |
| HAPPY | Greetings, good news | `delight` |
| SAD | Apologies, bad news | `pain` or `angry` |
| EXCITED | Surprises, enthusiasm | `special` or `action` |
| THINKING | Questions, mid-reply | `talk_start` or `idle` |

---

## Adding a new character

1. Find the character's ID (format: `c` + 3 digits) from the [nikke-db Characters.json](https://raw.githubusercontent.com/nikke-db/nikke-db.github.io/main/js/json/Characters.json)
2. Check their Spine version and animation names:
   ```bash
   curl -s "https://raw.githubusercontent.com/nikke-db/nikke-db.github.io/main/l2d/{id}/{id}_00.skel" \
     | strings | grep -E "^[a-z][a-z_]+$" | sort -u
   ```
3. Note the version from the binary header (look for `4.0.` or `4.1.` in the strings output)
4. Add an entry to `src/config/character.js`:
   ```js
   export const NIKKE_NAME = nikke('c999', 'Name', '4.0', {
     IDLE:     'idle',
     HAPPY:    'delight',
     SAD:      'pain',
     EXCITED:  'special',
     THINKING: 'talk_start',
   })
   ```
5. Add the export to the `CHARACTERS` array at the bottom of the file
6. Push to the branch — GitHub Actions deploys automatically

---

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

Set `VITE_GEMINI_API_KEY=AIza...` in a `.env` file to skip the API key prompt on dev.

## Deployment

Push to `claude/mobile-environment-exploration-2ATAz` (or `main`) → GitHub Actions builds and deploys to GitHub Pages automatically.
