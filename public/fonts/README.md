Place Japanese font files here to avoid CDN fetches during OGP generation.

Required files (recommended from @fontsource/noto-sans-jp):
- NotoSansJP-400.woff2
- NotoSansJP-700.woff2

These filenames must match the OGP loader in `src/pages/og/[...slug].png.ts`.
If absent, the code falls back to fetching from jsDelivr.

Example (with npm):
1) Download the two `.woff2` files from @fontsource or Google hosted sources.
2) Save them as `public/fonts/NotoSansJP-400.woff2` and `public/fonts/NotoSansJP-700.woff2`.
3) Run `npm run preview` and visit `/og/home.png` to verify rendering.

