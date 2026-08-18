// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://otktrans.ru',
  // Pages stay static (prerendered); only the contact API route opts into
  // on-demand rendering (see src/pages/api/contact.ts → `prerender = false`),
  // deployed as a Vercel serverless function.
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'always',
  // Inline all CSS into each page's <head> so styling survives even when the
  // separate /_astro/*.css request is cached-dead or blocked on the client's
  // network (e.g. CDN throttling). Trades a little HTML size for resilience.
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    tailwind({
      // We manage the base layer / tokens ourselves in src/styles/global.css
      applyBaseStyles: false,
    }),
  ],
});
