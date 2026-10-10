import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: { global: 'globalThis' },   // sockjs-client expects Node's "global"
  server: { port: 5173 }
});
