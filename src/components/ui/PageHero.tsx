import { m, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EASE_OUT, cx } from '../../lib'
import { useVideoInView } from '../../hooks/useVideoInView'
import { useIntroDone } from '../IntroContext'
import { SplitText } from './SplitText'
import s from './PageHero.module.scss'

type Props = {
  crumbs: { label: string; to?: string }[]
  title: string
  lead?: ReactNode
  image?: string
  video?: string
  children?: ReactNode
  size?: 'tall' | 'compact'
}

/** Sub-page opener: parallax media, slate metadata, masked headline. */
export function PageHero({ crumbs, title, lead, image, video, children, size = 'tall' }: Props) {
  const ready = useIntroDone()
  const ref = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  useVideoInView(videoRef)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.22])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className={cx(s.hero, s[size])}>
      <m.div className={s.media} style={{ y, scale }}>
        {video ? (
          <video ref={videoRef} src={video} poster={image} autoPlay muted loop playsInline />
        ) : (
          image && <img src={image} alt="" />
        )}
      </m.div>
      <div className={s.shade} />

      <m.div className={s.inner} style={{ opacity: fade }}>
        <m.nav
          className={s.crumbs}
          aria-label="Drobečková navigace"
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.5 }}
        >
          <Link to="/">Fairfilm</Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              <i>/</i>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <b>{c.label}</b>}
            </span>
          ))}
        </m.nav>

        <SplitText as="h1" text={title} className={s.title} trigger={ready} delay={0.55} stagger={0.07} />

        {lead && (
          <m.div
            className={s.lead}
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.95 }}
          >
            {lead}
          </m.div>
        )}
        {children}
      </m.div>

    </section>
  )
}
