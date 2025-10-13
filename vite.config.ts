import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/assets': {
        target: 'https://157.245.20.199:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/assets/, '')
      }
    }
  }
})