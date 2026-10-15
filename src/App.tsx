import { AnimatePresence, LazyMotion, m, MotionConfig } from 'motion/react'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Deferred } from './components/Deferred'
import { IntroContext } from './components/IntroContext'
import { Cursor, Intro, Shutter } from './components/layout/Effects'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { afterLoadIdle, session } from './lib'
import { Home } from './pages/Home'

// Page chunks: loaded lazily, but prefetched during idle time after first load so navigation is instant.
const pages = {
  Academy: () => import('./pages/Academy'),
  AiArt: () => import('./pages/AiArt'),
  Commercials: () => import('./pages/Commercials'),
  Contact: () => import('./pages/Contact'),
  Corporate: () => import('./pages/Corporate'),
  FilmCrew: () => import('./pages/FilmCrew'),
  NotFound: () => import('./pages/NotFound'),
  Production: () => import('./pages/Production'),
  SoundCrew: () => import('./pages/SoundCrew'),
  Studio: () => import('./pages/Studio'),
  TvCrew: () => import('./pages/TvCrew'),
  VideoProduction: () => import('./pages/VideoProduction'),
}
const prefetchPages = () => Object.values(pages).forEach((load) => void load().catch(() => {}))

const Academy = lazy(() => import('./pages/Academy').then((m) => ({ default: m.Academy })))
const AiArt = lazy(() => import('./pages/AiArt').then((m) => ({ default: m.AiArt })))
const Commercials = lazy(() => import('./pages/Commercials').then((m) => ({ default: m.Commercials })))
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })))
const Corporate = lazy(() => import('./pages/Corporate').then((m) => ({ default: m.Corporate })))
const FilmCrew = lazy(() => import('./pages/FilmCrew').then((m) => ({ default: m.FilmCrew })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))
const Production = lazy(() => import('./pages/Production').then((m) => ({ default: m.Production })))
const SoundCrew = lazy(() => import('./pages/SoundCrew').then((m) => ({ default: m.SoundCrew })))
const Studio = lazy(() => import('./pages/Studio').then((m) => ({ default: m.Studio })))
const TvCrew = lazy(() => import('./pages/TvCrew').then((m) => ({ default: m.TvCrew })))
const VideoProduction = lazy(() => import('./pages/VideoProduction').then((m) => ({ default: m.VideoProduction })))

const titles: Record<string, string> = {
  '/': 'Fairfilm | Videa, která pracují pro váš podnik',
  '/produkce': 'AV produkce | Fairfilm',
  '/produkce/video-produkce': 'Video produkce Praha | Fairfilm',
  '/produkce/ai-art': 'AI Art | Fairfilm',
  '/produkce/atelier': 'Ateliér & trikové studio | Fairfilm',
  '/produkce/filmovy-stab': 'Filmový štáb | Fairfilm',
  '/produkce/televizni-stab': 'Televizní štáb | Fairfilm',
  '/produkce/zvukari': 'Zvukaři pro film a TV | Fairfilm',
  '/produkce/akademie': 'Fairfilm akademie | Kurzy a workshopy',
  '/firemni-prezentace': 'Firemní videoprezentace | Fairfilm',
  '/reklamni-spoty': 'Reklamní spoty | Fairfilm',
  '/kontakt': 'Kontakt | Fairfilm',
}

const INTRO_KEY = 'ff-intro-seen'

// Lightweight `m` components everywhere; the animation engine loads in its own chunk after first paint.
const loadMotionFeatures = () => import('./motionFeatures').then((mod) => mod.default)

function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return session.get(INTRO_KEY) !== '1'
}

export default function App() {
  const location = useLocation()
  const [intro, setIntro] = useState(shouldPlayIntro)
  // The very first page shouldn't play the enter-shutter (the intro / initial paint covers that)
  const [firstKey] = useState(location.key)

  const finishIntro = useCallback(() => {
    session.set(INTRO_KEY, '1')
    setIntro(false)
  }, [])

  useEffect(() => {
    document.title = titles[location.pathname] ?? 'Fairfilm'
  }, [location.pathname])

  useEffect(() => {
    void afterLoadIdle(4000).then(prefetchPages)
  }, [])

  return (
    <LazyMotion features={loadMotionFeatures} strict>
    <MotionConfig reducedMotion="user">
      <IntroContext.Provider value={!intro}>
        <Header />
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <m.div key={location.pathname}>
            <main>
              <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/produkce" element={<Production />} />
                <Route path="/produkce/video-produkce" element={<VideoProduction />} />
                <Route path="/produkce/ai-art" element={<AiArt />} />
                <Route path="/produkce/atelier" element={<Studio />} />
                <Route path="/produkce/filmovy-stab" element={<FilmCrew />} />
                <Route path="/produkce/televizni-stab" element={<TvCrew />} />
                <Route path="/produkce/zvukari" element={<SoundCrew />} />
                <Route path="/produkce/akademie" element={<Academy />} />
                <Route path="/firemni-prezentace" element={<Corporate />} />
                <Route path="/reklamni-spoty" element={<Commercials />} />
                <Route path="/kontakt" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </main>
            <Deferred order={4} minHeight="40vh">
              <Footer />
            </Deferred>
            <Shutter skipEnter={location.key === firstKey} />
          </m.div>
        </AnimatePresence>
        <AnimatePresence>{intro && <Intro onDone={finishIntro} />}</AnimatePresence>
        <Cursor />
      </IntroContext.Provider>
    </MotionConfig>
    </LazyMotion>
  )
}
