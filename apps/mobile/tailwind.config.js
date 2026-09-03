/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/App.tsx",
    "./src/components/**/*.{.tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

