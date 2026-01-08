/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector', // Enable class-based dark mode (Tailwind v4)
    theme: {
        extend: {},
        fontFamily: {
            sans: ['Roboto', 'sans-serif'],
            heading: ['Outfit', 'sans-serif'],
        },
    },
    plugins: [],
}
