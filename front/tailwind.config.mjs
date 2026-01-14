/** @type { import('tailwindcss').Config } */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		'node_modules/preline/dist/*.js',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
			},
			colors: {
				primary: '#3b82f6', // Azul profesional
				secondary: '#1e293b',
				accent: '#60a5fa',
				'gradient-start': '#3b82f6',
				'gradient-end': '#2563eb',
			},
			animation: {
				'gradient': 'gradient 8s linear infinite',
				'float': 'float 6s ease-in-out infinite',
				'fade-in': 'fadeIn 0.6s ease-out forwards',
				'shimmer': 'shimmer 2s infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
				fadeIn: {
					'from': {
						opacity: '0',
						transform: 'translateY(20px)',
					},
					'to': {
						opacity: '1',
						transform: 'translateY(0)',
					},
				},
				shimmer: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				},
			},
			backdropBlur: {
				xs: '2px',
			},
		},
	},
	plugins: [require('preline/plugin'),],
}