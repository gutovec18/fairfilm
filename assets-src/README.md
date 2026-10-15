Source assets that are NOT deployed (kept out of `public/`).

- `clients-hq/` — high-quality transparent client logos (mostly SVG from Wikimedia Commons / official sites, sanitised).
- `clients-crops/` — original low-res logo crops cut from the old fairfilm.cz collage (fallback for the 16 brands with no HQ logo).

The site uses `public/media/clients/<slug>.webp`: every logo rasterised to 120 px tall (≈2× display size), transparent WebP, ~318 KB for all 67.
