import { startTransition, useEffect, useState } from 'react'
import { useIntroDone } from '../components/IntroContext'
import { afterLoadIdle, cancelIdle, whenIdle } from '../lib'

/** How long the hero's own entrance animation runs. Nothing heavy may start before it has finished. */
export const HERO_MS = 1400

let firstInteraction: Promise<void> | null = null
/** Resolves on the visitor's first scroll / wheel / touch / key: content must be ready the moment they move. */
export function onFirstInteraction() {
  if (!firstInteraction) {
    firstInteraction = new Promise((resolve) => {
      const events = ['wheel', 'touchstart', 'keydown', 'scroll'] as const
      const done = () => {
        events.forEach((e) => window.removeEventListener(e, done))
        resolve()
      }
      events.forEach((e) => window.addEventListener(e, done, { passive: true, once: true }))
    })
  }
  return firstInteraction
}

/**
 * Becomes true once the intro is done, the hero has finished animating, the page has loaded and the
 * browser has been idle for `order + 1` slots. If the visitor starts scrolling earlier, it flips right
 * away (`eager`), so deferred content is never missing. Everything heavy on the site is scheduled through
 * this, staggered by `order`, so the first seconds stay at a clean 60 fps.
 */
export function useAfterHero(order = 0, { eager = true } = {}) {
  const ready = useIntroDone()
  const [go, setGo] = useState(false)
  useEffect(() => {
    if (!ready || go) return
    let alive = true
    let idle = 0
    const fire = () => alive && startTransition(() => setGo(true))
    const timer = window.setTimeout(() => {
      void afterLoadIdle().then(() => {
        let remaining = order + 1
        const step = () => {
          if (!alive) return
          if (--remaining <= 0) fire()
          else idle = whenIdle(step, 800)
        }
        idle = whenIdle(step, 800)
      })
    }, HERO_MS)
    if (eager) void onFirstInteraction().then(fire)
    return () => {
      alive = false
      window.clearTimeout(timer)
      cancelIdle(idle)
    }
  }, [ready, go, order, eager])
  return go
}
