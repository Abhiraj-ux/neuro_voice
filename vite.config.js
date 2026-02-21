import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const certsDir = path.resolve(__dirname, 'certs')
const keyFile = path.join(certsDir, 'key.pem')
const certFile = path.join(certsDir, 'cert.pem')

const httpsConfig = fs.existsSync(keyFile)
  ? { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) }
  : true   // fallback: Vite built-in self-signed

export default defineConfig({
  plugins: [react()],
  server: {
    https: httpsConfig,
    host: '0.0.0.0',   // expose on all interfaces so iPhone can reach it
    port: 5174,
    cors: true,
  },
})
