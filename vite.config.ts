import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'client'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        (await import('tailwindcss')).default({
          config: path.resolve(__dirname, 'tailwind.config.ts'),
        }),
        (await import('autoprefixer')).default,
      ],
    },
  },
});