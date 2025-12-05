// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.kiakiraki.dev',
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [
    mdx(),
    sitemap({
      // エディタページをサイトマップから除外
      filter: page => !page.includes('/editor'),
    }),
  ],
  vite: {
    // @ts-expect-error - Type mismatch between @tailwindcss/vite and Astro's bundled Vite
    plugins: [tailwindcss()],
    define: {
      __DATE__: `'${new Date().toISOString()}'`,
    },
  },
});
