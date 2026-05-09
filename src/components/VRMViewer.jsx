import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'

// Emotion → expression name (three-vrm v2+ unified names)
const EMOTION_EXPRESSIONS = {
  IDLE:     [],
  THINKING: [],
  HAPPY:    ['happy'],
  SAD:      ['sad'],
  EXCITED:  ['surprised'],
}

export default function VRMViewer({ modelUrl, emotion = 'IDLE' }) {
  const canvasRef = useRef(null)
  const vrmRef    = useRef(null)
  const clockRef  = useRef(new THREE.Clock())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      28, canvas.clientWidth / canvas.clientHeight, 0.1, 20
    )
    camera.position.set(0, 1.35, 2.2)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const sun = new THREE.DirectionalLight(0xffffff, 1.2)
    sun.position.set(1, 2, 2)
    scene.add(sun)

    const loader = new GLTFLoader()
    loader.register(parser => new VRMLoaderPlugin(parser))

    let animId = null
    clockRef.current.start()

    loader.load(
      modelUrl,
      (gltf) => {
        const vrm = gltf.userData.vrm
        VRMUtils.removeUnnecessaryVertices(gltf.scene)
        VRMUtils.combineSkeletons(gltf.scene)
        VRMUtils.rotateVRM0(vrm)
        scene.add(vrm.scene)
        vrmRef.current = vrm
        // Apply resting pose immediately so there's no T-pose flash
        applyIdle(vrm, 0)
      },
      undefined,
      (err) => console.error('VRM load error:', err)
    )

    let blinkTimer = 0
    let blinkNext  = 2 + Math.random() * 2

    function animate() {
      animId = requestAnimationFrame(animate)
      const delta   = clockRef.current.getDelta()
      const elapsed = clockRef.current.elapsedTime

      const vrm = vrmRef.current
      if (vrm) {
        applyIdle(vrm, elapsed)

        // Auto-blink
        blinkTimer += delta
        if (blinkTimer >= blinkNext) {
          blinkTimer = 0
          blinkNext  = 2.5 + Math.random() * 3
          triggerBlink(vrm)
        }

        vrm.update(delta)
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene)
        vrmRef.current = null
      }
      renderer.dispose()
    }
  }, [modelUrl])

  // Update emotion expressions
  useEffect(() => {
    const vrm = vrmRef.current
    if (!vrm?.expressionManager) return
    const mgr = vrm.expressionManager
    for (const names of Object.values(EMOTION_EXPRESSIONS))
      for (const n of names) mgr.setValue(n, 0)
    for (const n of (EMOTION_EXPRESSIONS[emotion] ?? []))
      mgr.setValue(n, 1)
    mgr.update()
  }, [emotion])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

// ── Procedural idle ────────────────────────────────────────────────────────

function applyIdle(vrm, t) {
  const h = vrm.humanoid
  if (!h) return

  const breath = Math.sin(t * Math.PI * 0.5) // one cycle every 4 s

  // Arms down from T-pose to relaxed A-pose
  bone(h, 'leftUpperArm',  b => { b.rotation.z =  1.1 + breath * 0.04 })
  bone(h, 'rightUpperArm', b => { b.rotation.z = -1.1 - breath * 0.04 })

  // Slight forearm drape
  bone(h, 'leftLowerArm',  b => { b.rotation.z =  0.15 })
  bone(h, 'rightLowerArm', b => { b.rotation.z = -0.15 })

  // Chest breathing
  bone(h, 'chest', b => { b.rotation.x =  breath * 0.018 })
  bone(h, 'spine', b => { b.rotation.x = -breath * 0.008 })

  // Gentle head float
  bone(h, 'head', b => {
    b.rotation.y = Math.sin(t * 0.35) * 0.05
    b.rotation.x = Math.sin(t * 0.25 + 1.2) * 0.025
  })
}

function bone(humanoid, name, fn) {
  const node = humanoid.getNormalizedBoneNode(name)
  if (node) fn(node)
}

// Quick blink — closes and reopens eyes over ~150 ms
function triggerBlink(vrm) {
  const mgr = vrm.expressionManager
  if (!mgr) return
  const dur   = 150
  const start = performance.now()
  function step() {
    const t = (performance.now() - start) / dur
    if (t >= 2) {
      mgr.setValue('blinkLeft', 0)
      mgr.setValue('blinkRight', 0)
      mgr.update()
      return
    }
    const v = t < 1 ? t : 2 - t
    mgr.setValue('blinkLeft', v)
    mgr.setValue('blinkRight', v)
    mgr.update()
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
