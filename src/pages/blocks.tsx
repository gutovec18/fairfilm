import type { ReactNode } from 'react'
import { Reveal } from '../components/ui/Reveal'
import { cx } from '../lib'
import s from './Page.module.scss'

export function Specs({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className={s.specs}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Checks({ items }: { items: ReactNode[] }) {
  return (
    <ul className={s.checks}>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  )
}

type GearProps = {
  image: string
  tag?: string
  title: string
  text?: ReactNode
  specs?: [string, ReactNode][]
  price?: { value: string; note?: string }
  delay?: number
}

/** Camera / equipment package: product shot on a light plate + specs. */
export function GearCard({ image, tag, title, text, specs, price, delay = 0 }: GearProps) {
  return (
    <Reveal delay={delay}>
      <article className={s.gear}>
        <div className={s.gearShot}>
          {tag && <span>{tag}</span>}
          <img src={image} alt={title} loading="lazy" decoding="async" />
        </div>
        <div className={s.gearBody}>
          <h3>{title}</h3>
          {text && <p>{text}</p>}
          {specs && <Specs rows={specs} />}
          {price && (
            <div className={s.price}>
              <strong>{price.value}</strong>
              {price.note && <span>{price.note}</span>}
            </div>
          )}
        </div>
      </article>
    </Reveal>
  )
}

type CardProps = {
  index?: string
  title: string
  children?: ReactNode
  featured?: boolean
  badge?: string
  price?: { value: string; note?: string }
  delay?: number
}

export function Card({ index, title, children, featured, badge, price, delay = 0 }: CardProps) {
  return (
    <Reveal delay={delay}>
      <article className={cx(s.card, featured && s.featured)}>
        {badge && <span className={s.badge}>{badge}</span>}
        {index && <span className={s.cardIdx}>{index}</span>}
        <h3>{title}</h3>
        {children}
        {price && (
          <div className={s.price}>
            <strong>{price.value}</strong>
            {price.note && <span>{price.note}</span>}
          </div>
        )}
      </article>
    </Reveal>
  )
}

export function Timeline({ steps }: { steps: { title: string; text: ReactNode }[] }) {
  return (
    <ol className={s.timeline}>
      {steps.map((st, i) => (
        <Reveal as="li" key={st.title} className={s.tlItem} delay={0.05}>
          <span className={s.tlNum}>{String(i + 1).padStart(2, '0')}</span>
          <h3>{st.title}</h3>
          <p>{st.text}</p>
        </Reveal>
      ))}
    </ol>
  )
}
