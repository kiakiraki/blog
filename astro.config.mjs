// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
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
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
    prerenderEnvironment: 'node',
  }),
  image: {
    // imageService: 'compile' + prerenderEnvironment: 'node' の組み合わせでは
    // アダプタのsharp差し替えが働かず、no-opサービスが元画像を複製するだけになる。
    // 詳細は src/lib/build-image-service.mjs のコメントを参照。
    service: { entrypoint: './src/lib/build-image-service.mjs' },
  },
  markdown: {
    rehypePlugins: MARKDOWN_REHYPE_PLUGINS,
  },
  integrations: [
    mdx({
      rehypePlugins: MDX_REHYPE_PLUGINS,
    }),
    sitemap({
      // エディタページ・2ページ目以降のブログ一覧（noindex）をサイトマップから除外
      filter: page => !page.includes('/editor') && !page.includes('/blog/page/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __DATE__: `'${new Date().toISOString()}'`,
    },
  },
});
