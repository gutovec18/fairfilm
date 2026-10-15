import { AnimatePresence, m } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CTA } from '../components/ui/CTA'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { EASE_OUT, media } from '../lib'
import s from './AiArt.module.scss'
import p from './Page.module.scss'

const works = [
  'd3d2a48', '97c140e', '3d2ae55', 'a2bdfd7', '365ee9f', 'e1922f9', '6399502', 'b5bf21a',
  '0b0723a', 'cce4067', 'a3112a6', 'bcf8c3d', '2c4ab85', 'ed96dae', '4b5c10f', 'c8e762d',
  '1cd34c1', 'f201912', '3000615', 'e43a299', '7c120df', 'b4d9e27', 'dd49335', '906088b',
  'b23abd7', '4760c18', 'e02016b', 'fefb054',
].map((id) => media(`ai/${id}.webp`))

export function AiArt() {
  const [open, setOpen] = useState<number | null>(null)

  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + works.length) % works.length)), [])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [open, step])

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Produkce', to: '/produkce' }, { label: 'AI Art' }]}
        title={'AI Art\n*Robofilosofie*'}
        lead="Kreativní produkce na hraně filmu, designu a umělé inteligence. Vizuály, koncepty a příběhy, které by kamera sama nenatočila."
        video={media('video/clip-robot.mp4')}
        image={media('ai/d3d2a48.webp')}
      />

      <section className={p.section} id="obsah">
        <div className="container">
          <SectionHead
            label="Galerie"
            title={'Stroje, které\n*přemýšlejí*'}
            intro={
              <p>
                Série Robofilosofie zkoumá, co nás dělá lidmi, skrze tváře strojů. AI design využíváme v kampaních,
                storyboardech, key visualech i jako součást hraných spotů.
              </p>
            }
          />
          <div className={s.masonry}>
            {works.map((src, i) => (
              <Reveal key={src} delay={(i % 4) * 0.06} className={s.item}>
                <button type="button" onClick={() => setOpen(i)} data-cursor="Zvětšit" aria-label={`Otevřít dílo ${i + 1}`}>
                  <img src={src} alt={`Robofilosofie ${i + 1}`} loading="lazy" decoding="async" />
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA title="Máte nápad, který *kamera* sama nenatočí?" lead="Spojíme AI design s filmovým řemeslem, od konceptu po hotový spot." />

      <AnimatePresence>
        {open !== null && (
          <m.div
            className={s.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Náhled díla"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <AnimatePresence mode="wait">
              <m.img
                key={open}
                src={works[open]}
                alt=""
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
            <button type="button" className={s.close} onClick={() => setOpen(null)} aria-label="Zavřít">
              <X />
            </button>
            <button
              type="button"
              className={s.prev}
              onClick={(e) => {
                e.stopPropagation()
                step(-1)
              }}
              aria-label="Předchozí"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className={s.next}
              onClick={(e) => {
                e.stopPropagation()
                step(1)
              }}
              aria-label="Další"
            >
              <ChevronRight />
            </button>
            <span className={s.counter}>
              {String(open + 1).padStart(2, '0')} / {works.length}
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
