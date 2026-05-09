// ── Character Configuration ────────────────────────────────────────────────
// Set `character` at the bottom to switch the active character.
// NIKKE assets must be placed in /public/assets/{id}/ before enabling them.
// NIKKE characters need spine-player @3.8 — swap both CDN lines in index.html.

export const DEMO_CHARACTER = {
  name: 'Spineboy',
  spineVersion: '4.2',
  skelUrl: 'https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy-ess.skel',
  atlasUrl: 'https://esotericsoftware.com/files/examples/4.2/spineboy/export/spineboy.atlas',
  animations: {
    IDLE:     'idle',
    HAPPY:    'walk',
    SAD:      'death',
    EXCITED:  'run',
    THINKING: 'idle',
  },
}

// ── NIKKE Characters ──────────────────────────────────────────────────────
// Uncomment the character whose files you placed in /public/assets/{id}/
// Animation names come from the .atlas file — check [animations] section.

// export const NIKKE_NEON = {
//   name: 'Neon',
//   spineVersion: '3.8',
//   skelUrl: '/EVE/assets/neon/neon.skel',
//   atlasUrl: '/EVE/assets/neon/neon.atlas',
//   animations: {
//     IDLE:     'idle',
//     HAPPY:    'victory',
//     SAD:      'hit',
//     EXCITED:  'skill',
//     THINKING: 'idle',
//   },
// }

// export const NIKKE_RAPI = {
//   name: 'Rapi',
//   spineVersion: '3.8',
//   skelUrl: '/EVE/assets/rapi/rapi.skel',
//   atlasUrl: '/EVE/assets/rapi/rapi.atlas',
//   animations: {
//     IDLE:     'idle',
//     HAPPY:    'victory',
//     SAD:      'hit',
//     EXCITED:  'skill',
//     THINKING: 'idle',
//   },
// }

// export const NIKKE_ANIS = {
//   name: 'Anis',
//   spineVersion: '3.8',
//   skelUrl: '/EVE/assets/anis/anis.skel',
//   atlasUrl: '/EVE/assets/anis/anis.atlas',
//   animations: {
//     IDLE:     'idle',
//     HAPPY:    'victory',
//     SAD:      'hit',
//     EXCITED:  'skill',
//     THINKING: 'idle',
//   },
// }

// ── Active character ───────────────────────────────────────────────────────
export const character = DEMO_CHARACTER
