import { Button } from '../components/ui/Button'
import { PageHero } from '../components/ui/PageHero'
import { media } from '../lib'

export function NotFound() {
  return (
    <PageHero
      crumbs={[{ label: '404' }]}
      title={'Tahle scéna\nse *nenatočila*'}
      lead="Stránka, kterou hledáte, neexistuje nebo byla přesunuta."
      image={media('stills/still-05.webp')}
      size="compact"
    >
      <div style={{ marginTop: '2rem' }}>
        <Button to="/">Zpět na úvod</Button>
      </div>
    </PageHero>
  )
}
