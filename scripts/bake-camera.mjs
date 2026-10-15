// Bakes the procedural 3D camera to public/media/3d/camera.glb.
// Usage: dev server running on :5173, then `npm run bake:camera`.
// Requires Playwright (python or node) — here we use the node package if present, otherwise print instructions.
import { writeFileSync } from 'node:fs'

const url = process.env.BAKE_URL ?? 'http://127.0.0.1:5173/__bake'
let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  console.error('Install Playwright first: npm i -D playwright && npx playwright install chromium')
  process.exit(1)
}
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(url)
await page.waitForFunction(() => window.__glb || window.__bakeError, null, { timeout: 60000 })
const err = await page.evaluate(() => window.__bakeError)
if (err) throw new Error(err)
const b64 = await page.evaluate(() => window.__glb)
writeFileSync('scripts/.cache/camera.raw.glb', Buffer.from(b64, 'base64'))
await browser.close()
console.log('wrote scripts/.cache/camera.raw.glb')
