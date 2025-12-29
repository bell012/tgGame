/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'theme-primary': 'var(--color-theme-level-1)',
        'bg-1': 'var(--color-background-level-1)',
        'bg-2': 'var(--color-background-level-2)',
        'bg-3': 'var(--color-background-level-3)',
        'bg-4': 'var(--color-background-level-4)',
        'bg-5': 'var(--color-background-level-5)',
        'bg-6': 'var(--color-background-level-6)',
        'text-1': 'var(--color-text-level-1)',
        'text-2': 'var(--color-text-level-2)',
        'text-3': 'var(--color-text-level-3)',
        'text-4': 'var(--color-text-level-4)',
        'border-1': 'var(--color-border-level-1)',
        'border-2': 'var(--color-border-level-2)'
      },
      stroke: {
        'text-1': 'var(--color-text-level-1)',
        'text-2': 'var(--color-text-level-2)',
        'text-3': 'var(--color-text-level-3)',
        'text-4': 'var(--color-text-level-4)',
        primary: 'var(--color-theme-level-1)'
      },
      fill: {
        'text-1': 'var(--color-text-level-1)',
        'text-2': 'var(--color-text-level-2)',
        'text-3': 'var(--color-text-level-3)',
        'text-4': 'var(--color-text-level-4)',
        primary: 'var(--color-theme-level-1)'
      }
    }
  },
  plugins: []
}
