import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default defineConfig({
  // Serve the app from the `client` folder so Vite will use client/index.html
  root: path.resolve(__dirname, "client"),
  // Expose the server to the network (use --host or set host) so Codespaces/forwarded ports work
  server: {
    host: true,
  },
  plugins: [react()], // 👈 add this
  resolve: {
    alias: {
  // When running Vite from the repository root we need the alias
  // to point at the client's source directory so imports like
  // '@/components/..' resolve to client/src
  '@': path.resolve(__dirname, 'client', 'src'),
    },
  },
});