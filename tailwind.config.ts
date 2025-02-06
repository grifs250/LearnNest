/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Optionally define custom brand colors
      colors: {
        brandPurple: "#6f42c1",
      }
    },
  },
  plugins: [],
};
