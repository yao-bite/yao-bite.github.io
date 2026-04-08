/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./layouts/**/*.html", "./content/**/*.{html,md}"],
  theme: {
    extend: {
      colors: {
        "light-gray": "#f5f5f5",
      },
      fontFamily: {
        sans: ['"Funnel Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        tc: [
          '"Noto Sans TC"',
          '"Funnel Sans"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
