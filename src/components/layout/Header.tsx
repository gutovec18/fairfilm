import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { nav, productionLinks, site } from '../../data/site'
import { EASE_CINE, EASE_OUT, cx, media } from '../../lib'
import { Button } from '../ui/Button'
import s from './Header.module.scss'

export function Header() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    const nextScrolled = v > 40
    const nextHidden = v > prev && v > 240
    if (nextScrolled !== scrolled) setScrolled(nextScrolled)
    if (nextHidden !== hidden) setHidden(nextHidden)
  })

  // Close any open menu when the route changes
  useEffect(() => {
    setMenuOpen(false)
    setMegaOpen(false)
  }, [pathname])

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  return (
    <>
      <m.header
        className={cx(s.header, (scrolled || megaOpen) && s.solid)}
        animate={{ y: hidden && !menuOpen && !megaOpen ? '-110%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className={s.bar}>
          <Link to="/" className={s.logo} aria-label="Fairfilm, úvodní stránka">
            <img src={media('brand/fairfilm-logo.png')} alt="Fairfilm" width={750} height={172} />
          </Link>

          <nav className={s.nav} aria-label="Hlavní navigace">
            {nav.map((item) =>
              item.children ? (
                <div key={item.to} className={s.hasMega} onMouseEnter={() => setMegaOpen(true)}>
                  <NavLink to={item.to} className={({ isActive }) => cx(s.link, isActive && s.active)}>
                    {item.label}
                    <ChevronDown size={14} className={cx(s.chev, megaOpen && s.chevOpen)} />
                  </NavLink>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cx(s.link, isActive && s.active)}
                  onMouseEnter={() => setMegaOpen(false)}
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className={s.right}>
            <Button to="/kontakt" className={s.cta}>
              Konzultace
            </Button>
            <button
              type="button"
              className={cx(s.burger, menuOpen && s.burgerOpen)}
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Zavřít menu' : 'Otevřít menu'}
            >
              <span />
              <span />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {megaOpen && (
            <m.div
              className={s.mega}
              initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
              exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.5, ease: EASE_CINE }}
            >
              <div className={s.megaInner}>
                <ul className={s.megaList}>
                  {productionLinks.map((l, i) => (
                    <m.li
                      key={l.to}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.04, duration: 0.6, ease: EASE_OUT }}
                    >
                      <NavLink to={l.to} className={({ isActive }) => cx(s.megaLink, isActive && s.active)}>
                        <span className={s.megaIdx}>{String(i + 1).padStart(2, '0')}</span>
                        <span className={s.megaLabel}>{l.label}</span>
                        <span className={s.megaNote}>{l.note}</span>
                        <ArrowUpRight size={18} className={s.megaArrow} />
                      </NavLink>
                    </m.li>
                  ))}
                </ul>
                <Link to="/produkce" className={s.megaFeature} data-cursor="Showreel">
                  <video src={media('video/clip-film.mp4')} autoPlay muted loop playsInline />
                  <span>
                    <small>AV produkce</small>
                    Showreel & ukázky
                  </span>
                </Link>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.header>

      <AnimatePresence>{menuOpen && <MobileMenu />}</AnimatePresence>
    </>
  )
}

function MobileMenu() {
  const links = [{ label: 'Domů', to: '/' }, ...nav, ...productionLinks.map((l) => ({ label: l.label, to: l.to, sub: true }))]
  return (
    <m.div
      className={s.mobile}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.7, ease: EASE_CINE }}
    >
      <nav className={s.mobileNav} aria-label="Mobilní navigace">
        {links.map((l, i) => (
          <m.div
            key={l.to}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.035, duration: 0.7, ease: EASE_OUT }}
          >
            <NavLink
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => cx('sub' in l ? s.mobileSub : s.mobileLink, isActive && s.active)}
            >
              {l.label}
            </NavLink>
          </m.div>
        ))}
      </nav>
      <m.div
        className={s.mobileFoot}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <a href={site.phoneHref}>{site.phone}</a>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </m.div>
    </m.div>
  )
}
