// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	output: 'server',
	adapter: cloudflare({
    imageService: 'compile'
  }),
	integrations: [mdx(), sitemap(), tailwind()],
	vite: {
		define: {
			__DATE__: `'${new Date().toISOString()}'`
		}
	}
});
