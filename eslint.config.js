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
    },
  },
];
