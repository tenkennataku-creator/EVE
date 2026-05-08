// Direct REST calls — no SDK dependency, keeps the bundle tiny
const MODEL = 'gemma-4-31b-it'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const SYSTEM_PROMPT = `You are EVE, a warm and expressive AI companion.
Your emotional state changes naturally with the conversation.

Always respond with valid JSON only — no markdown, no extra text:
{"message": "your response", "emotion": "IDLE"|"HAPPY"|"SAD"|"EXCITED"|"THINKING"}

Emotion guide:
- HAPPY: greetings, good news, compliments
- SAD: empathy, apologies, difficult topics
- EXCITED: surprises, enthusiasm, discoveries
- THINKING: questions, uncertainty, reflection
- IDLE: neutral statements

Keep responses concise (1-3 sentences). Be genuine.`

let apiKey = null

export function initGemini(key) {
  apiKey = key
}

export async function sendMessage(history, userMessage) {
  if (!apiKey) throw new Error('Not initialized')

  const res = await fetch(`${API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return parseJsonResponse(text)
}

function parseJsonResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return { message: text, emotion: 'IDLE' }
  }
}

export function isInitialized() {
  return apiKey !== null
}
