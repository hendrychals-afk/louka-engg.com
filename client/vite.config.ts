import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/reviews.php': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/review-photo.php': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/contact.php': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/admin.php': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/data/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
