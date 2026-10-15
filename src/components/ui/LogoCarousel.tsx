import { useInView } from 'motion/react'
import { useRef } from 'react'
import { brandClients, mediaClients, type Client } from '../../data/clients'
import { cx, media } from '../../lib'
import s from './LogoCarousel.module.scss'

function Row({ items, reverse, duration }: { items: Client[]; reverse?: boolean; duration: number }) {
  // The list is rendered twice so the -50% keyframe loops seamlessly.
  const loop = [...items, ...items]
  return (
    <div className={s.row}>
      <ul className={cx(s.track, reverse && s.reverse)} style={{ animationDuration: `${duration}s` }}>
        {loop.map((c, i) => {
          // the second copy only exists for the seamless loop: hide it from screen readers and the tab order
          const clone = i >= items.length
          const logo = <img src={media(`clients/${c.slug}.webp`)} alt={clone ? '' : c.name} loading="lazy" decoding="async" draggable={false} />
          return (
            <li key={`${c.slug}-${i}`} className={s.item} aria-hidden={clone || undefined}>
              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.link}
                  title={c.name}
                  tabIndex={clone ? -1 : undefined}
                  data-cursor="Web"
                >
                  {logo}
                </a>
              ) : (
                <span className={s.link}>{logo}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Two-row infinite logo marquee: rows drift in opposite directions, pause on hover. */
export function LogoCarousel({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { margin: '100px' })
  return (
    <div ref={ref} className={cx(s.carousel, !visible && s.paused, className)} role="region" aria-label="Firmy, které nám důvěřují">
      <Row items={mediaClients} duration={70} />
      <Row items={brandClients} duration={78} reverse />
    </div>
  )
}
