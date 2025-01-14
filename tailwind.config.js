/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        abril: ['Abril Fatface', 'serif'],
      },
      colors: {
        'focus-color': '#242320',
      },
    },
  },
  plugins: [],
};
