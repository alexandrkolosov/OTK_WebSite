// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://otktrans.ru',
  // Pages stay static (prerendered); only the contact API route opts into
  // on-demand rendering (see src/pages/api/contact.ts → `prerender = false`).
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    tailwind({
      // We manage the base layer / tokens ourselves in src/styles/global.css
      applyBaseStyles: false,
    }),
  ],
});
