import { CTA } from '../components/ui/CTA'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHead } from '../components/ui/SectionHead'
import { cx, media } from '../lib'
import { Card, Checks } from './blocks'
import s from './Page.module.scss'

export function SoundCrew() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Produkce', to: '/produkce' }, { label: 'Zvukaři' }]}
        title={'Zvukaři\npro film, TV\n& *reklamu*'}
        lead="Filmový a televizní zvukař na volné noze. Zkušení profesionálové s praxí zejména pro americké, britské a německé televizní společnosti a produkce."
        image={media('stills/still-02.webp')}
      />

      <section className={s.section} id="obsah">
        <div className="container">
          <div className={s.split}>
            <Reveal className={s.gearShot} y={30}>
              <img src={media('img/zvukar.webp')} alt="Směrový mikrofon s ochranou proti větru" loading="lazy" decoding="async" />
            </Reveal>
            <div>
              <SectionHead label="Zvuk, který se nedá přehlédnout" title={'Dobrý obraz\npotřebuje *skvělý*\nzvuk'} align="stack" />
              <Reveal className={s.body}>
                <p>
                  Sound Devices, Sennheiser, Sanken. Vybavení vyzkoušené pro světové televize, od rozhovorů v kanceláři po
                  natáčení pod vodou.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className={cx(s.section, s.alt)}>
        <div className="container">
          <SectionHead label="Sestavy" title={'Vyberte si\n*sestavu*'} intro={<p>Cena je uvedena bez 21% DPH.</p>} />
          <div className={s.grid2}>
            <Card index="Sestava 01" title="Zvukař s vybavením pro TV a corporate" price={{ value: '8 600 Kč', note: 'natáčecí den' }}>
              <Checks
                items={[
                  '8stopý Sound Devices MixPre II recorder / mixák',
                  'Polopuška MKH 8060, MKH 8050, MKH 416 U3',
                  '3 sady bezdrátových mikroportů Sennheiser SK/EK 2000 nebo ekvivalent',
                  'Mikrofony Sanken COS 11 a Sennheiser',
                  'Dvoukanálový odposlech pro režiséra',
                  'Stereo mic kit',
                  'Stereo set pro natáčení pod vodou (hydrofon)',
                  'Stereo geofon · 5.1 biofon',
                ]}
              />
              <p>Dalších 5 ks mikroportů k dispozici po 600 Kč za sadu. Při menším množství techniky možná sleva.</p>
            </Card>
            <Card
              index="Sestava 02"
              title="Zvukař pro hrané filmy a TV spoty"
              featured
              badge="Film"
              price={{ value: 'Dle vybavení', note: 'na dotaz' }}
              delay={0.08}
            >
              <p>Kompletní zvukové řešení pro hraný film a reklamu. K dispozici:</p>
              <Checks items={['Mikrofonisté', 'Další vybavení podle vašich požadavků', 'Podporujeme neziskové projekty a startupy']} />
            </Card>
          </div>
          <p className={s.note}>Natáčecí den se počítá do 10 hodin včetně dopravy na plac. Přesčasy 800 Kč / hod.</p>
        </div>
      </section>

      <CTA title="Rezervujte si *zvukaře* na svůj projekt." />
    </>
  )
}
