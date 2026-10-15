import { m, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { EASE_CINE } from '../../lib'
import s from './Effects.module.scss'

/**
 * Viewfinder cursor: a small dot that expands into a labelled disc over
 * elements carrying `data-cursor="Label"`, and into a ring over links.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 600, damping: 45, mass: 0.35 })
  const sy = useSpring(y, { stiffness: 600, damping: 45, mass: 0.35 })

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return
    setEnabled(true)
    document.body.classList.add('has-cursor')

    let lastTarget: EventTarget | null = null
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      if (e.target === lastTarget) return
      lastTarget = e.target
      const el = e.target instanceof Element ? e.target : null
      const labelled = el?.closest('[data-cursor]')
      setLabel(labelled?.getAttribute('data-cursor') ?? null)
      setHover(!!el?.closest('a, button, [role="button"], input, select, textarea, label'))
    }
    const leave = () => {
      x.set(-100)
      y.set(-100)
    }
    const press = () => setDown(true)
    const release = () => setDown(false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', release)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.body.classList.remove('has-cursor')
    }
  }, [x, y])

  if (!enabled) return null
  const size = label ? 92 : hover ? 46 : 10
  return (
    <m.div className={s.cursor} style={{ x: sx, y: sy }} aria-hidden>
      <m.div
        className={s.dot}
        data-mode={label ? 'label' : hover ? 'ring' : 'dot'}
        animate={{ width: size, height: size, scale: down ? 0.85 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {label && (
          <m.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}>
            {label}
          </m.span>
        )}
      </m.div>
    </m.div>
  )
}

/** Page-transition shutter: covers on exit, uncovers on enter. */
export function Shutter({ skipEnter = false }: { skipEnter?: boolean }) {
  return (
    <>
      <m.div
        className={s.shutter}
        initial={skipEnter ? false : { scaleY: 1, transformOrigin: '50% 0%' }}
        animate={{ scaleY: 0, transformOrigin: '50% 0%', transition: { duration: 0.8, ease: EASE_CINE, delay: 0.1 } }}
        exit={{ scaleY: 1, transformOrigin: '50% 100%', transition: { duration: 0.55, ease: EASE_CINE } }}
        aria-hidden
      />
      <m.div
        className={s.shutterLine}
        initial={skipEnter ? false : { scaleX: 1 }}
        animate={{ scaleX: 0, transition: { duration: 0.6, ease: EASE_CINE } }}
        exit={{ scaleX: 1, transition: { duration: 0.45, ease: EASE_CINE } }}
        aria-hidden
      />
    </>
  )
}

/** Opening film-leader countdown (3·2·1), shown once per browser session. */
export function Intro({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      onDone()
      return
    }
    const t = window.setTimeout(() => setCount((c) => c - 1), 520)
    return () => window.clearTimeout(t)
  }, [count, onDone])

  return (
    <m.div className={s.intro} exit={{ opacity: 1 }} transition={{ duration: 0.9 }} aria-hidden>
      <m.div
        className={s.half}
        data-pos="top"
        exit={{ y: '-100%' }}
        transition={{ duration: 0.9, ease: EASE_CINE }}
      />
      <m.div
        className={s.half}
        data-pos="bottom"
        exit={{ y: '100%' }}
        transition={{ duration: 0.9, ease: EASE_CINE }}
      />
      <m.div className={s.leader} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
        <span className={s.cross} />
        <span className={s.ringOuter} />
        <span className={s.ringInner} />
        <span key={count} className={s.sweep} />
        <span className={s.num}>{Math.max(count, 1)}</span>
      </m.div>
      <m.p className={s.slate} exit={{ opacity: 0 }}>
        Fairfilm · Praha · Reel {new Date().getFullYear()}
      </m.p>
    </m.div>
  )
}
