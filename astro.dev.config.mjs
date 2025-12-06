// @ts-check
import { defineConfig } from 'astro/config';
import baseConfig from './astro.config.mjs';
import fg from 'fast-glob';
const base = /** @type {import('astro').AstroUserConfig} */ (baseConfig);

function devPagesIntegration() {
  return {
    name: 'dev-pages-integration',
    hooks: {
      // 開発時のみ dev-pages 配下をルートに注入
      'astro:config:setup': async ({ injectRoute }) => {
        const files = await fg('src/dev-pages/**/*.{astro,ts}', { dot: false });

        files.forEach(file => {
          const withoutPrefix = file.replace(/^src\/dev-pages/, '');
          const withoutExt = withoutPrefix.replace(/\.(astro|ts)$/, '');
          const pattern = withoutExt === '/index' ? '/' : withoutExt;

          injectRoute({
            pattern,
            entryPoint: file,
          });
        });
      },
    },
  };
}

export default defineConfig({
  ...base,
  // 開発時は SSR で dev API を使えるようにする
  output: 'server',
  integrations: [...(base.integrations ?? []), devPagesIntegration()],
  vite: {
    ...(base.vite ?? {}),
    server: {
      ...(base.vite?.server ?? {}),
      fs: {
        allow: ['src/dev-pages', ...(base.vite?.server?.fs?.allow ?? [])],
      },
    },
  },
});
