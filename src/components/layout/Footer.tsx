import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { nav, site } from '../../data/site'
import { media } from '../../lib'
import { Reveal } from '../ui/Reveal'
import s from './Footer.module.scss'

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <Reveal className={s.brand}>
          <img src={media('brand/fairfilm-logo.png')} alt="Fairfilm" width={750} height={172} loading="lazy" decoding="async" />
          <p>{site.claim}. Filmová a video produkce z Prahy pro televize, značky i instituce po celém světě.</p>
          <a href={site.international} target="_blank" rel="noreferrer" className={s.intl}>
            International production · fairfilm.eu <ArrowUpRight size={14} />
          </a>
        </Reveal>

        <Reveal className={s.col} delay={0.05}>
          <h3>Kontakt</h3>
          <a href={site.phoneHref} className={s.strong}>
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className={s.strong}>
            {site.email}
          </a>
          <a href={`mailto:${site.directorEmail}`}>Režisér: {site.directorEmail}</a>
        </Reveal>

        <Reveal className={s.col} delay={0.1}>
          <h3>{site.studio.label}</h3>
          {site.studio.lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
          <h3 className={s.mt}>{site.billing.label}</h3>
          {site.billing.lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </Reveal>

        <Reveal className={s.col} delay={0.15}>
          <h3>Navigace</h3>
          {nav.map((n) => (
            <Link key={n.to} to={n.to}>
              {n.label}
            </Link>
          ))}
        </Reveal>
      </div>

      <div className={s.legal}>
        <p>
          Obsah těchto stránek je chráněn autorským zákonem. <b>FAIR</b>
          <b className="accent">FILM</b> je registrovaná obchodní značka. © 2015–{new Date().getFullYear()} Mgr. Jiří Zeiner.
          All rights reserved.
        </p>
        <button type="button" className={s.top} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Nahoru <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  )
}
