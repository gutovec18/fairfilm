import { CTA } from '../components/ui/CTA'
import { LogoCarousel } from '../components/ui/LogoCarousel'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { VideoPlayer } from '../components/ui/VideoPlayer'
import { site } from '../data/site'
import { cx, media } from '../lib'
import { Divisions } from './Home'
import s from './Page.module.scss'

export function Production() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Produkce' }]}
        title={'AV *produkce*'}
        lead="Filmy, reklamní spoty, dokumenty, věda a technologie, firemní prezentace. Kompletní produkce od scénáře po finální master."
        video={media('video/clip-film.mp4')}
        image={media('video/hero-poster.webp')}
      />

      <section className={s.section} id="obsah">
        <div className="container">
          <SectionHead
            label="Showreel"
            title={'Hrané filmy, reklamy,\ndokumenty, *věda*'}
            intro={<p>Výběr z naší tvorby pro televize, značky a instituce. Pro řadu dalších ukázek a plné verze nás prosím kontaktujte.</p>}
          />
          <Reveal>
            <VideoPlayer
              src={site.reelUrl}
              poster={media('video/reel-poster.webp')}
              title="Showreel Fairfilm Prague"
              meta="Drama · Documentary · Commercial"
            />
          </Reveal>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <div className={s.split}>
            <div>
              <SectionHead
                label="Celovečerní film"
                title={'Milá *Emo*'}
                align="stack"
                intro={
                  <p>
                    Celovečerní film v produkci Fairfilmu. Režisér Jiří Kairos Zeiner, absolvent FAMU a kameraman pro BBC,
                    Discovery Channel a National Geographic. Film si získává v předpremiéře první okouzlené diváky.
                  </p>
                }
              />
            </div>
            <Reveal delay={0.1}>
              <VideoPlayer
                src={site.trailerUrl}
                poster={media('video/emo-poster.webp')}
                title="Milá Emo: Trailer"
                meta="Celovečerní film"
                ringText="Trailer • Milá Emo • Trailer • Milá Emo • "
              />
            </Reveal>
          </div>
        </div>
      </section>

      <Divisions />

      <section className={cx(s.section, s.light)}>
        <div className="container">
          <SectionHead
            label="Naši klienti"
            tone="light"
            title={'Seznamte se s naším\ntajemstvím *nejlepšího*\npoměru cena/kvalita'}
          />
        </div>
        <LogoCarousel />
      </section>

      <CTA />
    </>
  )
}
