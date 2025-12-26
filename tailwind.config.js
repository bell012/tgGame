/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#42b883',
          dark: '#35495e'
        }
      },
      backgroundColor: {
        'light-bg': '#f5f5f5',
        'dark-bg': '#1a1a1a',
        'light-card': '#ffffff',
        'dark-card': '#2d2d2d'
      },
      textColor: {
        'light-primary': '#2c3e50',
        'light-secondary': '#6b7280',
        'dark-primary': '#e5e7eb',
        'dark-secondary': '#9ca3af'
      }
    },
  },
  plugins: [],
}

