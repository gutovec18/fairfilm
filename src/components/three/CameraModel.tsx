import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { media } from '../../lib'

export const CAMERA_GLB = media('3d/camera.glb')

// decode the compressed geometry off the main thread
;(MeshoptDecoder as unknown as { useWorkers?: (n: number) => void }).useWorkers?.(2)

/**
 * The cinema camera, pre-baked to a compressed glTF (see CinemaCamera.tsx + scripts/bake-camera.mjs).
 * Loading it is just buffer views + off-thread image decoding, so there is no main-thread spike.
 */
export function CameraModel() {
  const gltf = useLoader(GLTFLoader, CAMERA_GLB, (loader) => loader.setMeshoptDecoder(MeshoptDecoder))

  const { scene, tally, screen } = useMemo(() => {
    let tallyMesh: THREE.Mesh | undefined
    let screenMesh: THREE.Mesh | undefined
    // Performance: every MeshPhysicalMaterial variant (clearcoat / anisotropy / iridescence) compiles its own
    // heavy shader. Only the lens glass really needs it; everything else becomes a MeshStandardMaterial,
    // so the whole rig needs a handful of small programs instead of many big ones.
    const simplified = new Map<THREE.Material, THREE.Material>()
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const src = mesh.material as THREE.Material
      if ((src as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial && src.name !== 'glass') {
        if (!simplified.has(src)) {
          const p = src as THREE.MeshPhysicalMaterial
          const std = new THREE.MeshStandardMaterial({
            name: p.name,
            color: p.color,
            map: p.map,
            roughness: p.roughness,
            metalness: p.metalness,
            roughnessMap: p.roughnessMap,
            metalnessMap: p.metalnessMap,
            normalMap: p.normalMap,
            emissive: p.emissive,
            emissiveIntensity: p.emissiveIntensity,
            transparent: p.transparent,
            opacity: p.opacity,
            side: p.side,
            depthWrite: p.depthWrite,
            envMapIntensity: p.envMapIntensity,
          })
          simplified.set(src, std)
        }
        mesh.material = simplified.get(src)!
      }
    })
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mat = mesh.material as THREE.MeshStandardMaterial
      // Restore what glTF can't express
      if (mat.name.startsWith('coat')) Object.assign(mat, { blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })
      if (['tally', 'led', 'label', 'lcd', 'logo', 'screen'].includes(mat.name) || mat.type === 'MeshBasicMaterial') mat.toneMapped = false
      if (mat.name === 'matte' || mat.name === 'lensBarrel') mat.side = THREE.DoubleSide
      const glowy = mat.type === 'MeshBasicMaterial' || mat.transparent
      mesh.castShadow = !glowy
      mesh.receiveShadow = !glowy
      // node names don't survive optimisation, material names do
      if (mat.name === 'tally') tallyMesh = mesh
      if (mat.name === 'screen') screenMesh = mesh
    })
    return { scene: gltf.scene, tally: tallyMesh, screen: screenMesh }
  }, [gltf])

  // The on-board monitor plays real Fairfilm footage.
  useEffect(() => {
    if (!screen) return
    const v = document.createElement('video')
    v.src = media('video/clip-film.mp4')
    v.muted = true
    v.loop = true
    v.playsInline = true
    v.preload = 'auto'
    const tex = new THREE.VideoTexture(v)
    tex.colorSpace = THREE.SRGBColorSpace
    const prev = screen.material
    screen.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
    void v.play().catch(() => {})
    return () => {
      v.pause()
      v.removeAttribute('src')
      tex.dispose()
      ;(screen.material as THREE.Material).dispose()
      screen.material = prev
    }
  }, [screen])

  useFrame(({ clock }) => {
    if (tally) tally.visible = Math.sin(clock.elapsedTime * 4) > -0.3
  })

  return <primitive object={scene} />
}

/** Start fetching/decoding the model early (e.g. during idle time) without rendering it. */
export const preloadCameraModel = () => useLoader.preload(GLTFLoader, CAMERA_GLB, (loader) => loader.setMeshoptDecoder(MeshoptDecoder))
