import { CTA } from '../components/ui/CTA'
import { LogoCarousel } from '../components/ui/LogoCarousel'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { cx, media } from '../lib'
import { Card, Checks, GearCard } from './blocks'
import s from './Page.module.scss'

export function TvCrew() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Produkce', to: '/produkce' }, { label: 'Televizní štáb' }]}
        title={'Televizní\n*štáb*'}
        lead="Štáby pro televizní pořady a firemní prezentace. Kameramani a zvukaři jsou absolventi FAMU s praxí ve filmu a televizi."
        video={media('video/clip-interview.mp4')}
        image={media('img/svc-rozhovory.webp')}
      />

      <section className={s.section} id="obsah">
        <div className="container">
          <SectionHead label="Kamery" title={'4K štáby\npro *televizi*'} />
          <div className={s.grid2}>
            <GearCard
              image={media('img/tvstab-2.webp')}
              tag="Cinema style"
              title="Sony FS7 / FX6"
              text="Televizní štáb se 4K kamerou Sony FS7 nebo FX6."
              specs={[
                ['Formát', '4:4:4 · 2K, 4K, 6K, 8K'],
                ['Optika', 'Sada pevných objektivů Zeiss, zoomy podle výběru'],
              ]}
            />
            <GearCard
              image={media('img/tvstab-1.webp')}
              tag="Broadcast"
              title="Sony PXW-Z750 XDCAM"
              text="Televizní štáb se 4K kamerou PXW-Z750 XDCAM HD/4K."
              specs={[
                ['Formát', 'XDCAM HD / 4K'],
                ['Optika', 'Sada pevných objektivů Zeiss, zoomy podle výběru'],
              ]}
              delay={0.08}
            />
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <div className={s.grid2}>
            <Card index="Štáb" title="Praxe ze světových televizí">
              <p>
                Naši kameramani a zvukaři jsou absolventi FAMU s praxí ve filmu a televizi. Natáčejí pro CNN, BBC, National
                Geographic, Discovery Channel, CNBC, NHK, Starz, Českou televizi, Novu, Primu a mnoho dalších. Další profese
                jsou obsazeny osvědčenými profesionály ve svých oborech.
              </p>
            </Card>
            <Card index="Zvuk" title="Vyzkoušeno v terénu" delay={0.08}>
              <p>
                Zvukové vybavení značek Sennheiser, Neumann, Sound Devices je vyzkoušené v nejnáročnějších podmínkách. Každý
                štáb má k dispozici kompletní sadu:
              </p>
              <Checks
                items={['Směrový mikrofon (polopuška)', '2 bezdrátové mikroporty', 'Bezdrátový ruční mikrofon', 'Klasická „hendka“ + speciální mikrofony podle situace']}
              />
            </Card>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className="container">
          <div className={s.split}>
            <div>
              <SectionHead label="Neostýchejte se zeptat" title={'Na cokoliv\n*dalšího*'} align="stack" />
              <Reveal>
                <h3 className={s.h3}>Celková cena záleží na</h3>
                <Checks items={['množství techniky a světelného parku', 'vzdálenosti natáčení', 'době a náročnosti natáčení']} />
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <Checks
                items={[
                  'Vícekamerové natáčení nebo speciální sestavu na přání',
                  'Více kamerových štábů',
                  'Specializované kameramany: letecký, podvodní, Steadicam operator…',
                  'Rychloběžné, časosběrné a další trikové natáčení',
                  'Světelný park od 100 W do 4 kW HMI',
                  'Doprava 4+1, 5+1 nebo 8+1',
                  'Životopis členů štábu',
                  'Výhodnou nabídku pro sestřih a postprodukci',
                  'Věrnostní slevy :-)',
                ]}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.light)}>
        <div className="container">
          <SectionHead label="Natáčeli jsme pro" tone="light" title={'Televize po\ncelém *světě*'} align="stack" />
        </div>
        <LogoCarousel />
      </section>

      <CTA title="Potřebujete *štáb* na zítra?" lead="Zavolejte nebo napište. Dostupnost a sestavu vám potvrdíme během pár hodin." />
    </>
  )
}
