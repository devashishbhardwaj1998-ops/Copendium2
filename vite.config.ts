/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The app uses hash-based routing (#/section/...), so a relative base works on
// any static host — GitHub Pages project sites, user sites, Netlify, Vercel or
// a plain S3 bucket — with no server rewrites. Override with BASE_PATH if you
// ever need an absolute base (e.g. BASE_PATH=/compendium/).
export default defineConfig({
  base: process.env.BASE_PATH ?? './',
  plugins: [react(), tailwindcss()],
  server: { port: 3000 },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
