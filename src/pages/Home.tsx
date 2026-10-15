import { m, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Component, lazy, startTransition, Suspense, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Deferred } from '../components/Deferred'
import { useIntroDone } from '../components/IntroContext'
import { useVideoInView } from '../hooks/useVideoInView'
import { Button } from '../components/ui/Button'
import { CTA } from '../components/ui/CTA'
import { LogoCarousel } from '../components/ui/LogoCarousel'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { SplitText } from '../components/ui/SplitText'
import { VideoPlayer } from '../components/ui/VideoPlayer'
import { process, productionLinks, site } from '../data/site'
import { EASE_OUT, afterLoadIdle, cx, media } from '../lib'
import s from './Home.module.scss'

// three.js is heavy: load the 3D showcase in its own chunk
const CameraShowcase = lazy(() => import('../components/three/CameraShowcase'))

/** If the 3D chunk fails to load (offline, blocked), skip the section instead of crashing the page. */
class SkipOnError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function Home() {
  return (
    <>
      <Hero />
      {/* below the fold: rendered after first paint, one section per idle slot */}
      <Deferred order={0}>
        <DeferredShowcase />
        <Showreel />
      </Deferred>
      <Deferred order={1}>
        <Process />
        <Services />
      </Deferred>
      <Deferred order={2}>
        <Clients />
      </Deferred>
      <Deferred order={3}>
        <Divisions />
        <CTA />
      </Deferred>
    </>
  )
}

/**
 * Mounts the 3D section only once the page is loaded, the intro is over and the browser is idle,
 * or straight away if the visitor scrolls close to it first. Keeps the first load spike-free.
 */
function DeferredShowcase() {
  const ready = useIntroDone()
  const placeholder = useRef<HTMLDivElement>(null)
  const near = useInView(placeholder, { margin: '0px 0px 60% 0px', once: true })
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    if (!ready) return
    let alive = true
    void afterLoadIdle().then(() => alive && startTransition(() => setIdle(true)))
    return () => {
      alive = false
    }
  }, [ready])

  if (!idle && !near) return <div ref={placeholder} className={s.showcasePlaceholder} />
  return (
    <SkipOnError>
      <Suspense fallback={<div className={s.showcasePlaceholder} />}>
        <CameraShowcase />
      </Suspense>
    </SkipOnError>
  )
}

/* ------------------------------------------------------------------ */

function Hero() {
  const ready = useIntroDone()
  const ref = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  useVideoInView(video)
  // The poster is preloaded and paints instantly; the 2 MB loop only starts downloading once the page is idle.
  const [loadVideo, setLoadVideo] = useState(false)
  useEffect(() => {
    let alive = true
    void afterLoadIdle().then(() => alive && setLoadVideo(true))
    return () => {
      alive = false
    }
  }, [])
  useEffect(() => {
    const v = video.current
    if (!loadVideo || !v) return
    v.load()
    void v.play().catch(() => {})
  }, [loadVideo])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18])
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.8, ease: EASE_OUT, delay },
  })

  return (
    <section ref={ref} className={s.hero}>
      <m.div className={s.heroMedia} style={{ scale, y }}>
        <video ref={video} muted loop playsInline preload="none" poster={media('video/hero-poster.webp')}>
          {/* MP4 first: Safari loops H.264 reliably, while its WebM looping is flaky */}
          {loadVideo && <source src={media('video/hero.mp4')} type="video/mp4" />}
          {loadVideo && <source src={media('video/hero.webm')} type="video/webm" />}
        </video>
      </m.div>
      <div className={s.heroShade} />

      {/* Letterbox bars open once the intro is done */}
      <m.div
        className={cx(s.letterbox, s.lbTop)}
        initial={{ scaleY: 1 }}
        animate={ready ? { scaleY: 0.28 } : undefined}
        transition={{ duration: 1.6, ease: [0.7, 0, 0.2, 1], delay: 0.1 }}
      />
      <m.div
        className={cx(s.letterbox, s.lbBottom)}
        initial={{ scaleY: 1 }}
        animate={ready ? { scaleY: 0.28 } : undefined}
        transition={{ duration: 1.6, ease: [0.7, 0, 0.2, 1], delay: 0.1 }}
      />

      <m.div className={s.heroInner} style={{ y: contentY, opacity: fade }}>
        <m.p className={s.heroEyebrow} {...show(0.05)}>
          Filmová & video produkce · Praha
        </m.p>
        <SplitText
          as="h1"
          text={'Videa, která\n*pracují* pro\nváš podnik'}
          className={s.heroTitle}
          trigger={ready}
          delay={0.08}
          stagger={0.06}
        />
        <div className={s.heroBottom}>
          <m.p className={s.heroLead} {...show(0.2)}>
            {site.subclaim}
          </m.p>
          <m.div className={s.heroActions} {...show(0.3)}>
            <Button href="#showreel">Showreel</Button>
            <Button to="/kontakt" variant="ghost">
              Nezávazná konzultace
            </Button>
          </m.div>
        </div>
      </m.div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */

function Showreel() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.84, 1])

  return (
    <section ref={ref} className={s.showreel} id="showreel">
      <div className="container">
        <SectionHead
          label="Showreel"
          title={'Filmy, reklamy\n& *dokumenty*'}
          intro={<p>Natáčíme pro BBC, Discovery Channel, National Geographic i Českou televizi. Stejnou kvalitu přinášíme i značkám a firmám.</p>}
        />
        <m.div style={{ scale }} className={s.reelWrap}>
          <VideoPlayer
            src={site.reelUrl}
            poster={media('video/reel-poster.webp')}
            title="Showreel Fairfilm Prague"
          />
        </m.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Process() {
  return (
    <section className={s.process}>
      <div className="container">
        <SectionHead label="Jak spolupráce probíhá" title={'Od nápadu\npo *výsledek*'} />
        <ol className={s.steps}>
          {process.map((p, i) => (
            <Reveal as="li" key={p.key} className={s.step} delay={i * 0.1}>
              <span className={s.stepNum}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.key}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

const services = [
  { title: 'Reklamní spoty', note: 'TV · online · sociální sítě', to: '/reklamni-spoty', clip: 'spot' },
  { title: 'Firemní prezentace', note: 'B2B · veletrhy · employer branding', to: '/firemni-prezentace', clip: 'corporate' },
  { title: 'Film & dokument', note: 'Hrané filmy · TV pořady', to: '/produkce', clip: 'film' },
  { title: 'Věda & technologie', note: 'Laboratoře · průmysl · výroba', to: '/firemni-prezentace', clip: 'science' },
  { title: 'Rozhovory & storytelling', note: 'Výpovědi · portréty · kampaně', to: '/produkce/video-produkce', clip: 'interview' },
  { title: 'AI Art', note: 'Robofilosofie · AI design', to: '/produkce/ai-art', clip: 'robot' },
]

function Services() {
  const [active, setActive] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 22 })
  const sy = useSpring(y, { stiffness: 180, damping: 22 })

  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return
      if (i === active) v.play().catch(() => {})
      else v.pause()
    })
  }, [active])

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = listRef.current?.getBoundingClientRect()
    if (!r) return
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
  }

  return (
    <section className={s.services}>
      <div className="container">
        <SectionHead
          label="Co děláme"
          title={'Od spotu\npo *celovečerák*'}
        />
        <div ref={listRef} className={s.svcWrap} onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
          <ul className={s.svcList}>
          {services.map((svc, i) => (
            <Reveal as="li" key={svc.title} delay={i * 0.05}>
              <Link
                to={svc.to}
                className={cx(s.svcRow, active !== null && active !== i && s.svcDim)}
                onPointerEnter={() => setActive(i)}
                data-cursor="Otevřít"
              >
                <span className={s.svcTitle}>{svc.title}</span>
                <span className={s.svcNote}>{svc.note}</span>
                <ArrowUpRight className={s.svcArrow} size={28} />
              </Link>
            </Reveal>
          ))}
          </ul>

          <m.div
            className={s.preview}
            style={{ x: sx, y: sy }}
            animate={{ opacity: active === null ? 0 : 1, scale: active === null ? 0.6 : 1 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            aria-hidden
          >
            {services.map((svc, i) => (
              <video
                key={svc.clip}
                ref={(el) => {
                  videos.current[i] = el
                }}
                src={media(`video/clip-${svc.clip}.mp4`)}
                muted
                loop
                playsInline
                preload="none"
                className={cx(s.previewVid, active === i && s.previewOn)}
              />
            ))}
          </m.div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Clients() {
  return (
    <section className={s.clients}>
      <div className="container">
        <SectionHead
          label="Reference"
          tone="light"
          title={'Firmy, které nám\n*důvěřují*'}
        />
      </div>
      <LogoCarousel />
    </section>
  )
}

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */

const divisionImages: Record<string, string> = {
  '/produkce/video-produkce': 'img/svc-korporatni.webp',
  '/produkce/ai-art': 'ai/d3d2a48.webp',
  '/produkce/atelier': 'img/studio-green.webp',
  '/produkce/filmovy-stab': 'stills/still-01.webp',
  '/produkce/televizni-stab': 'img/svc-rozhovory.webp',
  '/produkce/zvukari': 'stills/still-02.webp',
  '/produkce/akademie': 'img/svc-socialni-site.webp',
}

export function Divisions() {
  return (
    <section className={s.divisions}>
      <div className="container">
        <SectionHead
          label="Produkce"
          title={'Vše pod jednou\n*střechou*'}
        />
        <div className={s.divGrid}>
          {productionLinks.map((d, i) => (
            <Reveal key={d.to} delay={(i % 3) * 0.08} className={cx(s.divCell, (i === 0 || i === productionLinks.length - 1) && s.divWide)}>
              <Link to={d.to} className={s.divCard} data-cursor="Zobrazit">
                <img src={media(divisionImages[d.to])} alt="" loading="lazy" decoding="async" />
                <span className={s.divShade} />
                <span className={s.divBody}>
                  <strong>{d.label}</strong>
                  <small>{d.note}</small>
                </span>
                <span className={s.divArrow}>
                  <ArrowUpRight size={20} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
