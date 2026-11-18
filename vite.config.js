import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths so the same build works inside Capacitor and from any web sub-folder.
  base: './',
  plugins: [react()],
})
