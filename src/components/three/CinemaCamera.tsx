import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/*
 * A procedurally modelled digital cinema camera rig (RED / ARRI style).
 * Local axes: lens points +Z, up is +Y, operator stands at -Z. 1 unit ≈ 10 cm.
 * Everything is built from primitives, lathes and extrusions: no external model files.
 *
 * This is the AUTHORING source only. It is far too CPU-heavy to build in visitors' browsers, so
 * `npm run bake:camera` renders it once (dev route /__bake), merges it per material and exports
 * public/media/3d/camera.glb, which production loads instead (see CameraModel.tsx).
 */

const HALF_PI = Math.PI / 2
type V3 = [number, number, number]

/* ================================================================== */
/* Textures                                                            */
/* ================================================================== */

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  draw(ctx)
  const tex = new THREE.CanvasTexture(c)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Fine grain for anodized / rubber surfaces (used as roughness & bump). */
function noiseTexture(size = 256, contrast = 60) {
  const tex = canvasTexture(
    size,
    size,
    (ctx) => {
      const img = ctx.createImageData(size, size)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * contrast
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
    },
    false,
  )
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  return tex
}

/** Directional streaks for brushed aluminium. */
function brushedTexture(size = 256) {
  const tex = canvasTexture(
    size,
    size,
    (ctx) => {
      ctx.fillStyle = '#808080'
      ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < 1400; i++) {
        const y = Math.random() * size
        const g = 100 + Math.random() * 60
        ctx.strokeStyle = `rgba(${g},${g},${g},${0.15 + Math.random() * 0.3})`
        ctx.lineWidth = Math.random() * 1.2
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(size, y + (Math.random() - 0.5) * 2)
        ctx.stroke()
      }
    },
    false,
  )
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  return tex
}

/** White engraving on black: a horizontally wrapping band for lens barrels. */
function bandTexture(rows: { items: string[]; color: string; y: number; size: number }[], ticks = true) {
  return canvasTexture(2048, 128, (ctx) => {
    ctx.fillStyle = '#0c0c0e'
    ctx.fillRect(0, 0, 2048, 128)
    rows.forEach(({ items, color, y, size }) => {
      ctx.fillStyle = color
      ctx.font = `600 ${size}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const step = 2048 / items.length
      items.forEach((t, i) => {
        const x = step * (i + 0.5)
        ctx.fillText(t, x, y)
        if (ticks) ctx.fillRect(x - 1, 4, 2, 12)
      })
    })
  })
}

/* ================================================================== */
/* Materials                                                           */
/* ================================================================== */

function useMaterials() {
  return useMemo(() => {
    const noise = noiseTexture()
    const fine = noiseTexture(256, 140)
    fine.repeat.set(10, 10)
    const brushed = brushedTexture()
    const phys = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p)
    return {
      // black hard-anodised aluminium body
      body: phys({ color: '#1b1b1f', metalness: 0.6, roughness: 0.48, roughnessMap: noise, clearcoat: 0.25, clearcoatRoughness: 0.55 }),
      bodyPanel: phys({ color: '#141417', metalness: 0.5, roughness: 0.6, roughnessMap: noise }),
      gunmetal: phys({ color: '#3a3b41', metalness: 0.85, roughness: 0.38, roughnessMap: noise }),
      alu: phys({ color: '#d4d5d9', metalness: 1, roughness: 0.32, roughnessMap: brushed, anisotropy: 0.8 }),
      steel: phys({ color: '#a3a4a9', metalness: 1, roughness: 0.22 }),
      screwHole: new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.9 }),
      rubber: new THREE.MeshStandardMaterial({ color: '#0e0e0f', roughness: 0.95, metalness: 0, bumpMap: fine, bumpScale: 1.4 }),
      grip: new THREE.MeshStandardMaterial({ color: '#121213', roughness: 0.85, metalness: 0, bumpMap: fine, bumpScale: 3 }),
      plastic: phys({ color: '#151517', metalness: 0, roughness: 0.55, clearcoat: 0.2 }),
      foam: new THREE.MeshStandardMaterial({ color: '#2b2b30', roughness: 1, bumpMap: fine, bumpScale: 4 }),
      matte: new THREE.MeshStandardMaterial({ color: '#0b0b0d', roughness: 0.92, metalness: 0.05, side: THREE.DoubleSide }),
      lensBarrel: phys({ color: '#121214', metalness: 0.55, roughness: 0.42, roughnessMap: noise, side: THREE.DoubleSide }),
      orange: phys({ color: '#ff6b00', metalness: 0.7, roughness: 0.35 }),
      red: phys({ color: '#c8141b', metalness: 0.1, roughness: 0.35, clearcoat: 0.6 }),
      white: new THREE.MeshStandardMaterial({ color: '#efefef', roughness: 0.5 }),
      cable: new THREE.MeshStandardMaterial({ color: '#0d0d0f', roughness: 0.6, metalness: 0.1 }),
      cableBlue: new THREE.MeshStandardMaterial({ color: '#1b3a8c', roughness: 0.55 }),
      tally: new THREE.MeshStandardMaterial({ color: '#ff1a1a', emissive: '#ff1a1a', emissiveIntensity: 3, toneMapped: false }),
      led: new THREE.MeshStandardMaterial({ color: '#3dff7a', emissive: '#3dff7a', emissiveIntensity: 2.2, toneMapped: false }),
      ledDim: new THREE.MeshStandardMaterial({ color: '#103a1d', roughness: 0.5 }),
      glass: phys({
        color: '#05060d',
        metalness: 0.1,
        roughness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0,
        iridescence: 1,
        iridescenceIOR: 1.85,
        iridescenceThicknessRange: [260, 720],
        envMapIntensity: 2.8,
      }),
      screenGlass: phys({ color: '#000', metalness: 0, roughness: 0.04, transparent: true, opacity: 0.18, envMapIntensity: 1.6, depthWrite: false }),
      coatViolet: new THREE.MeshBasicMaterial({ color: '#7a4dff', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
      coatGreen: new THREE.MeshBasicMaterial({ color: '#2bd17e', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }),
      coatAmber: new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
    }
  }, [])
}

/** Material names survive the glTF export; CameraModel uses them to restore non-glTF properties. */
function useNamedMaterials() {
  const m = useMaterials()
  useMemo(() => Object.entries(m).forEach(([k, mat]) => (mat.name = k)), [m])
  return m
}

type M = ReturnType<typeof useNamedMaterials>

/* ================================================================== */
/* Geometry helpers                                                    */
/* ================================================================== */

/** Rounded box: machined parts catch light on their edges, which sells realism. */
function RBox({ size, r = 0.02, pos, rot, mat }: { size: V3; r?: number; pos?: V3; rot?: V3; mat: THREE.Material }) {
  const [x, y, z] = size
  const geo = useMemo(() => new RoundedBoxGeometry(x, y, z, 3, Math.min(r, x / 2 - 0.001, y / 2 - 0.001, z / 2 - 0.001)), [x, y, z, r])
  return <mesh geometry={geo} material={mat} position={pos} rotation={rot} />
}

/** Cylinder along Z (radiusTop = front). */
function ZCyl({ r, rFront, len, pos = [0, 0, 0], mat, seg = 48, open = false }: { r: number; rFront?: number; len: number; pos?: V3; mat: THREE.Material; seg?: number; open?: boolean }) {
  return (
    <mesh position={pos} rotation={[HALF_PI, 0, 0]} material={mat}>
      <cylinderGeometry args={[rFront ?? r, r, len, seg, 1, open]} />
    </mesh>
  )
}

/** Cylinder along X. */
function XCyl({ r, len, pos, mat, seg = 32 }: { r: number; len: number; pos: V3; mat: THREE.Material; seg?: number }) {
  return (
    <mesh position={pos} rotation={[0, 0, HALF_PI]} material={mat}>
      <cylinderGeometry args={[r, r, len, seg]} />
    </mesh>
  )
}

/** Toothed ring (lens gear / knurled knob / rosette) extruded along Z. */
function gearGeometry(rRoot: number, rTip: number, teeth: number, width: number, rHole = 0) {
  const shape = new THREE.Shape()
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const pts: [number, number][] = [
      [rRoot, a],
      [rTip, a + step * 0.18],
      [rTip, a + step * 0.48],
      [rRoot, a + step * 0.66],
    ]
    pts.forEach(([r, ang], k) => {
      const px = Math.cos(ang) * r
      const py = Math.sin(ang) * r
      if (i === 0 && k === 0) shape.moveTo(px, py)
      else shape.lineTo(px, py)
    })
  }
  shape.closePath()
  if (rHole > 0) {
    const hole = new THREE.Path()
    hole.absarc(0, 0, rHole, 0, Math.PI * 2, true)
    shape.holes.push(hole)
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 1,
    curveSegments: 24,
  })
  geo.translate(0, 0, -width / 2)
  return geo
}

function Gear({ rRoot, rTip, teeth, width, rHole = 0, pos, rot, mat }: { rRoot: number; rTip: number; teeth: number; width: number; rHole?: number; pos?: V3; rot?: V3; mat: THREE.Material }) {
  const geo = useMemo(() => gearGeometry(rRoot, rTip, teeth, width, rHole), [rRoot, rTip, teeth, width, rHole])
  return <mesh geometry={geo} material={mat} position={pos} rotation={rot} />
}

/** Socket-head screw, facing along X or Z. */
function Screw({ m, pos, axis = 'x', r = 0.026 }: { m: M; pos: V3; axis?: 'x' | 'z'; r?: number }) {
  const rot: V3 = axis === 'x' ? [0, 0, -HALF_PI] : [HALF_PI, 0, 0]
  return (
    <group position={pos} rotation={rot}>
      <mesh material={m.steel}>
        <cylinderGeometry args={[r, r, 0.02, 16]} />
      </mesh>
      <mesh material={m.screwHole} position={[0, 0.006, 0]}>
        <cylinderGeometry args={[r * 0.45, r * 0.45, 0.012, 6]} />
      </mesh>
    </group>
  )
}

/** Small printed label (plane facing +Z of its own rotation). */
function Label({ text, w, h, pos, rot, size = 40, color = '#d9d6cf' }: { text: string; w: number; h: number; pos: V3; rot?: V3; size?: number; color?: string }) {
  const tex = useMemo(() => {
    const H = Math.round((512 * h) / w)
    return canvasTexture(512, H, (ctx) => {
      ctx.fillStyle = color
      ctx.font = `600 ${size}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 256, H / 2)
    })
  }, [text, w, h, size, color])
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial name="label" map={tex} transparent toneMapped={false} />
    </mesh>
  )
}

/* ================================================================== */
/* Parts                                                               */
/* ================================================================== */

function Body({ m }: { m: M }) {
  const lcd = useMemo(
    () =>
      canvasTexture(512, 300, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 300)
        g.addColorStop(0, '#0b0f14')
        g.addColorStop(1, '#05070a')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 512, 300)
        ctx.fillStyle = '#ff3b30'
        ctx.beginPath()
        ctx.arc(38, 46, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#e9e6df'
        ctx.font = '700 34px "JetBrains Mono", monospace'
        ctx.fillText('REC  00:04:19:12', 62, 58)
        ctx.font = '500 26px "JetBrains Mono", monospace'
        ;[
          ['FPS', '25.00', 'ISO', '800'],
          ['SHUTTER', '180°', 'WB', '5600K'],
          ['RES', '8K 17:9', 'CODEC', 'R3D HQ'],
        ].forEach(([a, b, c, d], i) => {
          const y = 128 + i * 52
          ctx.fillStyle = '#7d8590'
          ctx.fillText(a, 28, y)
          ctx.fillText(c, 280, y)
          ctx.fillStyle = '#f2efe8'
          ctx.fillText(b, 150, y)
          ctx.fillText(d, 380, y)
        })
        ctx.fillStyle = '#3dff7a'
        for (let i = 0; i < 4; i++) ctx.fillRect(400 + i * 24, 34, 16, 24)
        ctx.fillStyle = '#2a3038'
        ctx.fillRect(14, 86, 484, 1)
      }),
    [],
  )
  const logo = useMemo(
    () =>
      canvasTexture(1024, 200, (ctx) => {
        ctx.font = '700 150px "Barlow Condensed", "Arial Narrow", sans-serif'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#ff6b00'
        ctx.fillText('FAIR', 30, 105)
        const w = ctx.measureText('FAIR').width
        ctx.fillStyle = '#e9e6df'
        ctx.fillText('FILM', 30 + w, 105)
      }),
    [],
  )

  return (
    <group>
      {/* main shell + panel seams */}
      <RBox size={[1.5, 1.45, 2.1]} r={0.09} mat={m.body} />
      {[0.55, -0.6].map((z) => (
        <RBox key={z} size={[1.512, 1.462, 0.014]} r={0.09} pos={[0, 0, z]} mat={m.screwHole} />
      ))}

      {/* front mount plate with screws */}
      <RBox size={[1.34, 1.3, 0.1]} r={0.04} pos={[0, 0, 1.07]} mat={m.gunmetal} />
      {[
        [0.56, 0.54],
        [-0.56, 0.54],
        [0.56, -0.54],
        [-0.56, -0.54],
      ].map(([x, y]) => (
        <Screw key={`${x}${y}`} m={m} pos={[x, y, 1.125]} axis="z" />
      ))}
      <Label text="8K S35" w={0.34} h={0.07} pos={[-0.43, 0.55, 1.122]} size={58} color="#bfbcb5" />

      {/* ---------- operator side (-X): LCD, buttons, menu wheel ---------- */}
      <RBox size={[0.03, 0.66, 1.08]} r={0.015} pos={[-0.755, 0.17, 0.12]} mat={m.plastic} />
      <mesh position={[-0.772, 0.17, 0.12]} rotation={[0, -HALF_PI, 0]}>
        <planeGeometry args={[0.98, 0.58]} />
        <meshBasicMaterial name="lcd" map={lcd} toneMapped={false} />
      </mesh>
      <mesh position={[-0.774, 0.17, 0.12]} rotation={[0, -HALF_PI, 0]} material={m.screenGlass}>
        <planeGeometry args={[0.98, 0.58]} />
      </mesh>
      {[-0.32, -0.1, 0.12, 0.34].map((z, i) => (
        <group key={z}>
          <RBox size={[0.04, 0.08, 0.14]} r={0.015} pos={[-0.765, -0.32, z]} mat={m.plastic} />
          <Label text={['MENU', 'ISO', 'WB', 'FPS'][i]} w={0.16} h={0.05} pos={[-0.752, -0.42, z]} rot={[0, -HALF_PI, 0]} size={70} color="#a8a49c" />
        </group>
      ))}
      <XCyl r={0.085} len={0.05} pos={[-0.775, -0.32, 0.62]} mat={m.red} />
      <Gear rRoot={0.085} rTip={0.095} teeth={36} width={0.06} pos={[-0.78, -0.08, -0.62]} rot={[0, HALF_PI, 0]} mat={m.gunmetal} />

      {/* ---------- logo side (+X): fan grille, logo, I/O ---------- */}
      <RBox size={[0.02, 0.42, 1.2]} r={0.01} pos={[0.756, 0.36, -0.08]} mat={m.bodyPanel} />
      {Array.from({ length: 9 }, (_, i) => (
        <RBox key={i} size={[0.03, 0.022, 1.08]} r={0.008} pos={[0.762, 0.2 + i * 0.04, -0.08]} mat={m.screwHole} />
      ))}
      <mesh position={[0.758, -0.12, 0.1]} rotation={[0, HALF_PI, 0]}>
        <planeGeometry args={[1.0, 0.195]} />
        <meshBasicMaterial name="logo" map={logo} transparent toneMapped={false} />
      </mesh>
      {/* I/O: 3× BNC (SDI / TC), 2× LEMO power */}
      {[-0.82, -0.62, -0.42].map((z, i) => (
        <group key={z} position={[0.77, -0.48, z]}>
          <XCyl r={0.045} len={0.05} pos={[0.01, 0, 0]} mat={m.steel} seg={6} />
          <XCyl r={0.032} len={0.11} pos={[0.04, 0, 0]} mat={m.steel} />
          <XCyl r={0.012} len={0.12} pos={[0.045, 0, 0]} mat={m.screwHole} />
          <Label text={['SDI 1', 'SDI 2', 'TC'][i]} w={0.16} h={0.05} pos={[-0.012, -0.1, 0]} rot={[0, HALF_PI, 0]} size={70} />
        </group>
      ))}
      {[-0.15, 0.05].map((z, i) => (
        <group key={z} position={[0.77, -0.48, z]}>
          <XCyl r={0.04} len={0.06} pos={[0.01, 0, 0]} mat={m.red} />
          <XCyl r={0.03} len={0.07} pos={[0.02, 0, 0]} mat={m.gunmetal} />
          <Label text={['12V', 'AUX'][i]} w={0.14} h={0.05} pos={[-0.012, -0.1, 0]} rot={[0, HALF_PI, 0]} size={70} />
        </group>
      ))}
      {[
        [0.56, 0.86],
        [0.56, -0.9],
        [-0.56, 0.86],
        [-0.56, -0.9],
      ].map(([y, z]) => (
        <Screw key={`${y}${z}`} m={m} pos={[0.762, y, z]} />
      ))}

      {/* top: cheese plate with threaded holes */}
      <RBox size={[1.18, 0.05, 1.72]} r={0.02} pos={[0, 0.75, -0.05]} mat={m.gunmetal} />
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[(i % 3) * 0.3 - 0.3, 0.776, -0.72 + Math.floor(i / 3) * 0.38]} material={m.screwHole}>
          <cylinderGeometry args={[0.035, 0.035, 0.01, 16]} />
        </mesh>
      ))}

      {/* back: battery plate + V-mount battery with fuel gauge */}
      <RBox size={[1.2, 1.18, 0.08]} r={0.03} pos={[0, 0, -1.09]} mat={m.gunmetal} />
      <RBox size={[1.08, 0.94, 0.34]} r={0.06} pos={[0, -0.04, -1.3]} mat={m.plastic} />
      <RBox size={[1.1, 0.12, 0.36]} r={0.04} pos={[0, 0.38, -1.3]} mat={m.grip} />
      {[0, 1, 2, 3].map((i) => (
        <RBox key={i} size={[0.09, 0.035, 0.02]} r={0.008} pos={[-0.2 + i * 0.13, 0.2, -1.474]} mat={i < 3 ? m.led : m.ledDim} />
      ))}
      <ZCyl r={0.04} len={0.03} pos={[0.35, 0.2, -1.475]} mat={m.gunmetal} />
      <Label text="V-MOUNT  14.8V  150Wh" w={0.8} h={0.08} pos={[0, -0.1, -1.472]} rot={[0, Math.PI, 0]} size={36} />
      <Label text="FAIRFILM POWER" w={0.6} h={0.07} pos={[0, -0.28, -1.472]} rot={[0, Math.PI, 0]} size={42} color="#ff6b00" />
    </group>
  )
}

function Lens({ m }: { m: M }) {
  const barrel = useMemo(() => {
    // Turned barrel profile (radius, z) from mount to front
    const p: [number, number][] = [
      [0.44, 1.13],
      [0.47, 1.13],
      [0.47, 1.4],
      [0.5, 1.42],
      [0.5, 2.5],
      [0.53, 2.56],
      [0.6, 2.72],
      [0.62, 2.8],
      [0.62, 2.9],
      [0.56, 2.9],
      [0.53, 2.84],
      [0.5, 2.8],
    ]
    const g = new THREE.LatheGeometry(
      p.map(([r, z]) => new THREE.Vector2(r, z)),
      96,
    )
    g.rotateX(HALF_PI)
    return g
  }, [])

  const mats = useMemo(() => {
    const band = (map: THREE.Texture, name: string) => Object.assign(new THREE.MeshStandardMaterial({ map, roughness: 0.55, metalness: 0.3 }), { name })
    return {
      focus: band(
        bandTexture([
          { items: ['∞', '30', '15', '10', '7', '5', '4', '3', '2.5', '2', '1.75', '1.5', '1.25', 'ft'], color: '#f4f1ea', y: 44, size: 40 },
          { items: ['∞', '10', '5', '3', '2', '1.5', '1.2', '1', '0.8', '0.7', '0.6', '0.5', '0.45', 'm'], color: '#ff8a33', y: 96, size: 34 },
        ]),
        'bandFocus',
      ),
      iris: band(bandTexture([{ items: ['2.1', '2.8', '4', '5.6', '8', '11', '16', '22', 'C', '2.1', '2.8', '4', '5.6', '8'], color: '#f4f1ea', y: 66, size: 46 }]), 'bandIris'),
      name: band(
        bandTexture(
          [{ items: ['FAIRFILM', 'CINE PRIME', '35mm', 'T2.1', 'PL', 'FAIRFILM', 'CINE PRIME', '35mm', 'T2.1', 'PL'], color: '#dedbd4', y: 66, size: 40 }],
          false,
        ),
        'bandName',
      ),
    }
  }, [])

  // Iris diaphragm: an aperture ring with a 9-sided opening
  const diaphragm = useMemo(() => {
    const s = new THREE.Shape()
    s.absarc(0, 0, 0.5, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    for (let i = 0; i <= 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.2
      const px = Math.cos(a) * 0.17
      const py = Math.sin(a) * 0.17
      if (i === 0) hole.moveTo(px, py)
      else hole.lineTo(px, py)
    }
    s.holes.push(hole)
    return new THREE.ShapeGeometry(s, 32)
  }, [])

  return (
    <group>
      {/* PL mount with locking ring and lugs */}
      <ZCyl r={0.62} len={0.08} pos={[0, 0, 1.13]} mat={m.alu} seg={96} />
      <Gear rRoot={0.58} rTip={0.6} teeth={48} width={0.05} pos={[0, 0, 1.2]} mat={m.gunmetal} />
      {[0, 1, 2].map((i) => {
        const a = i * 2.09 + 0.5
        return <RBox key={i} size={[0.1, 0.06, 0.06]} r={0.015} pos={[Math.cos(a) * 0.66, Math.sin(a) * 0.66, 1.2]} rot={[0, 0, a]} mat={m.alu} />
      })}

      {/* turned barrel */}
      <mesh geometry={barrel} material={m.lensBarrel} />

      {/* focus: engraved scale + gear ring + rubber grip + witness mark */}
      <ZCyl r={0.505} len={0.2} pos={[0, 0, 1.58]} mat={mats.focus} seg={128} open />
      <Gear rRoot={0.535} rTip={0.565} teeth={96} width={0.09} pos={[0, 0, 1.78]} mat={m.gunmetal} />
      <ZCyl r={0.53} len={0.22} pos={[0, 0, 1.96]} mat={m.grip} seg={96} />
      <RBox size={[0.012, 0.03, 0.24]} r={0.004} pos={[0, 0.515, 1.6]} mat={m.white} />

      {/* iris: scale + gear + orange ID ring */}
      <ZCyl r={0.505} len={0.12} pos={[0, 0, 2.14]} mat={mats.iris} seg={128} open />
      <Gear rRoot={0.525} rTip={0.55} teeth={84} width={0.07} pos={[0, 0, 2.27]} mat={m.gunmetal} />
      <mesh position={[0, 0, 2.34]} material={m.orange}>
        <torusGeometry args={[0.507, 0.012, 12, 128]} />
      </mesh>

      {/* name ring */}
      <ZCyl r={0.505} len={0.1} pos={[0, 0, 2.44]} mat={mats.name} seg={128} open />

      {/* front: filter thread, aperture blades, coated elements */}
      <ZCyl r={0.625} len={0.04} pos={[0, 0, 2.88]} mat={m.alu} seg={96} open />
      <mesh geometry={diaphragm} position={[0, 0, 2.5]} material={m.screwHole} />
      <mesh position={[0, 0, 2.7]} scale={[1, 1, 0.3]} material={m.glass}>
        <sphereGeometry args={[0.5, 64, 32]} />
      </mesh>
      <mesh position={[0, 0, 2.86]} material={m.gunmetal}>
        <torusGeometry args={[0.5, 0.012, 8, 96]} />
      </mesh>
      <mesh position={[0.07, 0.05, 2.62]} material={m.coatViolet}>
        <torusGeometry args={[0.16, 0.012, 8, 48]} />
      </mesh>
      <mesh position={[-0.05, -0.04, 2.58]} material={m.coatGreen}>
        <torusGeometry args={[0.09, 0.01, 8, 48]} />
      </mesh>
      <mesh position={[0.02, -0.08, 2.55]} material={m.coatAmber}>
        <circleGeometry args={[0.035, 24]} />
      </mesh>
    </group>
  )
}

function SquareFrame({ size, bar, depth, z, mat }: { size: number; bar: number; depth: number; z: number; mat: THREE.Material }) {
  const o = (size - bar) / 2
  return (
    <group position={[0, 0, z]}>
      <RBox size={[size, bar, depth]} r={0.012} pos={[0, o, 0]} mat={mat} />
      <RBox size={[size, bar, depth]} r={0.012} pos={[0, -o, 0]} mat={mat} />
      <RBox size={[bar, size - 2 * bar, depth]} r={0.012} pos={[o, 0, 0]} mat={mat} />
      <RBox size={[bar, size - 2 * bar, depth]} r={0.012} pos={[-o, 0, 0]} mat={mat} />
    </group>
  )
}

function MatteBox({ m }: { m: M }) {
  return (
    <group position={[0, 0, 3.4]}>
      {/* body: square frustum (4 segments rotated 45° so edges are axis aligned) */}
      <mesh rotation={[HALF_PI, Math.PI / 4, 0]} material={m.matte}>
        <cylinderGeometry args={[1.12, 0.8, 0.9, 4, 1, true]} />
      </mesh>
      {/* front lip gives the walls visible thickness */}
      <SquareFrame size={1.6} bar={0.05} depth={0.05} z={0.45} mat={m.plastic} />
      {/* rear rubber donut */}
      <mesh position={[0, 0, -0.5]} material={m.rubber}>
        <torusGeometry args={[0.66, 0.05, 16, 64]} />
      </mesh>
      {/* filter stage + two trays with pull tabs */}
      <SquareFrame size={1.22} bar={0.09} depth={0.16} z={-0.32} mat={m.gunmetal} />
      {[-0.38, -0.27].map((z, i) => (
        <group key={z}>
          <SquareFrame size={1.12} bar={0.04} depth={0.03} z={z} mat={m.plastic} />
          <RBox size={[0.3, 0.12, 0.03]} r={0.012} pos={[0.2 - i * 0.4, 0.66, z]} mat={i ? m.orange : m.plastic} />
        </group>
      ))}
      {/* top french flag on a hinge */}
      <XCyl r={0.025} len={1.5} pos={[0, 0.79, 0.45]} mat={m.gunmetal} />
      <RBox size={[1.5, 0.025, 0.6]} r={0.01} pos={[0, 0.88, 0.72]} rot={[-0.32, 0, 0]} mat={m.matte} />
      {/* side wings */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.79, 0, 0.45]} material={m.gunmetal}>
            <cylinderGeometry args={[0.022, 0.022, 1.3, 12]} />
          </mesh>
          <RBox size={[0.025, 1.3, 0.55]} r={0.01} pos={[s * 0.86, 0, 0.7]} rot={[0, s * 0.28, 0]} mat={m.matte} />
        </group>
      ))}
    </group>
  )
}

function Rods({ m }: { m: M }) {
  return (
    <group>
      {/* baseplate with dovetail + shoulder pad */}
      <RBox size={[1.12, 0.16, 1.85]} r={0.03} pos={[0, -0.81, -0.05]} mat={m.gunmetal} />
      <RBox size={[0.7, 0.08, 1.9]} r={0.02} pos={[0, -0.93, -0.05]} mat={m.alu} />
      <RBox size={[0.9, 0.16, 0.9]} r={0.07} pos={[0, -1.05, -0.65]} mat={m.grip} />

      {/* 15 mm LWS rods */}
      {[-0.32, 0.32].map((x) => (
        <group key={x}>
          <ZCyl r={0.055} len={3.95} pos={[x, -1.0, 1.2]} mat={m.alu} seg={32} />
          <ZCyl r={0.06} len={0.05} pos={[x, -1.0, 3.18]} mat={m.gunmetal} seg={32} />
        </group>
      ))}
      {/* rod clamp under the body with wing knobs */}
      <RBox size={[0.98, 0.2, 0.32]} r={0.04} pos={[0, -1.0, 0.45]} mat={m.gunmetal} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.55, -1.0, 0.45]}>
          <XCyl r={0.05} len={0.08} pos={[s * 0.04, 0, 0]} mat={m.alu} />
          <RBox size={[0.03, 0.18, 0.06]} r={0.01} pos={[s * 0.1, 0, 0]} mat={m.alu} />
        </group>
      ))}
      {/* front support: clamp + post to the matte box */}
      <RBox size={[0.98, 0.2, 0.26]} r={0.04} pos={[0, -1.0, 2.95]} mat={m.gunmetal} />
      <RBox size={[0.12, 0.38, 0.12]} r={0.02} pos={[0, -0.75, 2.95]} mat={m.alu} />
      <XCyl r={0.045} len={0.07} pos={[0.53, -1.0, 2.95]} mat={m.alu} />
    </group>
  )
}

function FollowFocus({ m }: { m: M }) {
  const scale = useMemo(
    () =>
      canvasTexture(256, 256, (ctx) => {
        ctx.fillStyle = '#f2f0ea'
        ctx.beginPath()
        ctx.arc(128, 128, 126, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#111'
        ctx.fillStyle = '#111'
        ctx.font = '600 18px "JetBrains Mono", monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2
          const major = i % 3 === 0
          ctx.lineWidth = major ? 2.5 : 1
          ctx.beginPath()
          ctx.moveTo(128 + Math.cos(a) * 120, 128 + Math.sin(a) * 120)
          ctx.lineTo(128 + Math.cos(a) * (major ? 100 : 108), 128 + Math.sin(a) * (major ? 100 : 108))
          ctx.stroke()
          if (major) ctx.fillText(String(i / 3 + 1), 128 + Math.cos(a) * 84, 128 + Math.sin(a) * 84)
        }
        ctx.fillStyle = '#ff6b00'
        ctx.beginPath()
        ctx.arc(128, 128, 30, 0, Math.PI * 2)
        ctx.fill()
      }),
    [],
  )
  // the drive gear meshes with the lens focus gear (tip radius 0.565) at roughly -40°
  const ang = -0.7
  const gx = Math.cos(ang) * 0.73
  const gy = Math.sin(ang) * 0.73
  return (
    <group position={[0, 0, 1.78]}>
      <Gear rRoot={0.13} rTip={0.155} teeth={24} width={0.08} pos={[gx, gy, 0]} mat={m.alu} />
      <ZCyl r={0.03} len={0.18} pos={[gx, gy, 0]} mat={m.steel} />
      {/* body down to the rod clamp */}
      <RBox size={[0.24, 0.62, 0.18]} r={0.04} pos={[gx + 0.06, gy - 0.27, 0.12]} mat={m.plastic} />
      <RBox size={[0.3, 0.2, 0.24]} r={0.04} pos={[0.36, -1.0, 0.12]} mat={m.gunmetal} />
      {/* marking disc + knurled knob */}
      <group position={[gx + 0.26, gy - 0.3, 0.12]} rotation={[0, HALF_PI, 0]}>
        <mesh rotation={[HALF_PI, 0, 0]} material={m.plastic}>
          <cylinderGeometry args={[0.24, 0.24, 0.06, 48]} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <circleGeometry args={[0.22, 48]} />
          <meshStandardMaterial name="ffScale" map={scale} roughness={0.6} />
        </mesh>
        <Gear rRoot={0.12} rTip={0.135} teeth={40} width={0.1} pos={[0, 0, 0.09]} mat={m.grip} />
      </group>
    </group>
  )
}

/** Side handle on a rosette, with a record trigger. */
function SideHandle({ m }: { m: M }) {
  return (
    <group position={[-0.79, -0.15, 0.62]}>
      <Gear rRoot={0.11} rTip={0.125} teeth={60} width={0.04} rot={[0, HALF_PI, 0]} mat={m.alu} />
      <XCyl r={0.06} len={0.28} pos={[-0.14, 0, 0]} mat={m.gunmetal} />
      <RBox size={[0.16, 0.16, 0.3]} r={0.05} pos={[-0.3, 0, 0.1]} mat={m.gunmetal} />
      {/* grip: rubber with finger ridges */}
      <group position={[-0.32, -0.42, 0.18]} rotation={[0.18, 0, 0]}>
        <mesh material={m.grip}>
          <capsuleGeometry args={[0.11, 0.55, 8, 24]} />
        </mesh>
        {[-0.16, 0, 0.16].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[HALF_PI, 0, 0]} material={m.rubber}>
            <torusGeometry args={[0.112, 0.014, 8, 32]} />
          </mesh>
        ))}
      </group>
      <ZCyl r={0.04} len={0.04} pos={[-0.32, 0.03, 0.27]} mat={m.red} />
    </group>
  )
}

function TopRig({ m, screen }: { m: M; screen: ReactNode }) {
  const cables = useMemo(() => {
    const tube = (pts: V3[], r: number) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 64, r, 10, false)
    return {
      // SDI from the monitor down the operator side into the body
      sdi: tube(
        [
          [-0.5, 1.62, -0.86],
          [-0.95, 1.38, -1.0],
          [-1.08, 0.45, -0.95],
          [-0.95, -0.15, -0.88],
          [-0.78, -0.3, -0.82],
        ],
        0.022,
      ),
      power: tube(
        [
          [-0.3, 1.62, -0.88],
          [-0.2, 1.3, -1.22],
          [0.2, 0.6, -1.5],
          [0.35, 0.2, -1.48],
        ],
        0.02,
      ),
      xlr: tube(
        [
          [0, 1.44, 0.78],
          [0.25, 1.32, 0.6],
          [0.62, 0.9, 0.4],
          [0.8, 0.4, 0.2],
          [0.8, -0.48, 0.05],
        ],
        0.018,
      ),
    }
  }, [])

  return (
    <group>
      {/* top handle: NATO rail, supports, rubber grip, cold shoe */}
      <RBox size={[0.22, 0.06, 1.95]} r={0.02} pos={[0, 1.08, 0.1]} mat={m.gunmetal} />
      {[-0.62, 0.72].map((z) => (
        <RBox key={z} size={[0.16, 0.3, 0.16]} r={0.03} pos={[0, 0.92, z]} mat={m.gunmetal} />
      ))}
      <ZCyl r={0.085} len={1.1} pos={[0, 1.22, 0.05]} mat={m.grip} seg={32} />
      {[-0.55, 0.65].map((z) => (
        <RBox key={z} size={[0.12, 0.16, 0.12]} r={0.03} pos={[0, 1.16, z]} mat={m.gunmetal} />
      ))}

      {/* shotgun mic in a shock mount, foam windscreen */}
      <RBox size={[0.12, 0.12, 0.42]} r={0.03} pos={[0, 1.2, 1.15]} mat={m.plastic} />
      {[1.0, 1.32].map((z) => (
        <mesh key={z} position={[0, 1.44, z]} material={m.plastic}>
          <torusGeometry args={[0.1, 0.015, 8, 32]} />
        </mesh>
      ))}
      <ZCyl r={0.06} len={0.7} pos={[0, 1.44, 1.12]} mat={m.gunmetal} seg={32} />
      <mesh position={[0, 1.44, 1.78]} rotation={[HALF_PI, 0, 0]} material={m.foam}>
        <capsuleGeometry args={[0.1, 0.5, 8, 24]} />
      </mesh>

      {/* monitor: articulated arm + ball heads */}
      <group position={[-0.3, 1.22, -0.62]}>
        <mesh material={m.steel}>
          <sphereGeometry args={[0.06, 24, 16]} />
        </mesh>
        <mesh position={[-0.06, 0.16, -0.04]} rotation={[0.25, 0, 0.35]} material={m.alu}>
          <cylinderGeometry args={[0.035, 0.035, 0.36, 16]} />
        </mesh>
        <XCyl r={0.05} len={0.1} pos={[-0.12, 0.32, -0.08]} mat={m.orange} />
        <mesh position={[-0.13, 0.33, -0.08]} material={m.steel}>
          <sphereGeometry args={[0.05, 24, 16]} />
        </mesh>
      </group>
      <group position={[-0.45, 2.0, -0.82]} rotation={[0.24, Math.PI + 0.12, 0]}>
        <RBox size={[1.34, 0.86, 0.12]} r={0.05} mat={m.plastic} />
        <RBox size={[1.24, 0.74, 0.02]} r={0.01} pos={[0, 0, 0.056]} mat={m.screwHole} />
        <group position={[0, 0, 0.068]}>{screen}</group>
        <mesh position={[0, 0, 0.072]} material={m.screenGlass}>
          <planeGeometry args={[1.22, 0.69]} />
        </mesh>
        {[-0.45, -0.3, -0.15].map((x) => (
          <RBox key={x} size={[0.09, 0.03, 0.05]} r={0.01} pos={[x, 0.44, 0]} mat={m.gunmetal} />
        ))}
        <RBox size={[0.06, 0.02, 0.02]} r={0.005} pos={[0.5, 0.44, 0.03]} mat={m.led} />
        {/* sun hood */}
        <RBox size={[1.36, 0.02, 0.32]} r={0.008} pos={[0, 0.44, 0.2]} mat={m.matte} />
        {[-1, 1].map((s) => (
          <RBox key={s} size={[0.02, 0.88, 0.32]} r={0.008} pos={[s * 0.68, 0, 0.2]} mat={m.matte} />
        ))}
      </group>

      {/* EVF on a short rod, operator side */}
      <group position={[-0.82, 0.62, -0.42]}>
        <XCyl r={0.035} len={0.32} pos={[-0.1, 0, 0]} mat={m.alu} />
        <RBox size={[0.2, 0.24, 0.42]} r={0.05} pos={[-0.3, 0, -0.08]} mat={m.plastic} />
        <ZCyl r={0.12} len={0.22} pos={[-0.3, 0, -0.38]} mat={m.plastic} seg={32} />
        <ZCyl r={0.11} rFront={0.13} len={0.16} pos={[-0.3, 0, -0.55]} mat={m.rubber} seg={32} />
        <mesh position={[-0.3, 0, -0.63]} material={m.rubber}>
          <torusGeometry args={[0.12, 0.025, 12, 32]} />
        </mesh>
      </group>

      {/* cables */}
      <mesh geometry={cables.sdi} material={m.cableBlue} />
      <mesh geometry={cables.power} material={m.cable} />
      <mesh geometry={cables.xlr} material={m.cable} />
    </group>
  )
}

function Tally({ m }: { m: M }) {
  return (
    <group>
      <RBox size={[0.2, 0.09, 0.05]} r={0.02} pos={[0.45, 0.6, 1.1]} mat={m.plastic} />
      <mesh name="tally" position={[0.45, 0.6, 1.128]} material={m.tally} userData={{ dynamic: true }}>
        <boxGeometry args={[0.15, 0.05, 0.01]} />
      </mesh>
    </group>
  )
}

/* ================================================================== */

type BakeProps = { onBaked: (root: THREE.Group) => void }

const SCREEN_PLACEHOLDER = canvasTexture(4, 4, (ctx) => {
  ctx.fillStyle = '#0b0b0e'
  ctx.fillRect(0, 0, 4, 4)
})

/**
 * Builds the rig, merges every static mesh into one indexed mesh per material, keeps the few
 * runtime-driven nodes ("screen", "tally") separate, and hands the result to `onBaked` for export.
 */
export function CinemaCamera({ onBaked }: BakeProps) {
  const m = useNamedMaterials()
  const root = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    const r = root.current
    if (!r) return
    r.updateWorldMatrix(true, true)
    const toRoot = r.matrixWorld.clone().invert()
    const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>()
    const out = new THREE.Group()
    out.name = 'FairfilmCinemaCamera'
    const baked = (mesh: THREE.Mesh) => {
      let g = mesh.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, mesh.matrixWorld))
      if (g.index) g = g.toNonIndexed()
      for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name)
      if (!g.attributes.normal) g.computeVertexNormals()
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
      g.clearGroups()
      return g
    }
    r.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || Array.isArray(mesh.material)) return
      if (mesh.userData.dynamic) {
        const keep = new THREE.Mesh(mergeVertices(baked(mesh), 1e-5), mesh.material)
        keep.name = mesh.name
        out.add(keep)
        return
      }
      const mat = mesh.material as THREE.Material
      buckets.set(mat, [...(buckets.get(mat) ?? []), baked(mesh)])
    })
    buckets.forEach((geos, mat) => {
      const merged = mergeGeometries(geos, false)
      if (!merged) return
      const mesh = new THREE.Mesh(mergeVertices(merged, 1e-5), mat)
      mesh.name = mat.name || 'part'
      out.add(mesh)
    })
    onBaked(out)
  }, [onBaked])

  return (
    <group ref={root}>
      <Body m={m} />
      <Tally m={m} />
      <Lens m={m} />
      <MatteBox m={m} />
      <Rods m={m} />
      <FollowFocus m={m} />
      <SideHandle m={m} />
      <TopRig
        m={m}
        screen={
          <mesh name="screen" userData={{ dynamic: true }}>
            <planeGeometry args={[1.22, 0.69]} />
            {/* a (tiny) map keeps the UVs alive through glTF optimisation; the video replaces it at runtime */}
            <meshBasicMaterial name="screen" map={SCREEN_PLACEHOLDER} />
          </mesh>
        }
      />
    </group>
  )
}
