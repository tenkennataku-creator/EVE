import { useState, useEffect, useRef } from 'react'
import SpineViewer from './components/SpineViewer'
import ChatBox from './components/ChatBox'
import ChatInput from './components/ChatInput'
import { initGemini, sendMessage, setModel, getModel, MODELS } from './lib/gemini'
import { transition, detectEmotionFromText, EMOTIONS } from './lib/emotionFSM'
import { speak, setTTSEnabled, isTTSEnabled } from './lib/tts'
import { character as defaultCharacter, CHARACTERS } from './config/character'

const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY

const EMOTION_COLORS = {
  IDLE:     '#6080c0',
  HAPPY:    '#60c080',
  SAD:      '#8060c0',
  EXCITED:  '#c08020',
  THINKING: '#4090c0',
}

export default function App() {
  const [emotion, setEmotion]         = useState(EMOTIONS.IDLE)
  const [messages, setMessages]       = useState([])
  const [thinking, setThinking]       = useState(false)
  const [ready, setReady]             = useState(false)
  const [apiKey, setApiKey]           = useState('')
  const [activeModel, setActiveModel] = useState(getModel())
  const [tts, setTts]                 = useState(false)
  const [activeChar, setActiveChar]   = useState(defaultCharacter)
  const historyRef                    = useRef([])

  useEffect(() => {
    const saved = ENV_KEY || localStorage.getItem('eve_api_key')
    if (saved) {
      initGemini(saved)
      setReady(true)
      greet()
    }
  }, [])

  async function greet() {
    historyRef.current = []
    setMessages([])
    setEmotion(EMOTIONS.IDLE)
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
    speak(res.message)
    historyRef.current = [
      ...historyRef.current,
      { role: 'user',  parts: [{ text: userText }] },
      { role: 'model', parts: [{ text: res.message }] },
    ]
  }

  function handleInit() {
    const key = apiKey.trim()
    if (!key) return
    localStorage.setItem('eve_api_key', key)
    initGemini(key)
    setReady(true)
    greet()
  }

  function handleTTSToggle() {
    const next = !tts
    setTts(next)
    setTTSEnabled(next)
  }

  function handleModelCycle() {
    if (thinking) return
    const next = MODELS[(MODELS.indexOf(activeModel) + 1) % MODELS.length]
    setModel(next)
    setActiveModel(next)
    greet()
  }

  function handleCharCycle() {
    if (thinking) return
    const idx = CHARACTERS.indexOf(activeChar)
    const next = CHARACTERS[(idx + 1) % CHARACTERS.length]
    setActiveChar(next)
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
          skelUrl={activeChar.skelUrl}
          atlasUrl={activeChar.atlasUrl}
          animation={activeChar.animations[emotion]}
        />
        <div
          className="emotion-badge"
          style={{ borderColor: EMOTION_COLORS[emotion], color: EMOTION_COLORS[emotion] }}
        >
          {emotion}
        </div>
        <button
          className="char-badge"
          onClick={handleCharCycle}
          disabled={thinking || !ready}
          title="Tap to switch character"
        >
          {activeChar.name} ⟳
        </button>
        <button
          className="model-badge"
          onClick={handleModelCycle}
          disabled={thinking || !ready}
          title="Tap to switch model"
        >
          {activeModel} ⟳
        </button>
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
            <div className="chat-toolbar">
              <button className={`tts-btn ${tts ? 'active' : ''}`} onClick={handleTTSToggle}>
                {tts ? '🔊' : '🔇'} {tts ? 'Voice on' : 'Voice off'}
              </button>
            </div>
            <ChatBox messages={messages} thinking={thinking} />
            <ChatInput onSend={handleSend} disabled={thinking} />
          </>
        )}
      </div>
    </div>
  )
}
