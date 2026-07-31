import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Vite rejects requests whose Host header it doesn't recognize (DNS-rebinding
    // protection) — ngrok's tunnel hostname changes every time it's started, so
    // any subdomain of ngrok's own domains is allowlisted instead of one fixed URL.
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.io'],
    proxy: {
      // Lets the browser call the API as a same-origin relative path (see
      // VITE_API_BASE_URL=/api/v1), so a single ngrok tunnel to this dev
      // server is enough — no second tunnel or CORS config needed for the
      // backend, which stays reachable only from this machine.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
