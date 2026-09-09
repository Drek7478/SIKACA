import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/sikaca/backend', // Ganti sesuai lokasi backend Anda
        changeOrigin: true,
        // Jangan rewrite path, biarkan /api tetap
      }
    }
  }
})