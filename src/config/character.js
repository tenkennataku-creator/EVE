// ── Character Configuration ────────────────────────────────────────────────
// Set `character` at the bottom to switch the active character.
// Assets loaded directly from raw.githubusercontent.com (CORS open, no hosting needed).
// Spine version is per-character — the app reloads with the right runtime when switching.

const NIKKE_CDN = 'https://raw.githubusercontent.com/nikke-db/nikke-db.github.io/main/l2d'

function nikke(id, name, spineVersion, animations) {
  return {
    name,
    spineVersion,
    skelUrl:  `${NIKKE_CDN}/${id}/${id}_00.skel`,
    atlasUrl: `${NIKKE_CDN}/${id}/${id}_00.atlas`,
    animations,
  }
}

// ── NIKKE characters — Spine 4.0.47 ──────────────────────────────────────
export const NIKKE_RAPI = nikke('c010', 'Rapi', '4.0', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'special',
  THINKING: 'talk_start',
})

export const NIKKE_NEON = nikke('c011', 'Neon', '4.0', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'action',
  THINKING: 'talk_start',
})

export const NIKKE_SNOW_WHITE = nikke('c220', 'Snow White', '4.0', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'pain',
  EXCITED:  'special',
  THINKING: 'talk_start',
})

export const NIKKE_MODERNIA = nikke('c260', 'Modernia', '4.0', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'pain',
  EXCITED:  'action',
  THINKING: 'talk_start',
})

// ── NIKKE characters — Spine 4.1.20 ──────────────────────────────────────
export const NIKKE_SCARLET = nikke('c222', 'Scarlet', '4.1', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'pain',
  EXCITED:  'action',
  THINKING: 'talk_start',
})

export const NIKKE_C223 = nikke('c223', 'c223', '4.1', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'special',
  THINKING: 'idle',
})

export const NIKKE_C810 = nikke('c810', 'c810', '4.1', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'action',
  THINKING: 'idle',
})

// ── Character list for dropdown ────────────────────────────────────────────
export const VRM_621 = {
  name: '幻覚',
  type: 'vrm',
  modelUrl: '/EVE/models/621_%E5%B9%BB%E8%A6%9A_.vrm',
}

export const CHARACTERS = [
  NIKKE_RAPI,
  NIKKE_NEON,
  NIKKE_SNOW_WHITE,
  NIKKE_MODERNIA,
  NIKKE_SCARLET,
  NIKKE_C223,
  NIKKE_C810,
  VRM_621,
]

// ── Active character ───────────────────────────────────────────────────────
export const character = NIKKE_RAPI
