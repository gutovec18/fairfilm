import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Tokens + mixins are available in every .scss / .module.scss without an explicit @use
        loadPaths: [path.resolve(import.meta.dirname, 'src/styles')],
        additionalData: `@use "abstracts" as *;\n`,
      },
    },
  },
})
