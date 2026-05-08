import { useEffect, useRef, useState } from 'react'

export default function SpineViewer({ skelUrl, atlasUrl, animation = 'idle' }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  // Initialize player whenever asset URLs change
  useEffect(() => {
    if (!containerRef.current || !window.spine) return

    setReady(false)
    setError(null)
    if (playerRef.current) {
      playerRef.current.dispose?.()
      playerRef.current = null
    }
    containerRef.current.innerHTML = ''

    const player = new window.spine.SpinePlayer(containerRef.current, {
      skelUrl,
      atlasUrl,
      animation,
      backgroundColor: '#00000000',
      alpha: true,
      premultipliedAlpha: true,
      showControls: false,
      success: () => {
        playerRef.current = player
        setReady(true)
      },
      error: (err) => {
        setError(String(err))
      },
    })

    return () => {
      player.dispose?.()
      playerRef.current = null
      setReady(false)
    }
  }, [skelUrl, atlasUrl])

  // Switch animation when emotion changes
  useEffect(() => {
    if (!ready || !playerRef.current || !animation) return
    try {
      playerRef.current.animationState?.setAnimation(0, animation, true)
    } catch {
      // Animation name doesn't exist in this skeleton — silently ignore
    }
  }, [animation, ready])

  return (
    <div className="spine-container">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {error && (
        <div className="spine-error">
          Failed to load character assets.<br />
          <small>{error}</small>
        </div>
      )}
    </div>
  )
}
