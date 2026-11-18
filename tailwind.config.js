/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        espresso: '#2B1D14',
        alabaster: '#F7F7F8',
        butter: '#F3DE9A',
        honey: '#D9A738',
        burgundy: '#6E2331',
      },
    },
  },
  plugins: [],
};
