/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
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

