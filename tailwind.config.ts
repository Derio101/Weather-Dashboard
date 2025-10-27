import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'weather-blue': '#87CEEB',
        'weather-dark': '#2C3E50',
        'weather-light': '#ECF0F1',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'flash': 'flash 1s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'snow': 'snow 3s ease-in infinite',
      },
    },
  },
  plugins: [],
}
export default config