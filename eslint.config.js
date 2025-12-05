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
    },
  },
  {
    files: ['src/components/MDXEditor.astro'],
    rules: {
      // Dev-only editor UI: relax strict ordering/a11y for rapid iteration
      'astro/sort-attributes': 'off',
      'astro/jsx-a11y/prefer-tag-over-role': 'off',
      'astro/jsx-a11y/control-has-associated-label': 'off',
      'astro/no-unsafe-inline-scripts': 'off',
    },
  },
  {
    files: ['src/components/BaseHead.astro', 'src/layouts/BlogPost.astro'],
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
