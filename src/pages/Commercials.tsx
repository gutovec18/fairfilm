import { Clapperboard, Film, MonitorPlay, Smartphone, Tv, BriefcaseBusiness } from 'lucide-react'
import { CTA } from '../components/ui/CTA'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { SplitText } from '../components/ui/SplitText'
import { cx, media } from '../lib'
import { Card, Checks, Timeline } from './blocks'
import s from './Page.module.scss'
import c from './Commercials.module.scss'

const steps = [
  { title: 'Úvodní konzultace', text: 'Nezávazně si ujasníme cíl projektu, cílovou skupinu a způsob využití videa. Pomůžeme definovat, co má video skutečně splnit.' },
  { title: 'Koncept a návrh řešení', text: 'Navrhujeme kreativní směr, styl vyprávění a strukturu sdělení. Vzniká scénář a plán produkce odpovídající vašemu rozpočtu i strategii.' },
  { title: 'Produkce a natáčení', text: 'Zajišťujeme kompletní realizaci: štáb, techniku, lokaci i vedení natáčení. Proces je organizovaný tak, aby minimálně zatěžoval váš tým.' },
  { title: 'Postprodukce', text: 'Střih, zvuk, barevné úpravy a finální ladění emocí i tempa. Průběžně konzultujeme, aby výsledek odpovídal očekávání.' },
  { title: 'Připraveno k využití', text: 'Dodáváme video optimalizované pro web, sociální sítě, kampaně i prezentace. Poradíme také, jak obsah využít co nejefektivněji.' },
]

const channels = [
  { icon: Smartphone, label: 'Online kampaně a sociální sítě' },
  { icon: BriefcaseBusiness, label: 'YouTube a LinkedIn marketing' },
  { icon: Tv, label: 'Televize a HbbTV' },
  { icon: Film, label: 'Kina a eventové prezentace' },
  { icon: MonitorPlay, label: 'Obrazovky a digitální média' },
]

export function Commercials() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Reklamní spoty' }]}
        title={'Reklamní spot\npřímo od *filmové*\nprodukce'}
        lead="Spoty pro televizi, online kampaně, sociální sítě i firemní komunikaci. Silný příběh. Jasný cíl. Reálný marketingový dopad."
        video={media('video/clip-spot.mp4')}
        image={media('stills/still-07.webp')}
      />

      <section className={s.section} id="obsah">
        <div className="container">
          <div className={s.intro}>
            <Reveal className={s.statement}>
              Reklamní spot ve <em>filmové</em> kvalitě? Ve Fairfilmu spolupracujete přímo s režisérem a produkčním týmem.
            </Reveal>
            <Reveal className={s.body} delay={0.1}>
              <p>
                <strong>Bez prostředníků, bez zbytečných nákladů a bez ztráty původní myšlenky.</strong>
              </p>
              <p>
                Dobrý nápad dnes prodává víc než drahá produkce. Klíčem je správné uchopení a vyprávění. Díky současným
                technologiím je vytvoření reklamního spotu podstatně jednodušší, což se projevuje i na výsledné ceně.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.tight)}>
        <div className="container">
          <div className={s.grid2}>
            <Card index="Pro koho" title="Pro firmy, které…">
              <Checks
                items={[
                  'chtějí profesionální reklamu bez agenturních rozpočtů',
                  'potřebují rychlé a přímé rozhodování',
                  'hledají filmovou kvalitu i strategické uvažování',
                  'chtějí mít kontrolu nad výsledkem',
                ]}
              />
            </Card>
            <Card index="Co získáte" title="S Fairfilmem získáte" featured delay={0.08}>
              <Checks
                items={[
                  'přímou komunikaci s tvůrci',
                  'kreativní koncept i produkci pod jednou střechou',
                  'efektivní využití rozpočtu',
                  'reklamní spot připravený pro TV i online prostředí',
                ]}
              />
            </Card>
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <SectionHead
            label="Jak vzniká reklamní spot"
            title={'Od první myšlenky\npo *finální* využití'}
            intro={<p>Každý projekt je jiný, ale proces zůstává jednoduchý a přehledný. Společně definujeme cíl reklamy, cílovou skupinu a způsob využití spotu.</p>}
          />
          <Timeline steps={steps} />
        </div>
      </section>

      <section className={s.section}>
        <div className="container">
          <SectionHead
            label="Kde může váš spot fungovat"
            title={'Ne jen\nv *televizi*'}
            intro={<p>Dnes už reklamní spot nežije jen v televizi, funguje napříč celým marketingem.</p>}
          />
          <div className={c.channels}>
            {channels.map(({ icon: Icon, label }, i) => (
              <Reveal key={label} delay={i * 0.06} className={c.channel}>
                <Icon size={30} strokeWidth={1.4} />
                <span>{label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className="container">
          <div className={s.split}>
            <div>
              <Reveal y={14}>
                <p className="eyebrow accent" style={{ marginBottom: '1.4rem' }}>
                  Proč přímo s Fairfilmem
                </p>
              </Reveal>
              <SplitText text={'Agentury oddělují\nstrategii a produkci.\n*My* je spojujeme.'} className={c.big} />
            </div>
            <Reveal className={c.priceBox} delay={0.1}>
              <Clapperboard size={36} strokeWidth={1.3} />
              <h3>Cena výroby reklamního spotu</h3>
              <p>
                Nechte si spočítat aktuální cenu podle našeho modelového scénáře. Seznamte se s naším tajemstvím nejlepšího
                poměru cena / kvalita.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <CTA title="Máte nápad na *reklamní* spot?" lead="Rádi s vámi nezávazně probereme možnosti a navrhneme řešení." />
    </>
  )
}
