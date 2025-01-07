/** @type { import('tailwindcss').Config } */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Outfit', 'serif'],
			},
			colors: {
				primary: '#6366f1',
				secondary: '#0f172a',
				accent: '#818cf8',
				'gradient-start': '#6366f1',
				'gradient-end': '#8b5cf6',
			},
			animation: {
				'gradient': 'gradient 8s linear infinite',
				'float': 'float 6s ease-in-out infinite',
			},
			keyframes: {
				gradient: {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center'
					},
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' },
				},
			},
		},
	},
	plugins: [],
}