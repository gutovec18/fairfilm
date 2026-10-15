export const site = {
  name: 'Fairfilm',
  claim: 'Videa, která pracují pro váš podnik',
  subclaim: 'Pomáháme značkám získávat pozornost, budovat důvěru a proměňovat diváky v zákazníky.',
  phone: '+420 775 600 230',
  phoneHref: 'tel:+420775600230',
  email: 'info@fairfilm.cz',
  directorEmail: 'jiri@fairfilm.cz',
  director: 'Jiří Kairos Zeiner',
  international: 'https://www.fairfilm.eu/',
  studio: {
    label: 'Fairfilm studio',
    lines: ['Dittrichova 11', 'Praha 2, Nové Město'],
    mapQuery: 'Dittrichova 11, Praha 2',
  },
  billing: {
    label: 'Fakturační adresa a sídlo',
    lines: ['Mgr. Jiří Zeiner', 'Tusarova 16', 'Praha 7', 'Plátce DPH'],
  },
  reelUrl: 'https://www.fairfilm.eu/video/REEL-FAIRFILM-PRAGUE.mp4',
  trailerUrl: 'https://www.fairfilm.cz/video/Mila-Emo_trailer_movie.mp4',
} as const

export type NavItem = { label: string; to: string; children?: { label: string; to: string; note: string }[] }

export const productionLinks = [
  { label: 'Video produkce', to: '/produkce/video-produkce', note: 'Korporát, eventy, rozhovory' },
  { label: 'AI Art', to: '/produkce/ai-art', note: 'Robofilosofie & AI design' },
  { label: 'Ateliér', to: '/produkce/atelier', note: 'Greenscreen studio Praha 2' },
  { label: 'Filmový štáb', to: '/produkce/filmovy-stab', note: 'RED 8K, ARRI, Sony' },
  { label: 'Televizní štáb', to: '/produkce/televizni-stab', note: 'FS7, FX6, XDCAM' },
  { label: 'Zvukaři', to: '/produkce/zvukari', note: 'Film, TV & reklama' },
  { label: 'Fairfilm akademie', to: '/produkce/akademie', note: 'Kurzy a workshopy' },
]

export const nav: NavItem[] = [
  { label: 'Produkce', to: '/produkce', children: productionLinks },
  { label: 'Firemní prezentace', to: '/firemni-prezentace' },
  { label: 'Reklamní spoty', to: '/reklamni-spoty' },
  { label: 'Kontakt', to: '/kontakt' },
]

export const process = [
  {
    key: 'Consult',
    title: 'Úvodní konzultace',
    text: 'Nezávazně si ujasníme cíl projektu, cílovou skupinu a způsob využití videa. Pomůžeme definovat, co má video skutečně splnit.',
  },
  {
    key: 'Concept',
    title: 'Koncept a scénář',
    text: 'Navrhujeme kreativní směr, styl vyprávění a strukturu sdělení. Vzniká scénář a plán produkce odpovídající rozpočtu i strategii.',
  },
  {
    key: 'Production',
    title: 'Natáčení & postprodukce',
    text: 'Štáb, technika, lokace i vedení natáčení. Pak střih, zvuk, barevné úpravy a finální ladění emocí i tempa.',
  },
  {
    key: 'Impact',
    title: 'Připraveno k využití',
    text: 'Dodáváme video optimalizované pro web, sociální sítě, kampaně i prezentace. Poradíme také, jak ho využít co nejefektivněji.',
  },
]

export const offering = [
  'Reklamní spoty',
  'Brandová a image videa',
  'Firemní storytelling',
  'Employer branding',
  'Produktová a vysvětlující videa',
  'Video pro LinkedIn a B2B',
  'Kampaně a obsahové série',
  'AI Art',
  'Team building',
  'Workshopy',
]
