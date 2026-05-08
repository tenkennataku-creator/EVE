import { GoogleGenerativeAI } from '@google/generative-ai'

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

let model = null
let chat = null

export function initGemini(apiKey) {
  const client = new GoogleGenerativeAI(apiKey)
  model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: 'application/json' },
  })
  chat = model.startChat({ history: [] })
}

export async function sendMessage(userMessage) {
  if (!chat) throw new Error('Gemini not initialized')
  const result = await chat.sendMessage(userMessage)
  const text = result.response.text()
  try {
    return JSON.parse(text)
  } catch {
    return { message: text, emotion: 'IDLE' }
  }
}

export function isInitialized() {
  return chat !== null
}
