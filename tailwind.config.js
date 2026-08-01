/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        beauty: {
          50: "#fff1f7",
          100: "#ffe4f0",
          200: "#fecddf",
          300: "#fda4c9",
          400: "#fb71ad",
          500: "#f13d8f",
          600: "#d91f72",
          700: "#b3155b",
          800: "#95144d",
          900: "#7c1743"
        }
      }
    },
  },
  plugins: [],
};
