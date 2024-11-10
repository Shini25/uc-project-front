/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" 
  ],
  theme: {
    extend: {
      colors: {
        'gold': '#FFD700',
      },
    },
  },
  plugins: [
    require('flowbite/plugin') 
  ],
}
