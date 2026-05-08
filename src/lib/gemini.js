// Direct REST calls — no SDK dependency, keeps the bundle tiny
const MODEL = 'gemma-4-31b-it'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

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
  // Gemma 4 sometimes outputs a thinking/reasoning block before the JSON.
  // Find the first { and last } and extract only that.
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1))
    } catch {
      // fall through
    }
  }
  // Fallback: strip code fences and try again
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
