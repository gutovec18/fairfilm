import { startTransition, useEffect, useState, type ReactNode } from 'react'
import { cancelIdle, whenIdle } from '../lib'

/**
 * Renders its children after the first paint, during idle time, as a low-priority React transition.
 * `order` staggers several deferred blocks into separate idle slots so each DOM commit stays small and
 * nothing blocks the main thread long enough to drop frames while the hero animates in.
 */
export function Deferred({ children, order = 0, minHeight = '100vh' }: { children: ReactNode; order?: number; minHeight?: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    let idle = 0
    // first frame painted → wait (order + 1) idle slots → render in the background
    const raf = requestAnimationFrame(() => {
      let remaining = order + 1
      const step = () => {
        if (--remaining <= 0) startTransition(() => setShow(true))
        else idle = whenIdle(step, 600)
      }
      idle = whenIdle(step, 600)
    })
    return () => {
      cancelAnimationFrame(raf)
      cancelIdle(idle)
    }
  }, [order])
  return show ? children : <div style={{ minHeight }} aria-hidden />
}
