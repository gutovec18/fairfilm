import { CTA } from '../components/ui/CTA'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { site } from '../data/site'
import { cx, media } from '../lib'
import s from './Page.module.scss'
import a from './Academy.module.scss'

const workshops = [
  {
    img: 'img/akademie-head.webp',
    title: 'Před kamerou, za kamerou',
    sub: 'Workshop pro přirozený tělesný a hlasový projev',
    text: 'Abychom měli vyvážený pohled před kamerou i za kamerou, bývá většinou hostem profesionální herec.',
    price: '2 800 Kč',
    note: 'dva čtyřhodinové workshopy',
  },
  {
    img: 'img/workshop-pribeh.webp',
    title: 'Poznej příběh',
    sub: 'Půldenní zážitkový workshop',
    text: 'Naše nevědomí nerozumí slovům, ale příběhům. V bezpečném prostoru si zažijete příběh všemi smysly. Ideální pro začínající spisovatele, filmaře, dramatiky, blogery. Hodí se i k přijímacím zkouškám na umělecké školy.',
    price: '2 200 Kč',
    note: 'šestihodinový workshop',
  },
  {
    img: 'img/workshop-foto.webp',
    title: 'Natáčej a foť bez úsilí',
    sub: 'Půldenní workshop',
    text: 'Zdokonalíte se v základech a vaše obrázky se mohou stát srovnatelné, někdy i lepší než ty profesionální. Krajina, portrét, výtvarná fotografie, sociální sítě, produkty.',
    price: '2 500 Kč',
    note: 'šestihodinový workshop',
  },
  {
    img: 'img/workshop-improvizace.webp',
    title: 'Kurz improvizace',
    sub: 's Jiřím Kairosem Zeinerem',
    text: 'Improvizační cvičení na míru. Od teambuildingu až po základy divadelní improvizace. Vhodné pro každého, kdo má touhu na sobě pracovat a přitom se bavit.',
    price: 'Na dotaz',
    note: 'i jako teambuilding',
  },
  {
    img: 'img/workshop-meditace.webp',
    title: 'Meditace Sahaja jógy',
    sub: 's Jiřím Kairosem Zeinerem',
    text: 'Funkční meditace pro každého.',
    price: 'Zdarma',
    note: 'tradičně',
  },
]

export function Academy() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Produkce', to: '/produkce' }, { label: 'Fairfilm akademie' }]}
        title={'Fér filmová\n*škola*'}
        lead="Kurzy, workshopy a lektorská činnost. Příběh, kamera, improvizace a osobnostní rozvoj s lektorem, který si s kamerou splnil všechny své sny."
        image={media('img/svc-socialni-site.webp')}
      />

      <section className={s.section} id="obsah">
        <div className="container">
          <div className={a.bio}>
            <Reveal className={a.portrait}>
              <img src={media('img/zeiner.webp')} alt={site.director} loading="lazy" decoding="async" />
              <span>Lektor · Absolvent FAMU</span>
            </Reveal>
            <div>
              <SectionHead label="Lektor" title={'Jiří Kairos\n*Zeiner*'} align="stack" />
              <Reveal className={s.body}>
                <p>
                  Filmový a televizní producent, režisér, kameraman, básník, divadelní improvizátor, Sahaja jogín. Absolvent
                  FAMU. Natáčí pro televizní společnosti jako BBC, Discovery Channel, National Geographic, FoxTV, NHK, MTV,
                  ORF, ARTE a mnoho dalších.
                </p>
                <p>
                  Vlastník a CEO Fairfilmu. Před objektivem jeho kamery se objevuje mnoho významných osobností, skvělých
                  herců, držitelů Oscara a dalších prestižních cen. Jeho právě dokončený film <strong>Milá Emo</strong> si
                  získává v předpremiéře první okouzlené diváky.
                </p>
              </Reveal>
            </div>
          </div>

          <Reveal className={s.quote} delay={0.1}>
            <blockquote style={{ margin: '6rem 0 0' }}>
              Rád a vášnivě pracuji na poznání a osobnostním rozvoji. Stejně tak předávám dál, co se předat dá, a někdy i to,
              co se jen tak předat nedá.
              <footer>{site.director}</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <SectionHead
            label="Kurzy a workshopy"
            title={'Naučte se\n*vyprávět*'}
            intro={<p>Workshopy probíhají ve Fairfilm studiu, Dittrichova 11, Praha 2. Studenti mají slevu.</p>}
          />
          <div className={a.list}>
            {workshops.map((w, i) => (
              <Reveal key={w.title} delay={0.05}>
                <article className={a.ws}>
                  <div className={a.wsImg}>
                    <img src={media(w.img)} alt={w.title} loading="lazy" decoding="async" />
                  </div>
                  <div className={a.wsBody}>
                    <span className={a.wsIdx}>{String(i + 1).padStart(2, '0')}</span>
                    <h3>{w.title}</h3>
                    <p className={a.wsSub}>{w.sub}</p>
                    <p>{w.text}</p>
                  </div>
                  <div className={a.wsPrice}>
                    <strong>{w.price}</strong>
                    <span>{w.note}</span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA title="Přihlaste se na *workshop*." lead="Napište nám, o který kurz máte zájem. Pošleme vám termíny a podrobnosti." />
    </>
  )
}
