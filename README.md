# Fairfilm web

Remake of [fairfilm.cz](https://www.fairfilm.cz/) in React 19 + TypeScript + Vite, styled with SCSS modules and animated with [Motion](https://motion.dev).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

## Structure

```
src/
  styles/_abstracts.scss   design tokens + mixins (auto-injected into every .scss via vite.config.ts)
  styles/global.scss       reset, base type, utilities
  data/                    site copy, navigation, client list
  components/layout/       Header (mega menu), Footer, Effects (intro countdown, page shutter, cursor, grain)
  components/ui/           SplitText, Reveal, Button, VideoPlayer, LogoCarousel, PageHero, CTA, Marquee…
  pages/                   one file per route (+ .module.scss), shared blocks in Page.module.scss / blocks.tsx
public/media/              all images/video pulled from the original site (webp-optimised)
```

## Performance

The first load is engineered to be spike-free:

- **Critical path is tiny**: ~108 KB gzipped JS for the first screen. Motion runs via `LazyMotion` (`m.*` components);
  its animation engine loads in a separate chunk after first paint. Every route except Home is code-split.
- **Self-hosted fonts** (`public/fonts`, latin + latin-ext) with the hero weights preloaded; no Google Fonts round trip.
- **Hero**: poster image preloaded (`fetchpriority=high`); the 2 MB video loop only starts downloading once the page is idle.
- **Below the fold** renders after first paint, one section per idle slot (`<Deferred order>`), as interruptible React transitions.
- **3D camera** is *pre-baked* to `public/media/3d/camera.glb` (meshopt + WebP, ~0.8 MB) and only mounts after load + idle
  (or when the visitor scrolls near it). Shaders are compiled in parallel and uploaded off-screen before the first visible frame.
- Off-screen videos pause; the logo carousel stops animating when not visible; no `backdrop-filter`/`filter: blur` animations.

### Re-baking the 3D camera

The procedural model lives in `src/components/three/CinemaCamera.tsx` (authoring source only, never shipped).
After editing it:

```bash
npm run dev            # dev server on :5173 (serves the /__bake page)
npm run bake:camera    # renders /__bake in headless Chromium → scripts/.cache/camera.raw.glb → optimised public/media/3d/camera.glb
```

`bake:camera` needs Playwright for Node (`npm i -D playwright && npx playwright install chromium`).

## Client logos

`public/media/clients/<slug>.webp`: all 67 logos rasterised to 120 px tall transparent WebP (~318 KB total).
High-quality sources (51 brands) and the original collage crops (16 brands without an HQ logo) are in `assets-src/` (not deployed).

## Notes / TODO

- **Contact form** has no backend yet. It validates and opens the visitor's mail client with a pre-filled message (`src/pages/Contact.tsx`). Hook up a form service or API.
- **Showreel & Milá Emo trailer** are streamed from the existing hosting (`fairfilm.eu` / `fairfilm.cz`, ~100–140 MB each) and only load when the visitor presses play. Consider re-encoding / moving to Vimeo or Mux.
- The hero b-roll (`public/media/video/hero.*`) is a 15 s loop cut from the showreel.
- The intro countdown plays once per browser session and is skipped with `prefers-reduced-motion`.
- Logos still on the old low-res crops (no HQ source found): amethyst, best-communications, brandcast-media, erv, fictio,
  giochi-di-luce, goodcomm, green-ways, lloyd, mbtech, mc-tv, myriad, red-dot-digital, sl-medienproduktion, stock,
  strategic-consulting. Ask the client for vector files of these.
- SPA fallbacks for hosting are included (`vercel.json`, `public/_redirects`).
