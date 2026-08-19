import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project from /ToppsNPN/, not the domain root.
  base: command === 'build' ? '/ToppsNPN/' : '/',
  plugins: [react(), tailwindcss()],
}))
