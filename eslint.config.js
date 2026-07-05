import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.all,
  {
    ignores: ['.astro/*', 'dist/**/*', 'node_modules/**/*'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // Astro's <script> tags (without is:inline) are bundled at build time and safe
      'astro/no-unsafe-inline-scripts': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      // eslint-plugin-astro v2 で新規追加されたルール。<head> 直下に子コンポーネント
      // （例: <BaseHead>）を置くだけで parse5 が「head の暗黙終了」と誤検知する既知の
      // false positive があり、作者自身がルール自体の非推奨化PRを出している
      // (ota-meshi/eslint-plugin-astro PR #590, 2026-06-25時点でopen)。
      // 実際のHTML出力は正しく </head> で閉じているため無効化する。
      'astro/no-omitted-end-tags': 'off',
    },
  },
  {
    files: [
      'src/components/BaseHead.astro',
      'src/layouts/BlogPost.astro',
      'src/pages/index.astro',
      'src/pages/blog/index.astro',
      // [category] はglobの文字クラスと解釈されるため * で指定
      'src/pages/category/*.astro',
    ],
    rules: {
      // JSON-LD structured data using JSON.stringify is safe from XSS
      'astro/no-set-html-directive': 'off',
    },
  },
  {
    files: [
      'src/components/Header.astro',
      'src/components/HeaderLink.astro',
      'src/components/TableOfContents.astro',
      'src/components/ThemeToggle.astro',
    ],
    rules: {
      // Inline scripts required for View Transitions and client-side interactivity
      'astro/no-unsafe-inline-scripts': 'off',
    },
  },
];
