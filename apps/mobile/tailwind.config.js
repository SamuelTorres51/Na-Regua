/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/App.tsx",
    "./src/components/**/*.{tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto-Regular"],
        'roboto-medium': ['Roboto-Medium'],
        'roboto-semibold': ['Roboto-SemiBold'],
        'roboto-bold': ['Roboto-Bold']
      }
    },
  },
  plugins: [],
}

