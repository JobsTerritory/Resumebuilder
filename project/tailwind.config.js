/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  safelist: [
    {
      pattern: /(bg|text|border|from|to)-(blue|gray|indigo|cyan|slate|emerald|purple|pink|rose|orange|fuchsia|amber|teal|violet|sky|lime|yellow|red|slate)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
  ],
  plugins: [],
};
