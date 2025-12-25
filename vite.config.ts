import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose environment variables to the client
  // Note: Only variables prefixed with VITE_ are exposed for security
  envPrefix: 'VITE_',
})
