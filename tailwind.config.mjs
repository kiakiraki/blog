import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49',
				}
			},
			fontFamily: {
				'ja': ['Noto Sans JP', 'sans-serif'],
				'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace']
			},
			typography: {
				DEFAULT: {
					css: {
						'code::before': {
							content: '""'
						},
						'code::after': {
							content: '""'
						},
						code: {
							color: '#e11d48',
							backgroundColor: '#f1f5f9',
							padding: '0.25rem 0.375rem',
							borderRadius: '0.25rem',
							fontSize: '0.875em',
							fontWeight: '600'
						},
						'pre code': {
							color: 'inherit',
							backgroundColor: 'transparent',
							padding: '0',
							borderRadius: '0',
							fontSize: 'inherit',
							fontWeight: 'inherit'
						}
					}
				},
				dark: {
					css: {
						color: '#e2e8f0',
						'[class~="lead"]': {
							color: '#94a3b8'
						},
						a: {
							color: '#60a5fa'
						},
						strong: {
							color: '#f1f5f9'
						},
						'ol > li::marker': {
							color: '#94a3b8'
						},
						'ul > li::marker': {
							color: '#94a3b8'
						},
						hr: {
							borderColor: '#334155'
						},
						blockquote: {
							color: '#94a3b8',
							borderLeftColor: '#334155'
						},
						h1: {
							color: '#f1f5f9'
						},
						h2: {
							color: '#f1f5f9'
						},
						h3: {
							color: '#f1f5f9'
						},
						h4: {
							color: '#f1f5f9'
						},
						'figure figcaption': {
							color: '#94a3b8'
						},
						code: {
							color: '#fbbf24',
							backgroundColor: '#1e293b'
						},
						'pre': {
							backgroundColor: '#0f172a',
							color: '#e2e8f0'
						},
						thead: {
							color: '#f1f5f9',
							borderBottomColor: '#334155'
						},
						'tbody tr': {
							borderBottomColor: '#334155'
						}
					}
				}
			}
		},
	},
	plugins: [
		typography
	],
}