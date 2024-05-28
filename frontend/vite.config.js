import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
        '/generate-message': 'http://localhost:8000',
        '/verify-signature': 'http://localhost:8000',
        '/blogs': 'http://localhost:8000',
    },
},
})
