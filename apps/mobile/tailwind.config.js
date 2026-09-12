/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  plugins: [],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#F59E0B",
        danger: "#F87171",
      },
      fontFamily: {
        roboto: ["Roboto-Regular"],
        "roboto-bold": ["Roboto-Bold"],
        "roboto-medium": ["Roboto-Medium"],
        "roboto-semibold": ["Roboto-SemiBold"],
      },
    },
  },
};
