export const EMOTIONS = {
  IDLE: 'IDLE',
  HAPPY: 'HAPPY',
  SAD: 'SAD',
  EXCITED: 'EXCITED',
  THINKING: 'THINKING',
}

// Valid transitions — keeps state machine from jumping erratically
const VALID_TRANSITIONS = {
  IDLE:     ['HAPPY', 'SAD', 'EXCITED', 'THINKING'],
  HAPPY:    ['IDLE', 'EXCITED'],
  SAD:      ['IDLE', 'HAPPY'],
  EXCITED:  ['IDLE', 'HAPPY'],
  THINKING: ['IDLE', 'HAPPY', 'SAD', 'EXCITED'],
}

export function transition(current, next) {
  if (next === EMOTIONS.IDLE) return EMOTIONS.IDLE
  if (VALID_TRANSITIONS[current]?.includes(next)) return next
  return current
}

// Fallback emotion detection from plain text when AI skips JSON
export function detectEmotionFromText(text) {
  const t = text.toLowerCase()
  if (/\b(hello|hi|hey|welcome|great|glad|love)\b/.test(t)) return EMOTIONS.HAPPY
  if (/\b(sorry|unfortunate|bad|wrong|error|fail|sad)\b/.test(t)) return EMOTIONS.SAD
  if (/[!]{2,}|\b(wow|amazing|incredible|fantastic|omg|whoa)\b/.test(t)) return EMOTIONS.EXCITED
  if (/\?/.test(text) || /\b(hmm|let me think|interesting|perhaps|consider)\b/.test(t)) return EMOTIONS.THINKING
  return EMOTIONS.IDLE
}
