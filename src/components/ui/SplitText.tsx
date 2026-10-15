import { m, type Variants } from 'motion/react'
import { EASE_OUT, cx } from '../../lib'
import s from './SplitText.module.scss'

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'

type Props = {
  /** Use "\n" for hard line breaks. Wrap a word in *asterisks* to accent it. */
  text: string
  as?: Tag
  className?: string
  delay?: number
  stagger?: number
  /** "view" animates when scrolled into view; a boolean drives it manually (e.g. after the intro). */
  trigger?: 'view' | boolean
}

const word: Variants = {
  hidden: { y: '110%', rotate: 4 },
  show: { y: '0%', rotate: 0, transition: { duration: 1.05, ease: EASE_OUT } },
}

/** Splits into lines of words; *asterisks* may wrap one word or a phrase spanning several words / lines. */
function parse(text: string) {
  let on = false
  return text.split('\n').map((line) =>
    line.split(' ').map((raw) => {
      if (raw.startsWith('*')) on = true
      const accent = on
      if (raw.endsWith('*')) on = false
      return { text: raw.replace(/\*/g, ''), accent }
    }),
  )
}

/** Masked word-by-word reveal: the main headline animation across the site. */
export function SplitText({ text, as = 'h2', className, delay = 0, stagger = 0.06, trigger = 'view' }: Props) {
  const Comp = m[as]
  const lines = parse(text)
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }
  const viewProps =
    trigger === 'view'
      ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } }
      : { initial: 'hidden', animate: trigger ? 'show' : 'hidden' }

  return (
    <Comp className={cx(s.root, className)} variants={container} aria-label={text.replace(/\*/g, '')} {...viewProps}>
      {lines.map((line, li) => (
        <span className={s.line} key={li} aria-hidden>
          {line.map((w, wi) => (
            <span className={s.mask} key={wi}>
              <m.span className={cx(s.word, w.accent && s.accent)} variants={word}>
                {w.text}
              </m.span>
            </span>
          ))}
        </span>
      ))}
    </Comp>
  )
}
