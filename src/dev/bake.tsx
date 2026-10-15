/**
 * Dev-only bake page (http://localhost:5173/__bake). Renders the procedural camera once and exports it
 * as a binary glTF on window.__glb (base64) for scripts/bake-camera.mjs to save. Never shipped.
 */
import { Canvas } from '@react-three/fiber'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { CinemaCamera } from '../components/three/CinemaCamera'
import '../styles/global.scss'

declare global {
  interface Window {
    __glb?: string
    __bakeError?: string
  }
}

async function onBaked(root: THREE.Group) {
  try {
    const glb = (await new GLTFExporter().parseAsync(root, { binary: true })) as ArrayBuffer
    const bytes = new Uint8Array(glb)
    let bin = ''
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    window.__glb = btoa(bin)
  } catch (e) {
    window.__bakeError = String(e)
  }
}

// Canvas labels are drawn with the site fonts, so make sure they're loaded first.
await Promise.all(
  ['700 150px "Barlow Condensed"', '600 40px "JetBrains Mono"', '700 34px "JetBrains Mono"', '500 26px "JetBrains Mono"'].map((f) =>
    document.fonts.load(f, 'FAIRFILM ∞ 0123456789 Áš'),
  ),
)
createRoot(document.getElementById('root')!).render(
  <Canvas>
    <CinemaCamera onBaked={onBaked} />
  </Canvas>,
)
