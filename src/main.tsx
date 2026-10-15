import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/global.scss'
import App from './App.tsx'

// Dev-only: /__bake renders the procedural 3D camera and exports it (see scripts/bake-camera.mjs).
// The branch is dead code in production builds, so the bake tooling never ships.
if (import.meta.env.DEV && location.pathname === '/__bake') {
  void import('./dev/bake')
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}
