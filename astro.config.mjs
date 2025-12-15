// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeLinkPreview from './src/lib/rehype-link-preview.js';

const SITE = 'https://blog.kiakiraki.dev';
/** @type {import('@astrojs/markdown-remark').RehypePlugins} */
const MARKDOWN_REHYPE_PLUGINS = [[rehypeLinkPreview, { site: SITE }]];

/** @type {import('unified').PluggableList} */
const MDX_REHYPE_PLUGINS = [[rehypeLinkPreview, { site: SITE }]];

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  markdown: {
    rehypePlugins: MARKDOWN_REHYPE_PLUGINS,
  },
  integrations: [
    mdx({
      rehypePlugins: MDX_REHYPE_PLUGINS,
    }),
    react(),
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
