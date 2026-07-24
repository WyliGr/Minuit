// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Backend dev server (AdonisJS). Proxy /api to avoid CORS in dev.
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3333';

export default defineConfig({
  site: 'https://minuit.local',
  server: { port: 4321 },
  integrations: [react()],
  vite: {
    server: {
      proxy: {
        '/api': { target: BACKEND_URL, changeOrigin: true },
      },
    },
  },
});
