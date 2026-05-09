import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'

// VRM expression names (three-vrm v2 unifies VRM0 and VRM1 to these)
const EMOTION_EXPRESSIONS = {
  IDLE:     [],
  THINKING: [],
  HAPPY:    ['happy'],
  SAD:      ['sad'],
  EXCITED:  ['surprised'],
}

export default function VRMViewer({ modelUrl, emotion = 'IDLE' }) {
  const canvasRef  = useRef(null)
  const vrmRef     = useRef(null)
  const blinkRef   = useRef({ timer: 0, next: 2 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      28,
      canvas.clientWidth / canvas.clientHeight,
      0.1, 20
    )
    camera.position.set(0, 1.35, 2.2)  // Frame head + upper chest

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const sun = new THREE.DirectionalLight(0xffffff, 1.2)
    sun.position.set(1, 2, 2)
    scene.add(sun)

    const loader = new GLTFLoader()
    loader.register(parser => new VRMLoaderPlugin(parser))

    let animId = null
    const clock = new THREE.Clock()

    loader.load(
      modelUrl,
      (gltf) => {
        const vrm = gltf.userData.vrm
        VRMUtils.removeUnnecessaryVertices(gltf.scene)
        VRMUtils.combineSkeletons(gltf.scene)
        // Face the camera (VRM models are mirrored by default)
        VRMUtils.rotateVRM0(vrm)
        scene.add(vrm.scene)
        vrmRef.current = vrm
      },
      undefined,
      (err) => console.error('VRM load error:', err)
    )

    function animate() {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      const vrm = vrmRef.current
      if (vrm) {
        vrm.update(delta)
        // Auto-blink
        const b = blinkRef.current
        b.timer += delta
        if (b.timer >= b.next) {
          b.timer = 0
          b.next  = 2.5 + Math.random() * 3
          triggerBlink(vrm)
        }
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

  // Apply emotion expression whenever it changes
  useEffect(() => {
    const vrm = vrmRef.current
    if (!vrm?.expressionManager) return
    const mgr = vrm.expressionManager

    // Reset all emotion expressions
    for (const names of Object.values(EMOTION_EXPRESSIONS)) {
      for (const n of names) mgr.setValue(n, 0)
    }
    // Set the new ones
    for (const n of (EMOTION_EXPRESSIONS[emotion] ?? [])) {
      mgr.setValue(n, 1)
    }
    mgr.update()
  }, [emotion])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

function triggerBlink(vrm) {
  const mgr = vrm.expressionManager
  if (!mgr) return
  const dur   = 120
  const start = performance.now()

  function step() {
    const t = (performance.now() - start) / dur
    if (t >= 2) { mgr.setValue('blinkLeft', 0); mgr.setValue('blinkRight', 0); mgr.update(); return }
    const v = t < 1 ? t : 2 - t
    mgr.setValue('blinkLeft', v)
    mgr.setValue('blinkRight', v)
    mgr.update()
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
