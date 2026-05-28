import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Set base to relative so it works in any subfolder (including Apache and Vite dev server)
  base: './',
  build: {
    // Ensures assets are kept relative to the index.html
    assetsInlineLimit: 0,
  },
  server: {
    origin: 'http://localhost:5173',
    host: true,
    strictPort: false,
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://localhost/manager%20web/api.php',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    watch: {
      usePolling: true,
      interval: 100,
      ignored: ['**/server_data/**'],
    },
  },
})
