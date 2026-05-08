import { useState, useEffect, useRef } from 'react'
import SpineViewer from './components/SpineViewer'
import ChatBox from './components/ChatBox'
import ChatInput from './components/ChatInput'
import { initGemini, sendMessage, MODEL } from './lib/gemini'
import { transition, detectEmotionFromText, EMOTIONS } from './lib/emotionFSM'
import { character } from './config/character'

const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY

const EMOTION_COLORS = {
  IDLE:     '#6080c0',
  HAPPY:    '#60c080',
  SAD:      '#8060c0',
  EXCITED:  '#c08020',
  THINKING: '#4090c0',
}

export default function App() {
  const [emotion, setEmotion]   = useState(EMOTIONS.IDLE)
  const [messages, setMessages] = useState([])
  const [thinking, setThinking] = useState(false)
  const [ready, setReady]       = useState(false)
  const [apiKey, setApiKey]     = useState('')
  const historyRef              = useRef([])

  useEffect(() => {
    if (ENV_KEY) {
      initGemini(ENV_KEY)
      setReady(true)
      greet()
    }
  }, [])

  async function greet() {
    try {
      const res = await sendMessage([], 'Hello! Introduce yourself in one sentence.')
      applyResponse(res, 'Hello! Introduce yourself in one sentence.')
    } catch {
      setMessages([{ role: 'eve', text: "Hi! I'm EVE. How can I help you today?" }])
      setEmotion(EMOTIONS.HAPPY)
    }
  }

  function applyResponse(res, userText) {
    const nextEmotion = EMOTIONS[res.emotion] ?? detectEmotionFromText(res.message)
    setEmotion((prev) => transition(prev, nextEmotion))
    setMessages((prev) => [...prev, { role: 'eve', text: res.message }])
    // Append both turns to history for context
    historyRef.current = [
      ...historyRef.current,
      { role: 'user',  parts: [{ text: userText }] },
      { role: 'model', parts: [{ text: res.message }] },
    ]
  }

  function handleInit() {
    const key = apiKey.trim()
    if (!key) return
    initGemini(key)
    setReady(true)
    greet()
  }

  async function handleSend(text) {
    setMessages((prev) => [...prev, { role: 'user', text }])
    setThinking(true)
    setEmotion((prev) => transition(prev, EMOTIONS.THINKING))

    try {
      const res = await sendMessage(historyRef.current, text)
      applyResponse(res, text)
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'eve', text: `Error: ${err.message}` }])
      setEmotion(EMOTIONS.SAD)
    } finally {
      setThinking(false)
    }
  }

  return (
    <div className="app">
      <div className="viewer-area">
        <SpineViewer
          skelUrl={character.skelUrl}
          atlasUrl={character.atlasUrl}
          animation={character.animations[emotion]}
        />
        <div
          className="emotion-badge"
          style={{ borderColor: EMOTION_COLORS[emotion], color: EMOTION_COLORS[emotion] }}
        >
          {emotion}
        </div>
        <div className="model-badge">{MODEL}</div>
      </div>

      <div className="chat-area">
        {!ready ? (
          <div className="api-key-prompt">
            <p>Enter your Gemini API key to start</p>
            <small>Free key at <strong>aistudio.google.com/apikey</strong></small>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInit()}
              placeholder="AIza..."
            />
            <button onClick={handleInit} disabled={!apiKey.trim()}>Start EVE</button>
          </div>
        ) : (
          <>
            <ChatBox messages={messages} thinking={thinking} />
            <ChatInput onSend={handleSend} disabled={thinking} />
          </>
        )}
      </div>
    </div>
  )
}
