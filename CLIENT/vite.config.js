import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api goes to the SERVER so the refresh cookie stays same-origin
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
