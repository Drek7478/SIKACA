/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f9f0',
          100: '#d9f0d9',
          200: '#b3e0b3',
          300: '#85cc85',
          400: '#57b857',
          500: '#2d9e2d', // forest green utama
          600: '#228b22', // forest green lebih gelap
          700: '#1b6e1b',
          800: '#145214',
          900: '#0d360d',
        },
        forest: {
          DEFAULT: '#228b22',
          light: '#2d9e2d',
          dark: '#1b6e1b',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0,0,0,0.05)',
        'card': '0 8px 30px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}