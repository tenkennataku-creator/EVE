import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import SpineViewer from './components/SpineViewer'
import ChatBox from './components/ChatBox'
const VRMViewer = lazy(() => import('./components/VRMViewer'))
import ChatInput from './components/ChatInput'
import { initGemini, sendMessage, setModel, getModel, MODELS } from './lib/gemini'
import { transition, detectEmotionFromText, EMOTIONS } from './lib/emotionFSM'
import { speak, setTTSEnabled } from './lib/tts'
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
  const [activeChar, setActiveChar]   = useState(() => {
    const saved = localStorage.getItem('eve_active_char')
    return (saved && CHARACTERS.find(c => c.name === saved)) || defaultCharacter
  })
  const [outfitIdx, setOutfitIdx]     = useState(0)
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

  function handleResetKey() {
    localStorage.removeItem('eve_api_key')
    setReady(false)
    setMessages([])
    setApiKey('')
  }

  function handleModelCycle() {
    if (thinking) return
    const next = MODELS[(MODELS.indexOf(activeModel) + 1) % MODELS.length]
    setModel(next)
    setActiveModel(next)
    greet()
  }

  function handleCharSelect(e) {
    const next = CHARACTERS.find(c => c.name === e.target.value)
    if (!next) return
    localStorage.setItem('eve_active_char', next.name)
    setOutfitIdx(0)
    const currentVersion = localStorage.getItem('eve_spine_version') || '4.0'
    if (next.spineVersion !== currentVersion) {
      localStorage.setItem('eve_spine_version', next.spineVersion)
      window.location.reload()
    } else {
      setActiveChar(next)
    }
  }

  function handleOutfitCycle() {
    const outfits = activeChar.outfits
    if (!outfits?.length) return
    setOutfitIdx(i => (i + 1) % outfits.length)
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

  const outfits   = activeChar.outfits
  const modelUrl  = outfits ? outfits[outfitIdx].modelUrl : activeChar.modelUrl
  const outfitKey = outfits ? `${activeChar.name}-${outfitIdx}` : activeChar.name

  return (
    <div className="app">
      <div className="viewer-area">
        {activeChar.type === 'vrm' ? (
          <Suspense fallback={null}>
            <VRMViewer
              key={outfitKey}
              modelUrl={modelUrl}
              emotion={emotion}
            />
          </Suspense>
        ) : (
          <SpineViewer
            key={activeChar.name}
            skelUrl={activeChar.skelUrl}
            atlasUrl={activeChar.atlasUrl}
            animation={activeChar.animations[emotion]}
          />
        )}
        <div
          className="emotion-badge"
          style={{ borderColor: EMOTION_COLORS[emotion], color: EMOTION_COLORS[emotion] }}
        >
          {emotion}
        </div>
        {outfits?.length > 1 && (
          <button
            className="outfit-badge"
            onClick={handleOutfitCycle}
            title="Tap to switch outfit"
          >
            {outfits[outfitIdx].label} ⟳
          </button>
        )}
        <select
          className="char-select"
          value={activeChar.name}
          onChange={handleCharSelect}
          disabled={thinking}
        >
          {CHARACTERS.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
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
              <button className="reset-key-btn" onClick={handleResetKey} title="Change API key">
                🔑
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
