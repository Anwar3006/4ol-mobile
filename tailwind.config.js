/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        light: ["OpenSans-Light"],
        normal: ["OpenSans-Regular"],
        medium: ["OpenSans-Medium"],
        bold: ["OpenSans-Bold"],
        black: ["OpenSans-Bold"], // OpenSans doesnt have a Black weight in assets
        quincy: ["QuincyCF-Regular"],
        "quincy-light": ["QuincyCF-Light"],
        "quincy-medium": ["QuincyCF-Medium"],
        "quincy-bold": ["QuincyCF-Bold"],
      },
    },
  },
  plugins: [],
};
