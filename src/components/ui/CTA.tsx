import { m, useScroll, useTransform } from 'motion/react'
import { Mail, Phone } from 'lucide-react'
import { useRef } from 'react'
import { site } from '../../data/site'
import { media } from '../../lib'
import { Button } from './Button'
import { Reveal } from './Reveal'
import { SplitText } from './SplitText'
import s from './CTA.module.scss'

type Props = {
  title?: string
  lead?: string
}

/** Closing call to action: a direct line to the director. */
export function CTA({
  title = 'Pojďme zjistit, co může *nové* *video* udělat pro vaši značku.',
  lead = 'Nezávazná konzultace přímo s režisérem. Bez prostředníků, bez zbytečných nákladů a bez ztráty původní myšlenky.',
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])

  return (
    <section ref={ref} className={s.cta}>
      <m.div className={s.bg} style={{ y }}>
        <img src={media('img/hero-clouds.webp')} alt="" loading="lazy" decoding="async" />
      </m.div>
      <div className={s.shade} />

      <div className={s.inner}>
        <div className={s.copy}>
          <Reveal y={14}>
            <p className={s.eyebrow}>
              <span className={s.dot} /> Konzultace zdarma
            </p>
          </Reveal>
          <SplitText text={title} className={s.title} stagger={0.045} />
          <Reveal delay={0.15}>
            <p className={s.lead}>{lead}</p>
          </Reveal>
          <Reveal delay={0.25} className={s.actions}>
            <Button to="/kontakt">Domluvit konzultaci</Button>
            <Button href={site.phoneHref} variant="ghost" icon={<Phone size={16} />}>
              {site.phone}
            </Button>
          </Reveal>
        </div>

        <Reveal className={s.card} delay={0.2}>
          <div className={s.portrait}>
            <img src={media('img/zeiner.webp')} alt={site.director} loading="lazy" decoding="async" />
          </div>
          <div className={s.cardBody}>
            <span className={s.role}>Režisér · Producent · Absolvent FAMU</span>
            <strong>{site.director}</strong>
            <a href={`mailto:${site.directorEmail}`} className={s.mail}>
              <Mail size={15} /> {site.directorEmail}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
