import { AnimatePresence, m } from 'motion/react'
import { Check, Mail, MapPin, Phone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '../components/ui/Button'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { site } from '../data/site'
import { EASE_OUT, cx, media } from '../lib'
import s from './Contact.module.scss'

const interests = [
  'Nezávazná poptávka reklamního spotu',
  'Firemní video',
  'Natáčení eventu',
  'Pronájem ateliéru / štábu',
  'Workshop osobnostního rozvoje',
  'Workshop teambuildingu',
]

type Errors = Partial<Record<'name' | 'email', string>>

export function Contact() {
  const [interest, setInterest] = useState(interests[0])
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (data.get('website')) return // honeypot
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const next: Errors = {}
    if (!name) next.name = 'Vyplňte prosím jméno.'
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Zadejte platný e-mail.'
    setErrors(next)
    if (Object.keys(next).length) return

    // TODO: napojit na backend / formulářovou službu. Zatím otevře e-mailového klienta s předvyplněnou zprávou.
    const body = [
      `Jméno: ${name}`,
      `E-mail: ${email}`,
      `Firma: ${data.get('company') || '-'}`,
      `Mám zájem o: ${interest}`,
      '',
      String(data.get('message') ?? ''),
    ].join('\n')
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Poptávka: ${interest}`)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Kontakt' }]}
        title={'Jak vám\nmůžeme *pomoci*?'}
        lead="Pro rozpočet a info volejte nebo pište. Konzultace je nezávazná a rovnou s režisérem."
        image={media('img/hero-clouds.webp')}
        size="compact"
      />

      <section className={s.section} id="obsah">
        <div className={cx('container', s.grid)}>
          <Reveal className={s.formWrap}>
            <AnimatePresence mode="wait">
              {sent ? (
                <m.div
                  key="ok"
                  className={s.success}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                >
                  <span className={s.okIcon}>
                    <Check size={28} />
                  </span>
                  <h2>Děkujeme!</h2>
                  <p>
                    Otevřeli jsme váš e-mailový klient s připravenou zprávou. Pokud se neotevřel, napište nám přímo na{' '}
                    <a href={`mailto:${site.email}`}>{site.email}</a>.
                  </p>
                  <Button variant="ghost" onClick={() => setSent(false)}>
                    Nová zpráva
                  </Button>
                </m.div>
              ) : (
                <m.form key="form" className={s.form} onSubmit={submit} noValidate exit={{ opacity: 0, y: -20 }}>
                  <fieldset className={s.chips}>
                    <legend>Mám zájem o</legend>
                    {interests.map((i) => (
                      <label key={i} className={cx(s.chip, interest === i && s.chipOn)}>
                        <input type="radio" name="interest" value={i} checked={interest === i} onChange={() => setInterest(i)} />
                        {i}
                      </label>
                    ))}
                  </fieldset>

                  <div className={s.row}>
                    <Field label="Vaše jméno *" name="name" error={errors.name} autoComplete="name" />
                    <Field label="E-mail *" name="email" type="email" error={errors.email} autoComplete="email" />
                  </div>
                  <Field label="Firma" name="company" autoComplete="organization" />
                  <Field label="Upřesnění" name="message" textarea />

                  {/* Spam protection: leave empty */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />

                  <div className={s.submit}>
                    <p>S vašimi údaji bude nakládáno v souladu s GDPR.</p>
                    <Button type="submit">Odeslat poptávku</Button>
                  </div>
                </m.form>
              )}
            </AnimatePresence>
          </Reveal>

          <aside className={s.side}>
            <Reveal className={s.card}>
              <span className={s.cardLabel}>
                <Phone size={14} /> Telefon
              </span>
              <a href={site.phoneHref} className={s.big}>
                {site.phone}
              </a>
            </Reveal>
            <Reveal className={s.card} delay={0.06}>
              <span className={s.cardLabel}>
                <Mail size={14} /> E-mail
              </span>
              <a href={`mailto:${site.email}`} className={s.big}>
                {site.email}
              </a>
              <a href={`mailto:${site.directorEmail}`}>Režisér {site.director}: {site.directorEmail}</a>
            </Reveal>
            <Reveal className={s.card} delay={0.12}>
              <span className={s.cardLabel}>
                <MapPin size={14} /> {site.studio.label}
              </span>
              <p className={s.addr}>{site.studio.lines.join(', ')}</p>
              <span className={s.cardLabel} style={{ marginTop: '1rem' }}>
                {site.billing.label}
              </span>
              <p>{site.billing.lines.join(', ')}</p>
            </Reveal>
          </aside>
        </div>

        <Reveal className={cx('container', s.mapWrap)}>
          <div className={s.map}>
            <iframe
              title="Mapa: Fairfilm studio, Dittrichova 11, Praha 2"
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.studio.mapQuery)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <span className={s.pin}>Fairfilm studio</span>
          </div>
        </Reveal>
      </section>
    </>
  )
}

type FieldProps = {
  label: string
  name: string
  type?: string
  textarea?: boolean
  error?: string
  autoComplete?: string
}

function Field({ label, name, type = 'text', textarea, error, autoComplete }: FieldProps) {
  const id = `f-${name}`
  return (
    <div className={cx(s.field, error && s.invalid)}>
      {textarea ? (
        <textarea id={id} name={name} rows={5} placeholder=" " />
      ) : (
        <input id={id} name={name} type={type} placeholder=" " autoComplete={autoComplete} aria-invalid={!!error} />
      )}
      <label htmlFor={id}>{label}</label>
      <span className={s.lineFx} />
      {error && <em role="alert">{error}</em>}
    </div>
  )
}
