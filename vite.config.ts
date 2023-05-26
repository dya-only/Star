import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/maps': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/v2': {
        target: 'https://dapi.kakao.com',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
