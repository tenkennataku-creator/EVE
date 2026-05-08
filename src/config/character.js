// ── Character Configuration ──────────────────────────────────────────────────
// Swap skelUrl/atlasUrl to use a different character.
// For NIKKE assets, serve them locally (see comments below).

export const DEMO_CHARACTER = {
  name: 'Spineboy',
  // Public EsotericSoftware demo — works immediately, no CORS issues
  skelUrl: 'https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy-ess.skel',
  atlasUrl: 'https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy.atlas',
  // Map each emotion state → spine animation name
  animations: {
    IDLE:     'idle',
    HAPPY:    'walk',
    SAD:      'death',
    EXCITED:  'run',
    THINKING: 'idle',
  },
}

// ── NIKKE Character Template ─────────────────────────────────────────────────
// 1. Download your character's .skel / .atlas / .png from nikke-db
// 2. Place them in /public/assets/{name}/
// 3. Swap the URLs below and change spine-player CDN in index.html to @3.8
//
// export const NIKKE_NEON = {
//   name: 'Neon',
//   skelUrl: '/assets/neon/neon.skel',
//   atlasUrl: '/assets/neon/neon.atlas',
//   animations: {
//     IDLE:     'idle',
//     HAPPY:    'victory',
//     SAD:      'hit',
//     EXCITED:  'skill',
//     THINKING: 'idle',
//   },
// }

export const character = DEMO_CHARACTER
