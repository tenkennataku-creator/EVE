import { useEffect, useRef, useState } from 'react'

export default function SpineViewer({ skelUrl, atlasUrl, animation = 'idle' }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!containerRef.current || !window.spine) return

    setReady(false)
    setError(null)
    if (playerRef.current) {
      playerRef.current.dispose?.()
      playerRef.current = null
    }
    containerRef.current.innerHTML = ''

    // Defer init one frame so the container has its final CSS dimensions
    const raf = requestAnimationFrame(() => {
      if (!containerRef.current) return

      const player = new window.spine.SpinePlayer(containerRef.current, {
        skelUrl,
        atlasUrl,
        animation,
        showControls: false,
        premultipliedAlpha: true,
        // Pad around the character so it's fully visible
        viewport: {
          padLeft: '10%',
          padRight: '10%',
          padTop: '10%',
          padBottom: '10%',
        },
        success: () => {
          playerRef.current = player
          setReady(true)
        },
        error: (err) => setError(String(err)),
      })
    })

    return () => {
      cancelAnimationFrame(raf)
      playerRef.current?.dispose?.()
      playerRef.current = null
      setReady(false)
    }
  }, [skelUrl, atlasUrl])

  useEffect(() => {
    if (!ready || !playerRef.current || !animation) return
    try {
      playerRef.current.animationState?.setAnimation(0, animation, true)
    } catch {
      // Animation name not in this skeleton — ignore
    }
  }, [animation, ready])

  return (
    <div className="spine-container">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {error && (
        <div className="spine-error">
          Failed to load character.<br />
          <small>{error}</small>
        </div>
      )}
    </div>
  )
}
