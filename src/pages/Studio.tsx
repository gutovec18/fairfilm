import { CTA } from '../components/ui/CTA'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { site } from '../data/site'
import { cx, media } from '../lib'
import { Card, Checks, GearCard } from './blocks'
import s from './Page.module.scss'

const sound = 'Zvukař s vybavením: 4CH mixer, MKH 416, Mikroport kit Sennheiser SK/EK 2000, sada klasických i skrytých mikrofonů.'

export function Studio() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Produkce', to: '/produkce' }, { label: 'Ateliér' }]}
        title={'Ateliér &\n*trikové* studio'}
        lead="Greenscreen, bluescreen, podcastové a TV studio v centru Prahy. Kompletně vybavené pro televizní pořady, filmy, reklamy, klipy i prezentace."
        image={media('img/studio-green.webp')}
      />

      <section className={s.section} id="obsah">
        <div className="container">
          <div className={s.facts}>
            <Reveal>
              <strong>3 m</strong>
              <span>výška pozadí</span>
            </Reveal>
            <Reveal delay={0.08}>
              <strong>4–6 m</strong>
              <span>šířka pozadí</span>
            </Reveal>
            <Reveal delay={0.16}>
              <strong>10 m</strong>
              <span>odstup od pozadí + zázemí</span>
            </Reveal>
            <Reveal delay={0.24}>
              <strong>5 kW</strong>
              <span>Fresnel · LED 5600 K / Tungsten 3200 K · flicker free</span>
            </Reveal>
          </div>

          <div className={cx(s.intro)} style={{ marginTop: '4rem' }}>
            <Reveal className={s.statement}>
              Trikový ateliér · greenscreen · bluescreen · <em>podcastové studio</em>
            </Reveal>
            <Reveal className={s.body} delay={0.1}>
              <p>
                Ateliér bude připravený a zasvícený kameramanem <strong>den předem</strong>. Během vaší frekvence se můžete
                věnovat hercům a vlastnímu natáčení.
              </p>
              <p>
                Specializovaný kameraman ateliér dobře zná, sám jej navrhoval. Připraví vše podle vašich požadavků a může
                sám pracovat i se světly, takže odpadá potřeba platit osvětlovače.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <SectionHead
            label="Nabídka technologie"
            title={'Tři sestavy podle\n*největší poptávky*'}
            intro={<p>Ke všem cenám bude připočtena DPH 21 %. Zvukaře s vybavením dodáme podle aktuální nabídky.</p>}
          />
          <div className={s.grid3}>
            <GearCard
              image={media('img/studio-2.webp')}
              tag="01 · Film & reklama"
              title="RED Epic 6K"
              text="Zasvícený ateliér s greenscreenem a zázemím pro film a reklamu do 6K při vzorkování 4:4:4."
              specs={[
                ['Rozlišení', '6144 × 3160, 4:4:4, REDRAW'],
                ['Optika', 'Zoom ZEISS LWZ3 21–100, sada Zeiss CP.3'],
                ['Grip', 'Stativ Sachtler, kamerová jízda'],
                ['Monitor', 'Kalibrovaný 22″'],
                ['Štáb', 'Lighting cameraman / DOP'],
              ]}
              price={{ value: '19 000 Kč', note: 'denní frekvence' }}
            />
            <GearCard
              image={media('img/studio-3.webp')}
              tag="02 · Film & reklama"
              title="ARRI Alexa"
              text="Zasvícený ateliér s greenscreenem a zázemím pro film a reklamu s kamerou ARRI Alexa podle vašich požadavků."
              specs={[
                ['Formát', 'ProRes HQ, ARRIRAW'],
                ['Optika', 'Sada pevných objektivů na vyžádání'],
                ['Štáb', 'Lighting cameraman / DOP'],
              ]}
              price={{ value: 'Na dotaz', note: 'aktuální cena' }}
              delay={0.08}
            />
            <GearCard
              image={media('img/studio-4.webp')}
              tag="03 · TV · stream · prezentace"
              title="Sony PXW FS7 4K"
              text="Trikové natáčení ve filmové kvalitě, TV tvorba, firemní prezentace, on-line streaming a livestream."
              specs={[
                ['Rozlišení', '4096 × 2160, 4:2:2, 1–60 fps (HD 120 fps)'],
                ['Formát', 'DNG, LVG, ProRes HQ, MPEG'],
                ['Optika', 'Zoom ZEISS LWZ3 21–100, Zeiss CP.3'],
                ['Grip', 'Stativ Sachtler, kamerová jízda'],
              ]}
              price={{ value: 'Na dotaz', note: 'aktuální cena' }}
              delay={0.16}
            />
          </div>
          <p className={s.note}>{sound}</p>
        </div>
      </section>

      <section className={s.section}>
        <div className="container">
          <SectionHead label="Výhody" title={'Proč točit\n*u nás*'} />
          <div className={s.grid3}>
            <Card index="Klíčování" title="Čisté pozadí">
              <Checks
                items={[
                  'Odstup od pozadí 10 m, v: 3 m, š: 4–6 m',
                  'Vynikající klíčovací pozadí s minimálním zpětným odrazem',
                  'Live greenkey pro 4K i HD formát',
                  'Virtuální studio, bluescreen, greenscreen, luma key',
                  'Různobarevná pozadí',
                ]}
              />
            </Card>
            <Card index="Technika" title="Post & světla" delay={0.08}>
              <Checks
                items={[
                  'Bohatý světelný park: Fresnel 5 kW, 2 kW, 1 kW, ARRI 300 W, Dedolight 100 W',
                  'VFX Fusion, Motion, FCPX na Mac Studio a iMac 5K',
                  '24″ kalibrovaný monitor Eizo',
                  'Referenční TV monitor Ikegami',
                  'Dva druhy čtecího zařízení',
                ]}
              />
            </Card>
            <Card index="Zázemí" title="Multifunkční prostory" delay={0.16}>
              <Checks items={['Internet', 'Maskérna a šatna', 'Sprcha', 'Kuchyňka, občerstvení', 'Příjemné posezení']} />
            </Card>
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <div className={s.split}>
            <Reveal className={s.mediaFrame}>
              <img src={media('stills/still-07.webp')} alt="" loading="lazy" decoding="async" />
            </Reveal>
            <div>
              <SectionHead label="Fotokomora & foto ateliér" title={'Analog\nnení *mrtvý*'} align="stack" />
              <Reveal className={s.body}>
                <p>
                  Kinofilm 6×6, 6×7, 6×9. Vyvolávání černobílých filmů a zvětšování fotografií v kompletně vybavené
                  fotokomoře o velikosti 5 × 2,2 m. Cena podle dohody a spotřebovaného materiálu.
                </p>
                <p>
                  Lekce se zkušeným lektorem, absolventem nebo pedagogem FAMU. Po dohodě a zaškolení i samostatná práce.
                  K dispozici je i foto ateliér s trvalými světly, záblesky a rekvizitami.
                </p>
                <p>
                  <strong>
                    {site.studio.label}, {site.studio.lines.join(', ')}
                  </strong>
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <CTA title="Rezervujte si *ateliér* na svůj natáčecí den." lead="Ozvěte se s termínem a požadavky. Vše připravíme a zasvítíme předem." />
    </>
  )
}
