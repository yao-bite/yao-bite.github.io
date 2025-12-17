/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layouts/**/*.html',
    './content/**/*.{html,md}',
  ],
  theme: {
    extend: {
      colors: {
        'light-gray': '#f5f5f5',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
