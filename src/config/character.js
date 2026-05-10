// ── Character Configuration ────────────────────────────────────────────────
// Assets loaded directly from raw.githubusercontent.com (CORS open, no hosting needed).
// Spine version is per-outfit — the app reloads with the correct runtime when needed.

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

function outfit(label, id, spineVersion, animOverrides) {
  const entry = {
    label,
    spineVersion,
    skelUrl:  `${NIKKE_CDN}/${id}/${id}_00.skel`,
    atlasUrl: `${NIKKE_CDN}/${id}/${id}_00.atlas`,
  }
  if (animOverrides) entry.animations = animOverrides
  return entry
}

// Shared animation map — used by most Rapi outfits
const RAPI_ANIMS = {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'special',
  THINKING: 'talk_start',
}

// ── Rapi — multiple outfits spanning Spine 4.0 and 4.1 ────────────────────
export const NIKKE_RAPI = {
  name: 'Rapi',
  spineVersion: '4.0',
  animations: RAPI_ANIMS,
  outfits: [
    outfit('Default',          'c010',      '4.0'),
    outfit('White Promise',    'c010_02',   '4.0'),
    outfit('Classic Vacation', 'c010_03',   '4.1'),
    outfit('Red Hood',         'c016',      '4.1'),
    outfit('Red Hood (Teal)',  'c016_01',   '4.1'),
    outfit('Red Hood (Red)',   'c016_02',   '4.1'),
    outfit('Red Hood (Rose)',  'c016_03',   '4.1'),
    outfit('c989',             'c989',      '4.1'),
    outfit('c994',             'c994',      '4.1', { IDLE: 'idle', HAPPY: 'idle_02', SAD: 'angry', EXCITED: 'surprise_02', THINKING: 'idle_02' }),
    outfit('Smol',             'smol_rapi', '4.1', { IDLE: 'idle', HAPPY: 'delight', SAD: 'angry_1', EXCITED: 'angry_2', THINKING: 'idle' }),
  ],
}

// ── Other NIKKE characters — Spine 4.0.47 ────────────────────────────────
export const NIKKE_NEON = nikke('c011', 'Neon', '4.0', {
  IDLE:     'idle',
  HAPPY:    'delight',
  SAD:      'angry',
  EXCITED:  'action',
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

// ── VRM characters ─────────────────────────────────────────────────────────
export const VRM_621 = {
  name: '幻覚',
  type: 'vrm',
  outfits: [
    { label: 'Default',  modelUrl: '/EVE/models/621_%E5%B9%BB%E8%A6%9A_.vrm' },
    { label: '上着無し', modelUrl: '/EVE/models/621_%E5%B9%BB%E8%A6%9A_%E4%B8%8A%E7%9D%80%E7%84%A1%E3%81%97.vrm' },
  ],
}

export const CHARACTERS = [
  NIKKE_RAPI,
  NIKKE_NEON,
  NIKKE_MODERNIA,
  NIKKE_SCARLET,
  NIKKE_C223,
  NIKKE_C810,
  VRM_621,
]

// ── Active character ───────────────────────────────────────────────────────
export const character = NIKKE_RAPI
