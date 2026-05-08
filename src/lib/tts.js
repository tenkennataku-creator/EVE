let enabled = false

export function setTTSEnabled(val) { enabled = val }
export function isTTSEnabled() { return enabled }

export function speak(text) {
  if (!enabled || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1.1
  // Prefer a female voice if available
  const voices = window.speechSynthesis.getVoices()
  const pick = voices.find(v =>
    /female|samantha|victoria|karen|moira/i.test(v.name)
  )
  if (pick) utterance.voice = pick
  window.speechSynthesis.speak(utterance)
}
