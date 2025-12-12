import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Support for relative paths (Live Server)
  server: {
    port: 5173,
    strictPort: true, // Fail if port is busy
  }
})
