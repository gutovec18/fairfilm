import type { ReactNode } from 'react'
import { cx } from '../../lib'
import { Reveal } from './Reveal'
import { SplitText } from './SplitText'
import s from './SectionHead.module.scss'

type Props = {
  label: string
  title: string
  intro?: ReactNode
  align?: 'split' | 'stack'
  tone?: 'dark' | 'light'
  className?: string
}

/** Small label + masked headline + optional intro paragraph. */
export function SectionHead({ label, title, intro, align = 'split', tone = 'dark', className }: Props) {
  return (
    <header className={cx(s.head, s[align], s[tone], className)}>
      <div>
        <Reveal y={16}>
          <p className={s.eyebrow}>{label}</p>
        </Reveal>
        <SplitText text={title} className={s.title} />
      </div>
      {intro && (
        <Reveal className={s.intro} delay={0.2}>
          {intro}
        </Reveal>
      )}
    </header>
  )
}
