import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Production builds are served from GitHub Pages under the repo sub-path;
// dev stays at the domain root for a clean local experience.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/BnB_404-Bus_Not_Found/' : '/',
  plugins: [react(), tailwindcss()],
}))
