/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        triage: {
          black: '#000000',
          red: '#EF4444',
          yellow: '#FCD34D',
          green: '#10B981',
        },
      },
    },
  },
  plugins: [],
}
