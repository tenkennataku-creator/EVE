// Direct REST calls — no SDK dependency, keeps the bundle tiny
export const MODELS = [
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
]

const SYSTEM_PROMPT = `You are EVE. Reply ONLY with a JSON object. No reasoning, no explanation, no bullet points. Just JSON.

Format: {"message":"your reply here","emotion":"HAPPY"}

Emotion values: IDLE, HAPPY, SAD, EXCITED, THINKING
- HAPPY: greetings, good news
- SAD: apologies, difficult topics
- EXCITED: surprises, enthusiasm
- THINKING: questions, reflection
- IDLE: neutral

One to three sentences max. Output the JSON object and nothing else.`

let apiKey = null
let activeModel = MODELS[0]

export function initGemini(key) {
  apiKey = key
}

export function setModel(model) {
  activeModel = model
}

export function getModel() {
  return activeModel
}

export async function sendMessage(history, userMessage) {
  if (!apiKey) throw new Error('Not initialized')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`

  // system_instruction is unsupported by Gemma models — inject as first turn instead
  const contents = [
    { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: '{"message":"Ready.","emotion":"IDLE"}' }] },
    ...history,
    { role: 'user',  parts: [{ text: userMessage }] },
  ]

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${res.status}`)
  }

  const data = await res.json()
  const parts = data.candidates?.[0]?.content?.parts ?? []
  const text = parts.filter(p => !p.thought).map(p => p.text).join('')
    || parts.map(p => p.text).join('')
  return parseJsonResponse(text)
}

function parseJsonResponse(text) {
  // Gemma outputs thinking first, JSON last — scan right-to-left for a valid block
  let end = text.lastIndexOf('}')
  while (end !== -1) {
    const start = text.lastIndexOf('{', end)
    if (start === -1) break
    try {
      const obj = JSON.parse(text.slice(start, end + 1))
      if (obj.message && obj.emotion) return obj
    } catch { /* keep scanning */ }
    end = text.lastIndexOf('}', end - 1)
  }
  // Absolute fallback — strip bullet lines, return plain text
  const cleaned = text.replace(/^\*[^\n]+$/gm, '').trim()
  return { message: cleaned || text, emotion: 'IDLE' }
}

export function isInitialized() {
  return apiKey !== null
}
