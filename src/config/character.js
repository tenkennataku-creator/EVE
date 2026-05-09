// ── Character Configuration ────────────────────────────────────────────────
// Set `character` at the bottom to switch the active character.
// NIKKE assets are loaded directly from raw.githubusercontent.com — no
// self-hosting required, CORS is open on that domain.
// NIKKE assets use Spine 4.0; index.html CDN is set to @4.0 accordingly.

// Raw GitHub base for all NIKKE spine assets
const NIKKE_CDN = 'https://raw.githubusercontent.com/nikke-db/nikke-db.github.io/main/l2d'

function nikke(id, name, animations) {
  return {
    name,
    spineVersion: '4.0',
    skelUrl:  `${NIKKE_CDN}/${id}/${id}_00.skel`,
    atlasUrl: `${NIKKE_CDN}/${id}/${id}_00.atlas`,
    animations,
  }
}

// ── Demo character (Spine 4.2) ─────────────────────────────────────────────
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

// ── NIKKE characters (Spine 4.0, loaded directly from GitHub) ─────────────
export const NIKKE_RAPI = nikke('c010', 'Rapi', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'special',
  THINKING: 'talk_start',
})

export const NIKKE_NEON = nikke('c011', 'Neon', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'action',
  THINKING: 'talk_start',
})

export const NIKKE_SNOW_WHITE = nikke('c220', 'Snow White', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'pain',
  EXCITED:  'special',
  THINKING: 'talk_start',
})

export const NIKKE_SCARLET = nikke('c222', 'Scarlet', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'pain',
  EXCITED:  'action',
  THINKING: 'talk_start',
})

export const NIKKE_MODERNIA = nikke('c260', 'Modernia', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'pain',
  EXCITED:  'action',
  THINKING: 'talk_start',
})

// c223 — newer character (not yet in nikke-db JSON; rename once confirmed)
export const NIKKE_C223 = nikke('c223', 'c223', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'special',
  THINKING: 'idle',
})

// c810 — newer collab character (not yet in nikke-db JSON; rename once confirmed)
export const NIKKE_C810 = nikke('c810', 'c810', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'action',
  THINKING: 'idle',
})

// ── Character list for UI cycling ─────────────────────────────────────────
export const CHARACTERS = [
  NIKKE_RAPI,
  NIKKE_NEON,
  NIKKE_SNOW_WHITE,
  NIKKE_SCARLET,
  NIKKE_MODERNIA,
  NIKKE_C223,
  NIKKE_C810,
]

// ── Active character ───────────────────────────────────────────────────────
// Change this line to switch characters.
export const character = NIKKE_RAPI
