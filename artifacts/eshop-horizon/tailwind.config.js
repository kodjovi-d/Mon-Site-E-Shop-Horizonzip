/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: '#7D9B76',
        'warm-beige': '#F5EDD7',
        'cream': '#FAFAF7',
        anthracite: '#2D2D2D',
        'cta-green': '#4A7C59',
        'soft-gold': '#C9A84C',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
