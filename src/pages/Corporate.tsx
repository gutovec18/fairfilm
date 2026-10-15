import { CTA } from '../components/ui/CTA'
import { LogoCarousel } from '../components/ui/LogoCarousel'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { VideoPlayer } from '../components/ui/VideoPlayer'
import { site } from '../data/site'
import { cx, media } from '../lib'
import { Timeline } from './blocks'
import s from './Page.module.scss'

const categories = [
  { img: 'img/svc-science.webp', label: 'Věda' },
  { img: 'img/svc-veda.webp', label: 'Technologie' },
  { img: 'img/svc-automotive.webp', label: 'Automotive' },
  { img: 'img/svc-prumysl.webp', label: 'Průmysl' },
  { img: 'img/svc-prezentacni.webp', label: 'Prezentační video' },
  { img: 'img/svc-korporatni.webp', label: 'Korporátní video' },
  { img: 'img/svc-produktove.webp', label: 'Produktové video' },
  { img: 'img/svc-firemniprezentace.webp', label: 'Firemní videoprezentace' },
  { img: 'img/svc-rozhovory.webp', label: 'Rozhovory' },
  { img: 'img/svc-konference.webp', label: 'Konference a eventy' },
  { img: 'img/svc-neziskovky.webp', label: 'Neziskové organizace' },
  { img: 'img/svc-socialni-site.webp', label: 'Sociální sítě' },
  { img: 'img/svc-promo.webp', label: 'Promo video' },
]

const steps = [
  {
    title: 'Nezávazná poptávka',
    text: 'I když teprve zvažujete výrobu videoprezentace, dejte nám vědět co nejdříve. Dostatek času pomůže kvalitě výsledku často víc než větší rozpočet.',
  },
  {
    title: 'Scénář videoprezentace',
    text: 'Po nastudování problematiky dohodneme bodový scénář, upřesníme rozpočet a harmonogram natáčení. Grafika vzniká souběžně s natáčením. Kvalitní scénář obvykle trvá 1–2 týdny.',
  },
  {
    title: 'Natáčení ve firmě',
    text: 'Většinou záležitost jednoho až dvou dnů. Doporučujeme připravit nové oblečení pro zaměstnance a dohlédnout na vybraný provoz a kanceláře.',
  },
  {
    title: 'Sestřih',
    text: 'První hrubý off-line sestřih obvykle následuje do týdne po natáčení. Pak lze naplánovat první prezentaci nebo poslat video ke korekci.',
  },
  {
    title: 'Grafické a trikové práce',
    text: 'Po schválení off-line střihu dotvoříme grafické prvky v konečné kvalitě (3–10 dní). V ceně nabízíme dvě kola úprav, na každou počítejte se třemi dny.',
  },
  {
    title: 'Schválení finální verze',
    text: 'Finální mix zvuku a výroba videa v různých formátech: pro YouTube, sociální sítě, veletrhy, prezentace i obchodní jednání.',
  },
  {
    title: 'Jazykové verze',
    text: 'Včasná příprava textů pro obraz i voice-over výrazně zkrátí výrobu mutací. Překlad a dabing trvá přibližně týden.',
  },
  {
    title: 'Cena',
    text: 'Cena se počítá na základě scénáře podle počtu natáčecích dnů, náročnosti natáčení a požadavků na vzhled. Napište si o rozpočet.',
  },
]

export function Corporate() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Firemní prezentace' }]}
        title={'Firemní\n*videoprezentace*'}
        lead="Veletrhy, internet, B2B i B2C. Nechte náš tým vyprávět váš jedinečný firemní příběh."
        video={media('video/clip-corporate.mp4')}
        image={media('img/svc-firemniprezentace.webp')}
      />

      <section className={s.section} id="obsah">
        <div className="container">
          <div className={s.intro}>
            <Reveal className={s.statement}>
              Prezentační video je jeden z <em>nejefektivnějších</em> nástrojů marketingové komunikace.
            </Reveal>
            <Reveal className={s.body} delay={0.1}>
              <p>
                Náš tým kreativců, filmařů a specialistů vám nabízí řešení na evropské úrovni. Využijte našich zkušeností s
                výrobou prezentací prestižních českých, ale hlavně nadnárodních společností.
              </p>
              <p>
                <strong>Nechte náš tým vyprávět váš jedinečný firemní příběh.</strong>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.tight)}>
        <div className="container">
          <SectionHead label="Obory a formáty" title={'Natáčíme\n*všude*'} />
          <div className={s.grid4}>
            {categories.map((c, i) => (
              <Reveal key={c.label} delay={(i % 4) * 0.06}>
                <div className={s.imgCard}>
                  <img src={media(c.img)} alt="" loading="lazy" decoding="async" />
                  <span>{c.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <SectionHead
            label="Jak vzniká videoprezentace"
            title={'Osm kroků\nk *hotovému* videu'}
            intro={<p>Transparentní proces s jasnými termíny. Víte, co se děje v každé fázi a kolik to bude stát.</p>}
          />
          <Timeline steps={steps} />
        </div>
      </section>

      <section className={s.section}>
        <div className="container">
          <SectionHead label="Showreel" title={'Ukázky z\n*naší* tvorby'} />
          <Reveal>
            <VideoPlayer src={site.reelUrl} poster={media('video/reel-poster.webp')} title="Showreel Fairfilm" meta="Věda · Technologie · Průmysl" />
          </Reveal>
        </div>
      </section>

      <section className={cx(s.section, s.light)}>
        <div className="container">
          <SectionHead label="Reference" tone="light" title={'Následující firmy nám\ndaly *důvěru*'} intro={<p>Zvolte si nás také.</p>} />
        </div>
        <LogoCarousel />
      </section>

      <CTA title="Pozvěte nás do svého *výběrového* řízení." />
    </>
  )
}
