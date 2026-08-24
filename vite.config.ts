import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Arena live preview is proxied under https://{port}-{sandbox}.e2b.app — accept it.
    allowedHosts: ['.e2b.app', 'localhost'],
    strictPort: true
  }
})
