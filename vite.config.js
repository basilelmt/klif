import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// KLIF_ARTIFACT=1 : build mono-entrée (un seul JS) pour scripts/build-artifact.mjs,
// qui inline tout dans une page — le chunk partagé du multi-entrées le casserait.
const input = {
  main: fileURLToPath(new URL('./index.html', import.meta.url)),
}
if (!process.env.KLIF_ARTIFACT) {
  input.shop = fileURLToPath(new URL('./shop/index.html', import.meta.url))
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Permet à App.jsx d'écarter le code inutile en artifact (préchauffage
    // de la couverture boutique, dont le chemin n'y est pas inliné).
    'import.meta.env.KLIF_ARTIFACT': JSON.stringify(Boolean(process.env.KLIF_ARTIFACT)),
  },
  build: {
    rollupOptions: { input },
  },
})
