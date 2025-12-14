import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Support for relative paths (Live Server)
  server: {
    port: 5173,
    strictPort: true, // Fail if port is busy
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks (cached longer, change less frequently)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['react-hot-toast', 'lucide-react'],
        }
      }
    },
    // Increase warning limit since we've split chunks now
    chunkSizeWarningLimit: 300
  }
})
