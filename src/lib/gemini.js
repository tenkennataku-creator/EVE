import { GoogleGenAI } from '@google/genai'

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

// gemma-4-31b-it = Gemma 4 dense 31B, free via Google AI Studio
// alternative: gemma-4-26b-a4b-it (MoE, 4B active params — faster)
const MODEL = 'gemma-4-31b-it'

let chat = null

export function initGemini(apiKey) {
  const ai = new GoogleGenAI({ apiKey })
  chat = ai.chats.create({
    model: MODEL,
    config: { systemInstruction: SYSTEM_PROMPT },
  })
}

export async function sendMessage(userMessage) {
  if (!chat) throw new Error('Not initialized — call initGemini first')
  const response = await chat.sendMessage({ message: userMessage })
  return parseJsonResponse(response.text)
}

function parseJsonResponse(text) {
  // Strip markdown code fences Gemma sometimes wraps output in
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return { message: text, emotion: 'IDLE' }
  }
}

export function isInitialized() {
  return chat !== null
}
