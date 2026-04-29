/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'obi-primary': 'var(--obi-primary)',
        'obi-glow': 'var(--obi-glow)',
        'obi-warmth': 'var(--obi-warmth)',
      },
    },
  },
  plugins: [],
};
