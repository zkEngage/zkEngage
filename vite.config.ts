// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: './client',
  server: {
    port: 5173,   // pick a different port than your backend
    proxy: {
      '/api': 'http://localhost:3000', // proxy API calls to the backend server
    },

  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});