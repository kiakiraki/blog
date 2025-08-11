# Repository Guidelines

## Project Structure & Module Organization

- Source lives in `src/` with `components/`, `layouts/`, `pages/`, `utils/`,
  `styles/`, and content in `content/` (blog posts under `src/content/blog`).
- Static assets go in `public/`; build output is `dist/`.
- Shared constants are in `src/consts.ts` (e.g., `CATEGORIES`, `SITE_TITLE`).
  Type aliases live in `src/types/`.
- Import aliases: `@/*`, `@/components/*`, `@/layouts/*` (see `tsconfig.json`).

## Build, Test, and Development Commands

- `npm run dev`: Start Astro dev server at `http://localhost:4321`.
- `npm run build`: Production build to `./dist/` (Cloudflare adapter).
- `npm run preview`: Serve the built site locally.
- `npm run typecheck`: TypeScript/`astro check` type analysis.
- `npm run lint:check` / `npm run lint`: ESLint validation (fix with
  `npm run lint`).
- `npm run format:check` / `npm run format`: Prettier format checks (write with
  `npm run format`).

## Coding Style & Naming Conventions

- Prettier: 2 spaces, single quotes, semicolons, `printWidth` 100 (Markdown 80),
  `trailingComma: es5`. Astro files formatted via `prettier-plugin-astro`.
- ESLint: TypeScript + Astro; `@typescript-eslint/no-explicit-any` is disabled.
- Components/layouts: PascalCase (e.g., `Layout.astro`); utilities: camelCase;
  constants: UPPER_SNAKE_CASE.
- Tailwind CSS v4 via Vite plugin; keep utility-first classes in markup and
  shared rules in `src/styles/global.css`.

## Content Authoring

- Blog entries are `.md/.mdx` under `src/content/blog`. Required frontmatter in
  `src/content.config.ts`:
  ```md
  ---
  title: 記事タイトル
  description: 要約
  pubDate: 2025-07-01
  category: 技術 # one of CATEGORIES in consts.ts
  heroImage: ../assets/hero.png
  updatedDate: 2025-07-08
  ---
  ```

## Testing Guidelines

- No unit test framework configured. Validate changes with `typecheck`,
  `lint:check`, `format:check`, and `npm run preview`.
- CI (`.github/workflows/lint-and-format.yml`) runs typecheck, ESLint, and
  Prettier checks on PRs.

## Commit & Pull Request Guidelines

- Use Conventional Commit prefixes seen in history: `feat`, `fix`, `docs`,
  `style`, `chore`, `refactor` (e.g., `feat: add related posts`).
- PRs should include: clear description, linked issues, before/after screenshots
  for UI, and a checklist confirming local `typecheck`, `lint`, and `format`
  passed. Avoid committing `dist/` or `.astro/`.

## Security & Configuration Tips

- Deployment targets Cloudflare (see `astro.config.mjs`). Do not commit secrets;
  prefer project/environment config in the platform. Keep external fetches
  (e.g., fonts for OGP images) stable and version-pinned.
