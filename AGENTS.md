# Repository Guidelines

## Project Structure & Module Organization

- Astro blog deployed to Cloudflare Pages; configuration lives in
  `astro.config.mjs` and `tsconfig.json`.
- Source code sits in `src/` with `components/` (Astro UI), `layouts/` (page
  shells), `pages/` (routes), `styles/` (global CSS), `utils/` (helpers), and
  `content/` (Markdown/MDX posts).
- Static assets belong in `public/`; generated output from builds goes to
  `dist/` (ignored in Git).
- Blog posts follow date-based folders under
  `src/content/blog/YYYY-MM/YYYY-MM-DD/`; images stay in the adjacent `images/`
  subfolder.

## Build, Test, and Development Commands

- `npm install` once to sync dependencies.
- `npm run dev` starts the dev server at `http://localhost:4321`.
- `npm run build` produces the production bundle in `dist/`; `npm run preview`
  serves that output locally.
- `npm run lint:check` checks ESLint rules; `npm run lint` can auto-fix simple
  issues.
- `npm run format:check` runs Prettier in check mode; `npm run format` applies
  formatting.
- `npm run typecheck` runs `astro check` for TypeScript and template safety.

## Coding Style & Naming Conventions

- Use Prettier defaults (2-space indent, semicolons, single quotes) and ESLint
  with `eslint-plugin-astro`/TypeScript configs.
- Components and layouts: PascalCase filenames; utilities and constants:
  camelCase variables, SCREAMING_SNAKE_CASE for exported constants.
- Route files in `src/pages/` should mirror public URLs; keep MDX frontmatter
  concise and localized as needed.
- Prefer small, focused modules; colocate styles with components when specific,
  otherwise use `src/styles/`.

## Testing Guidelines

- No dedicated test suite yet; rely on `npm run lint:check`,
  `npm run format:check`, `npm run typecheck`, and `npm run build` before
  proposing changes.
- For content or UI edits, verify locally via `npm run preview` and check image
  uploads under `src/content/blog/.../images`.
- Add regression coverage (unit or integration) alongside new functionality when
  introducing logic-heavy utilities.

## Commit & Pull Request Guidelines

- Follow the existing conventional pattern (`feat:`, `fix:`, `style:`, etc.);
  keep subjects imperative and under ~72 chars.
- Include scope when helpful (e.g., `fix(header): adjust logo spacing`).
- PRs should describe motivation, key changes, and test results; link related
  issues and include before/after screenshots or URLs for UI tweaks.
- Note any content migrations or new assets added to `public/` or `src/content/`
  so deploy reviewers can double-check paths.
