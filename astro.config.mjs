// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://otktrans.ru',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    tailwind({
      // We manage the base layer / tokens ourselves in src/styles/global.css
      applyBaseStyles: false,
    }),
  ],
});
