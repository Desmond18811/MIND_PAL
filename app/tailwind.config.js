/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: NativeWind v4 requires the preset
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./Screens/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                'mind-green': '#A8C9A3',
                'mind-dark': '#2E3E34',
                'mind-orange': '#FFA726',
                'mind-bg': '#F5F7F5'
            }
        },
    },
    plugins: [],
}
