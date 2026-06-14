// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zenzu.app',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk', 'de', 'fr', 'es', 'pt'],
    routing: {
      prefixDefaultLocale: false, // /en/ not needed, / = English
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', uk: 'uk', de: 'de', fr: 'fr', es: 'es', pt: 'pt' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
