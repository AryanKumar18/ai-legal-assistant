/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0B1220',
          900: '#0F1729',
          800: '#161F36',
          700: '#1E2A47',
        },
        paper: '#FAF9F6',
        gold: {
          400: '#E0C28F',
          500: '#D4AF7A',
          600: '#BD9760',
        },
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(-2%)' },
          '50%': { transform: 'translateY(102%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'line-grow': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--target-width, 70%)' },
        },
        nod: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
      },
      animation: {
        scan: 'scan 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'line-grow': 'line-grow 1.2s ease-out forwards',
        nod: 'nod 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}