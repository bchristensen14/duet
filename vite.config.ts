import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the build works under GitHub Pages' /duet/ subpath.
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(import.meta.dirname, 'index.html'),
        demo: resolve(import.meta.dirname, 'demo/index.html'),
      },
    },
  },
})
