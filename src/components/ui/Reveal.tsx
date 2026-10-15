import { m } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE_OUT } from '../../lib'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'section' | 'article' | 'p'
}

/** Fade + rise once the element scrolls into view (transform/opacity only, so it stays on the compositor). */
export function Reveal({ children, className, delay = 0, y = 40, as = 'div' }: Props) {
  const Tag = m[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  )
}
