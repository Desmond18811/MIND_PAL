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
        'dark-brown': '#6D482F',
        'light-beige': '#F3EDE4',
        'text-dark': '#333333',
        'text-light': '#FFFFFF',
        'placeholder': '#A0A0A0',
        'light-gray': '#E0E0E0',
        'border-green': '#8DC63F',
        'error-red': '#FF0000',
        'success-green': '#4CAF50',
        'orange': '#FF8C42',
        'purple': '#9B8BB4',
        'beige': '#F5F5DC',
        'brown': '#4F3422',
        'brown-light': '#8B6A56',
      },
    },
  },
  plugins: [],
};
