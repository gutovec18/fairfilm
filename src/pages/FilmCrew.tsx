import { CTA } from '../components/ui/CTA'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { cx, media } from '../lib'
import { Card, Checks, GearCard } from './blocks'
import s from './Page.module.scss'

export function FilmCrew() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Produkce', to: '/produkce' }, { label: 'Filmový štáb' }]}
        title={'Filmový\n*štáb*'}
        lead="Film, hrané televizní pořady a reklamy. Štáb s digitální kinematografickou kamerou, od RED 8K po klasickou ARRICAM 35 mm."
        image={media('stills/still-01.webp')}
        video={media('video/clip-pilot.mp4')}
      />

      <section className={s.section} id="obsah">
        <div className="container">
          <SectionHead
            label="Kamery"
            title={'Digitální\n*kinematografie*'}
            intro={<p>Sada pevných objektivů Zeiss a zoomy podle výběru. Jinou kameru rádi zajistíme podle vašeho přání.</p>}
          />
          <div className={s.grid2}>
            <GearCard
              image={media('img/stab-red.webp')}
              tag="Hlavní kamera"
              title="RED Epic 8K Helium"
              text="Filmový štáb s kamerou RED EPIC 8K HELIUM DSMC2 S35, kamera pro digitální kinematografii."
              specs={[
                ['Rozlišení', '2K, 4K, 6K, 8K · 4:4:4'],
                ['Senzor', 'Super 35'],
                ['Optika', 'Sada pevných objektivů Zeiss, zoomy podle výběru'],
              ]}
            />
            <GearCard
              image={media('img/stab-alexa.webp')}
              tag="Reklama & film"
              title="ARRI Alexa · Amira · Mini"
              text="Super 35 mm 3,4K kamera pro digitální kinematografii a výrobu reklamních spotů."
              specs={[
                ['Senzor', 'Super 35 mm, 3,4K'],
                ['Optika', 'Sada pevných objektivů a zoom podle výběru'],
              ]}
              delay={0.08}
            />
            <GearCard
              image={media('img/stab-f55.webp')}
              tag="Film"
              title="Sony PMW-F55"
              text="Super 35 mm 4K kamera pro digitální kinematografii."
              specs={[
                ['Senzor', 'Super 35 mm, 4K'],
                ['Optika', 'Sada pevných objektivů a zoom podle výběru'],
              ]}
            />
            <GearCard
              image={media('img/stab-tv.webp')}
              tag="TV & dokument"
              title="Sony PXW-FS7"
              text="Super 35 mm čip pro kinematografický styl obrazu."
              specs={[
                ['Zoom', 'Zeiss LWZ 21–100 / T 2,9–3,9'],
                ['Pevné', '11 mm / 2,0 · 14 mm / 2,8 · 85 mm / T1,5'],
                ['Zoomy', '18–36 mm / T1,9 · 70–200 mm / T2,9'],
              ]}
              delay={0.08}
            />
          </div>

          <Reveal className={s.split} delay={0.1}>
            <div style={{ marginTop: '1rem' }}>
              <Card index="Klasika" title="ARRICAM 35 mm" featured badge="Na film">
                <p>Klasická filmová kamera stále k dispozici. Sada pevných objektivů a zoom podle výběru.</p>
              </Card>
            </div>
            <div className={s.gearShot} style={{ borderRadius: 20, marginTop: '1rem' }}>
              <img src={media('img/stab-crew.webp')} alt="ARRICAM 35 mm" loading="lazy" decoding="async" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <SectionHead label="Sestavy štábu" title={'Štáb na\n*míru*'} intro={<p>Natáčecí den je do 10 hodin. Jsme plátci DPH.</p>} />
          <div className={s.grid3}>
            <Card index="Sestava 01" title="Kameraman + asistent + ostřič">
              <p>Kompaktní kamerový tým pro reklamy, klipy a menší hrané projekty.</p>
            </Card>
            <Card index="Sestava 02" title="+ Zvukař" delay={0.08}>
              <p>Kamerový tým doplněný o zkušeného zvukaře s kompletním vybavením.</p>
            </Card>
            <Card index="Sestava 03" title="+ Zvukař + osvětlovači" featured badge="Kompletní" delay={0.16}>
              <p>Plnohodnotný filmový štáb včetně osvětlovačů a světelného parku.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className="container">
          <div className={s.split}>
            <SectionHead label="Neostýchejte se zeptat" title={'Cokoliv\nnavíc. *Zařídíme.*'} align="stack" />
            <Reveal>
              <Checks
                items={[
                  'Jinou kameru podle vašeho výběru',
                  'Vícekamerové natáčení',
                  'Světelný park od 100W Dedolightů po 12kW HMI, Kinoflo, LED panely…',
                  'CV členů štábu',
                  'Speciální kamery a zařízení: high speed do 1000 fps, podvodní boxy, 4K GoPro, dron…',
                  'Kamerovou jízdu, kamerový jeřáb, Steadicam, gimbal…',
                  'Jakékoliv kombinace a požadavky na techniku',
                  'Postprodukci zajišťuje Fairfilm',
                  'Slevy pro nekomerční a zajímavé projekty',
                ]}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <CTA title="Poptávka & *rezervace* filmového štábu." lead="Napište nám termín, lokaci a typ projektu. Sestavu a techniku doladíme spolu." />
    </>
  )
}
