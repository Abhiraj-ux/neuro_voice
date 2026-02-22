import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: true,
    host: '0.0.0.0',   // expose on all interfaces so iPhone can reach it
    port: 5174,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
