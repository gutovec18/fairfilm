import { CTA } from '../components/ui/CTA'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { VideoPlayer } from '../components/ui/VideoPlayer'
import { site } from '../data/site'
import { cx, media } from '../lib'
import s from './Page.module.scss'

const formats = [
  'Firemní prezentace',
  'Výroba firemního videa',
  'Produktová videa',
  'Natáčení eventů',
  '360 VR videa',
  'Videoprezentace',
  'Korporátní video',
  'Video spoty',
  'Natáčení rozhovorů a výpovědí',
]

const gallery = [
  { img: 'img/svc-korporatni.webp', label: 'Korporátní video' },
  { img: 'img/svc-konference.webp', label: 'Konference & eventy' },
  { img: 'img/svc-rozhovory.webp', label: 'Rozhovory' },
  { img: 'img/svc-produktove.webp', label: 'Produktová videa' },
  { img: 'img/svc-socialni-site.webp', label: 'Sociální sítě' },
  { img: 'img/svc-promo.webp', label: 'Promo video' },
]

export function VideoProduction() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Produkce', to: '/produkce' }, { label: 'Video produkce' }]}
        title={'Video produkce\n*Praha*'}
        lead="Korporátní produkce, eventy, rozhovory a videa, která mají jasný cíl."
        video={media('video/clip-corporate.mp4')}
        image={media('img/svc-korporatni.webp')}
      />

      <section className={s.section} id="obsah">
        <div className="container">
          <div className={s.intro}>
            <Reveal className={s.statement}>
              Kreativní videoprodukce s bohatými zkušenostmi z výroby pořadů v <em>Evropě</em> a{' '}
              <em>Severní Americe</em>.
            </Reveal>
            <Reveal className={s.body} delay={0.1}>
              <p>
                Díky intenzivní spolupráci s mnoha zahraničními televizemi a velkými společnostmi můžeme nabídnout
                natáčení dokonalými technologiemi za velmi zajímavé ceny.
              </p>
              <p>
                <strong>Vyzkoušejte naše služby.</strong> Patříme k nejvyhledávanějším produkcím a s každým klientem
                jednáme přímo, bez prostředníků.
              </p>
            </Reveal>
          </div>
          <Reveal className={s.tags} delay={0.15}>
            {formats.map((f) => (
              <span key={f} className={s.tag}>
                {f}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className={s.section}>
        <div className="container">
          <SectionHead label="Formáty" title={'Co pro vás\n*natočíme*'} />
          <div className={s.grid3}>
            {gallery.map((g, i) => (
              <Reveal key={g.label} delay={(i % 3) * 0.08}>
                <div className={s.imgCard}>
                  <img src={media(g.img)} alt="" loading="lazy" decoding="async" />
                  <span>{g.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <SectionHead label="Showreel" title={'Podívejte se,\njak *pracujeme*'} />
          <Reveal>
            <VideoPlayer src={site.reelUrl} poster={media('video/reel-poster.webp')} title="Showreel Fairfilm" meta="Video produkce Praha" />
          </Reveal>
        </div>
      </section>

      <CTA title="Seznamte se s naším tajemstvím *nejlepšího* poměru cena/kvalita." />
    </>
  )
}
