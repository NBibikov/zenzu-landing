// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://zenzu.app',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk', 'de', 'fr', 'es', 'pt'],
    routing: {
      prefixDefaultLocale: false, // /en/ not needed, / = English
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
