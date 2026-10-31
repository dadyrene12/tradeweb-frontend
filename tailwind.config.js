/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e73be',
        secondary: '#1a5f9e',
        accent: '#ff6c00',
        'gray-50': '#f7f7f7',
        'gray-100': '#f5f5f5',
        'gray-200': '#eeeeee',
        'gray-300': '#e5e5e5',
        'gray-400': '#bfbfbf',
        'gray-500': '#777777',
        'gray-600': '#666666',
        'gray-700': '#333333',
        'gray-800': '#242424',
        'gray-900': '#1a1a1a',
      },
      fontFamily: {
        sans: ['Roboto', 'Open Sans', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '1200': '1200px',
      },
    },
  },
  plugins: [],
}