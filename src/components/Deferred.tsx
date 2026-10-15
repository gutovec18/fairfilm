import type { ReactNode } from 'react'
import { useAfterHero } from '../hooks/useAfterHero'

/**
 * Renders its children once the hero has finished animating (or as soon as the visitor scrolls), as a
 * low-priority React transition. `order` staggers blocks into separate idle slots so each DOM commit stays small.
 */
export function Deferred({ children, order = 0, minHeight = '100vh' }: { children: ReactNode; order?: number; minHeight?: string }) {
  const show = useAfterHero(order)
  return show ? children : <div style={{ minHeight }} aria-hidden />
}
