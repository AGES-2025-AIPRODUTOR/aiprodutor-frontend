// tailwind.config.mjs
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			green: {
  				'25': 'var(--green-25)',
  				'50': 'var(--green-50)',
  				'63': 'var(--green-63)',
  				'75': 'var(--green-75)',
  				'100': 'var(--green-100)',
  				'200': 'var(--green-200)',
  				'300': 'var(--green-300)',
  				'400': 'var(--green-400)',
  				'500': 'var(--green-500)',
  				'600': 'var(--green-600)',
  				'700': 'var(--green-700)',
  				'800': 'var(--green-800)',
  				'900': 'var(--green-900)'
  			},
  			warning: 'var(--warning)',
  			'warning-bg': 'var(--warning-bg)',
  			error: 'var(--error)',
  			'error-bg': 'var(--error-bg)',
  			success: 'var(--success)',
  			'success-bg': 'var(--success-bg)',
  			info: 'var(--info)',
  			'info-bg': 'var(--info-bg)',
  			neutral: {
  				'0': 'var(--neutral-0)',
  				'900': 'var(--neutral-900)'
  			}
  		}
  	}
  },
  plugins: [animate, require("tailwindcss-animate")],
};
