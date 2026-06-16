/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#fdf6f0',
          100: '#f9ebe0',
          200: '#f2d5bc',
          300: '#e9b98f',
          400: '#de945e',
          500: '#d4af37',
          600: '#b8860b',
          700: '#8B4513',
          800: '#6b3410',
          900: '#572a0e',
        },
        brown: {
          50: '#faf6f3',
          100: '#f3ebe4',
          200: '#e5d5c8',
          300: '#d4b9a4',
          400: '#c0957a',
          500: '#a67c52',
          600: '#8B4513',
          700: '#6b3410',
          800: '#4a240b',
          900: '#2c1806',
        },
        cream: {
          50: '#FFFDFA',
          100: '#FAF0E6',
          200: '#F5E6D3',
          300: '#EED9C4',
        },
        gold: {
          400: '#E8C872',
          500: '#D4AF37',
          600: '#B8860B',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(139, 69, 19, 0.1)',
        'card': '0 8px 30px -4px rgba(139, 69, 19, 0.15)',
        'glow': '0 0 20px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
};
