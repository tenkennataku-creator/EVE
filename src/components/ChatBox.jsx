import { useEffect, useRef } from 'react'

export default function ChatBox({ messages, thinking }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  return (
    <div className="chat-box">
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.role}`}>
          {msg.text}
        </div>
      ))}
      {thinking && (
        <div className="message eve thinking">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
