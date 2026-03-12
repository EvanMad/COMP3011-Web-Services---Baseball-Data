/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      '/auth': { target: 'http://localhost:3000', changeOrigin: true },
      '/player': { target: 'http://localhost:3000', changeOrigin: true },
      '/teams': { target: 'http://localhost:3000', changeOrigin: true },
      '/collection': { target: 'http://localhost:3000', changeOrigin: true },
      '/match': { target: 'http://localhost:3000', changeOrigin: true },
      '/health': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: '.vitest/setup',
    include: ['**/test.{ts,tsx}']
  }
})
