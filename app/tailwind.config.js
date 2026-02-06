/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./Screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // MindPal custom colors
        'primary-green': '#8EBA6B',
        'dark-brown': '#4B2E1E', // Updated to verified MindPal brown
        'light-beige': '#FBF7F2', // Updated to verified MindPal bg
        'text-dark': '#333333',
        'text-light': '#FFFFFF',
        'placeholder': '#A0A0A0',
        'light-gray': '#E0E0E0',
        'border-green': '#8DC63F',
        'error-red': '#FF0000',
        'success-green': '#4CAF50',
        'orange': '#F7931E', // Updated to verified MindPal orange
        'purple': '#9B8BB4',
        'beige': '#F5F5DC',
        'brown': '#4B2E1E', // Updated
        'brown-light': '#7A6A5E', // Updated to verified MindPal light brown
      },
    },
  },
  plugins: [],
};
