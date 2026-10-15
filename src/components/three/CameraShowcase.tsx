import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { m, useInView, useScroll, useTransform, type MotionValue } from 'motion/react'
import { Component, createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { cx, media, whenQuiet } from '../../lib'
import { CameraModel } from './CameraModel'
import s from './CameraShowcase.module.scss'

/* ---------------- Choreography ----------------
 * Keyframes over scroll progress (0 → 1). Between keys we ease with smootherstep,
 * then the rig is spring-damped towards the target every frame for a fluid, weighty feel. */
type Key = { p: number; pos: [number, number, number]; rot: [number, number, number]; s: number }

const KEYS: Key[] = [
  { p: 0.0, pos: [7, -2.6, -9], rot: [0.5, -2.6, 0.5], s: 0.8 }, // far away, tumbling in
  { p: 0.16, pos: [2.1, -0.3, -0.6], rot: [0.06, -1.32, 0.04], s: 0.9 }, // clean side profile (logo side)
  { p: 0.38, pos: [1.65, 0.05, 1.4], rot: [0.2, -0.92, 0.06], s: 0.92 }, // close on the lens barrel & markings
  { p: 0.6, pos: [1.9, -0.3, -0.2], rot: [0.16, 2.55, -0.04], s: 0.95 }, // from behind: monitor & battery
  { p: 0.8, pos: [1.55, -0.1, 0.6], rot: [0.04, -0.34, 0], s: 0.95 }, // turning to face us
  { p: 1.0, pos: [0, -0.02, 5.3], rot: [0, 0, 0], s: 1.2 }, // dolly into the glass
]

const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

function sample(p: number) {
  const clamped = THREE.MathUtils.clamp(p, 0, 1)
  let i = 0
  while (i < KEYS.length - 2 && clamped > KEYS[i + 1].p) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const t = smoother((clamped - a.p) / (b.p - a.p))
  const lerp = (x: number, y: number) => x + (y - x) * t
  return {
    pos: a.pos.map((v, k) => lerp(v, b.pos[k])) as [number, number, number],
    rot: a.rot.map((v, k) => lerp(v, b.rot[k])) as [number, number, number],
    s: lerp(a.s, b.s),
  }
}

function Rig({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock, pointer, size }, dt) => {
    const g = group.current
    if (!g) return
    const p = progress.get()
    const k = sample(p)
    const t = clock.elapsedTime
    // idle "handheld" float + a hint of mouse parallax (fades out as we dive into the lens)
    const life = 1 - THREE.MathUtils.smoothstep(p, 0.8, 0.95)
    // Keys are framed for widescreen; on tall/narrow screens shrink, centre and lift the rig above
    // the captions: but let the final dive into the lens play out full size.
    const dive = THREE.MathUtils.smoothstep(p, 0.82, 1)
    const fit = THREE.MathUtils.lerp(THREE.MathUtils.clamp(size.width / size.height / 1.6, 0.42, 1), 1, dive)
    const tx = k.pos[0] * fit * fit
    const ty = k.pos[1] + (1 - fit) * 1.7 + Math.sin(t * 0.9) * 0.06 * life
    const tz = k.pos[2]
    const rx = k.rot[0] - pointer.y * 0.12 * life + Math.sin(t * 0.7) * 0.015 * life
    const ry = k.rot[1] + pointer.x * 0.18 * life
    const rz = k.rot[2] + Math.sin(t * 0.5) * 0.02 * life
    const d = Math.min(dt, 0.05)
    const L = 5
    g.position.set(
      THREE.MathUtils.damp(g.position.x, tx, L, d),
      THREE.MathUtils.damp(g.position.y, ty, L, d),
      THREE.MathUtils.damp(g.position.z, tz, L, d),
    )
    g.rotation.set(
      THREE.MathUtils.damp(g.rotation.x, rx, L, d),
      THREE.MathUtils.damp(g.rotation.y, ry, L, d),
      THREE.MathUtils.damp(g.rotation.z, rz, L, d),
    )
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, k.s * THREE.MathUtils.lerp(fit * 1.15, 1, dive), L, d))
  })

  const init = sample(0)
  return (
    <group ref={group} position={init.pos} rotation={init.rot} scale={init.s}>
      {/* center the rig roughly around its visual mass (body + lens) */}
      <group position={[0, 0, -0.9]}>
        <Suspense fallback={null}>
          <CameraModel />
          <WarmUp />
        </Suspense>
      </group>
    </group>
  )
}

/** Dust floating in the key light: sells the "studio" atmosphere. */
function Dust({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const [positions, sprite] = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1
    }
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    return [arr, new THREE.CanvasTexture(c)]
  }, [count])

  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.012
    ref.current.position.y = Math.sin(performance.now() * 0.00015) * 0.3
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        map={sprite}
        transparent
        opacity={0.55}
        depthWrite={false}
        color="#ffd9b8"
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

/** Soft floor shadow: a blurred radial decal is plenty for a floating hero object. */
function FloorShadow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(0,0,0,0.75)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh position={[1, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[9, 4.5, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  )
}

/**
 * Compile every shader (incl. shadow variants) and upload geometry/textures while the section is still
 * off screen, so the first visible frame doesn't hitch. Uses parallel compilation where supported.
 */
/** Lets the off-screen warm-up tell the section when the live 3D may take over from the poster. */
const WarmContext = createContext<() => void>(() => {})

// While the 3D isn't ready the visitor sees a poster, so warm-up never needs to run during scrolling.
const QUIET = { calmMs: 400, maxWaitMs: Number.POSITIVE_INFINITY }

/**
 * Off-screen warm-up, one step per quiet moment (visitor not scrolling / moving):
 *   1. studio reflections (PMREM), first, so shaders don't have to be rebuilt for the env map later
 *   2. shader compile + GPU upload, a few materials at a time
 *   3. one full frame (shadow map etc.)
 * Then the section swaps the poster for the live canvas.
 */
function WarmUp() {
  const { gl, scene, camera } = useThree()
  const onWarm = useContext(WarmContext)
  useEffect(() => {
    let cancelled = false
    let cancelNext = () => {}
    let pmrem: THREE.PMREMGenerator | undefined
    let envTex: THREE.Texture | undefined
    const meshes: THREE.Mesh[] = []
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
    })
    const materials = [...new Set(meshes.flatMap((m) => ([] as THREE.Material[]).concat(m.material)))]
    const BATCH = 3
    const next = (fn: () => void) => (cancelNext = whenQuiet(() => !cancelled && fn(), QUIET))

    const batch = (i: number) => {
      const set = new Set(materials.slice(i, i + BATCH))
      const hidden = meshes.filter((m) => m.visible && !([] as THREE.Material[]).concat(m.material).some((x) => set.has(x)))
      hidden.forEach((m) => (m.visible = false))
      gl.render(scene, camera)
      hidden.forEach((m) => (m.visible = true))
      if (i + BATCH < materials.length) next(() => batch(i + BATCH))
      else
        next(() => {
          gl.render(scene, camera)
          onWarm()
        })
    }
    next(() => {
      pmrem = new THREE.PMREMGenerator(gl)
      envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      scene.environment = envTex
      scene.environmentIntensity = 0.9
      next(() => batch(0))
    })
    return () => {
      cancelled = true
      cancelNext()
      scene.environment = null
      envTex?.dispose()
      pmrem?.dispose()
    }
  }, [gl, scene, camera, onWarm])
  return null
}

/**
 * Adaptive quality: if this machine can't hold ~45 fps with the full setup, first drop the pixel ratio,
 * then switch off the soft shadows. Steps down once each, never back up (no oscillation).
 */
function QualityGuard() {
  const { gl, scene, setDpr } = useThree()
  const samples = useRef<number[]>([])
  const level = useRef(0)
  useFrame((_, dt) => {
    if (level.current >= 2) return
    const s = samples.current
    s.push(dt)
    if (s.length < 60) return
    s.sort((a, b) => a - b)
    const median = s[30]
    samples.current = []
    if (median < 1 / 45) return
    level.current++
    if (level.current === 1) setDpr(1)
    else {
      gl.shadowMap.enabled = false
      scene.traverse((o) => {
        const light = o as THREE.Light
        if (light.isLight) light.castShadow = false
        const mesh = o as THREE.Mesh
        if (mesh.isMesh) ([] as THREE.Material[]).concat(mesh.material).forEach((m) => (m.needsUpdate = true))
      })
    }
  })
  return null
}

function Scene({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      <QualityGuard />
      <ambientLight intensity={0.2} />
      <spotLight
        position={[4, 6, 7]}
        angle={0.5}
        penumbra={1}
        intensity={160}
        color="#fff1e2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
        shadow-radius={6}
      />
      <directionalLight position={[-6, 2.5, -5]} intensity={1.4} color="#ff7a1a" />
      <directionalLight position={[-5, 1, 5]} intensity={0.8} color="#c9d6ff" />
      <Rig progress={progress} />
      <Dust />
      <FloorShadow />
    </>
  )
}

/** WebGL can be unavailable (old devices, blocked GPU): fall back to a still. */
class GLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const captions = [
  { range: [0.04, 0.27], idx: '01', kicker: 'Kamera', title: 'RED 8K · ARRI · Sony', text: 'Digitální kinematografie až v 8K. Stejná technika, na jakou se točí celovečerní filmy a reklamy pro světové značky.' },
  { range: [0.29, 0.5], idx: '02', kicker: 'Optika', title: 'Sady Zeiss CP.3', text: 'Každý objektiv má svůj charakter. Vybíráme ho podle příběhu, ne podle ceníku.' },
  { range: [0.52, 0.72], idx: '03', kicker: 'Na place', title: 'Vidíte výsledek hned', text: 'Kalibrované monitory, zvuk Sennheiser a Sound Devices, světla až do 12 kW. Režisér je u monitoru s vámi.' },
  { range: [0.74, 0.9], idx: '04', kicker: 'Akce', title: 'Kamera jede.', text: 'Od první konzultace po finální master. Vše pod jednou střechou.' },
] as const

function Caption({ c, progress }: { c: (typeof captions)[number]; progress: MotionValue<number> }) {
  const [a, b] = c.range
  const opacity = useTransform(progress, [a, a + 0.04, b - 0.04, b], [0, 1, 1, 0])
  const y = useTransform(progress, [a, a + 0.05, b - 0.04, b], [40, 0, 0, -30])
  return (
    <m.div className={s.caption} style={{ opacity, y }}>
      <span className={s.capIdx}>
        {c.kicker}
      </span>
      <h3>{c.title}</h3>
      <p>{c.text}</p>
    </m.div>
  )
}

export default function CameraShowcase() {
  const section = useRef<HTMLElement>(null)
  const active = useInView(section, { margin: '20% 0px 20% 0px' })
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })

  // the live canvas only renders (and replaces the poster) once it is fully warmed up
  const [warm, setWarm] = useState(false)
  const onWarm = useCallback(() => setWarm(true), [])

  const bar = useTransform(scrollYProgress, [0.02, 0.9], [0, 1])
  const fade = useTransform(scrollYProgress, [0.9, 0.99], [0, 1])

  return (
    <section ref={section} className={s.section} aria-label="Naše technika: 3D kamera">
      <div className={s.sticky}>
        <div className={s.glow} aria-hidden />
        <ShowcasePosterImage hidden={warm} />

        <div className={cx(s.canvas, warm && s.canvasOn)}>
          <GLBoundary fallback={<img className={s.fallback} src={media('img/stab-red.webp')} alt="Kamera RED Epic" />}>
            <Canvas
              frameloop={active && warm ? 'always' : 'never'}
              dpr={[1, 1.5]}
              camera={{ position: [0, 0.35, 9], fov: 30, near: 0.05, far: 60 }}
              shadows="soft"
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <WarmContext.Provider value={onWarm}>
                <Scene progress={scrollYProgress} />
              </WarmContext.Provider>
            </Canvas>
          </GLBoundary>
        </div>

        <div className={s.captions}>
          {captions.map((c) => (
            <Caption key={c.idx} c={c} progress={scrollYProgress} />
          ))}
        </div>

        <div className={s.progress} aria-hidden>
          <m.i style={{ scaleX: bar }} />
        </div>

        <m.div className={s.fade} style={{ opacity: fade }} aria-hidden />
      </div>
    </section>
  )
}

/** Still of the camera (rendered from the real model) shown until the live 3D is ready. */
export function ShowcasePosterImage({ hidden = false }: { hidden?: boolean }) {
  return <img className={cx(s.poster, hidden && s.posterHidden)} src={media('img/camera-poster.webp')} alt="" decoding="async" />
}
