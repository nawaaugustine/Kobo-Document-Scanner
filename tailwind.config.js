/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  safelist: [
    'bg-white/15',
    'dark:bg-gray-800/90',
    // include any additional dynamic classes here
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
