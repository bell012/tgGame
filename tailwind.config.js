/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ========== 主题色 (Theme) ==========
        'theme-primary': 'var(--color-theme-level-1)',
        'theme-2': 'var(--color-theme-level-2)',
        'theme-3': 'var(--color-theme-level-3)',

        // ========== 背景色 (Background) ==========
        'bg-1': 'var(--color-background-level-1)',
        'bg-2': 'var(--color-background-level-2)',
        'bg-3': 'var(--color-background-level-3)',
        'bg-4': 'var(--color-background-level-4)',
        'bg-5': 'var(--color-background-level-5)',
        'bg-6': 'var(--color-background-level-6)',
        'bg-7': 'var(--color-background-level-7)',
        'bg-8': 'var(--color-background-level-8)',

        // ========== 文字色 (Text) ==========
        'text-1': 'var(--color-text-level-1)',
        'text-2': 'var(--color-text-level-2)',
        'text-3': 'var(--color-text-level-3)',
        'text-4': 'var(--color-text-level-4)',

        // ========== 图标色 (Icon) ==========
        'icon-1': 'var(--color-icon-level-1)',
        'icon-2': 'var(--color-icon-level-2)',
        'icon-3': 'var(--color-icon-level-3)',
        'icon-4': 'var(--color-icon-level-4)',

        // ========== 不透明度 (Opacity) ==========
        'opacity-5': 'var(--color-opacity-5)',
        'opacity-6': 'var(--color-opacity-5)',
        'opacity-10': 'var(--color-opacity-10)',
        'opacity-15': 'var(--color-opacity-15)',
        'opacity-30': 'var(--color-opacity-30)',

        // ========== 遮罩色 (Mask) ==========
        'mask-20': 'var(--color-mask-20)',
        'mask-40': 'var(--color-mask-40)',
        'mask-60-1': 'var(--color-mask-60-1)',
        'mask-80-2': 'var(--color-mask-80-2)',
        'mask-96-3': 'var(--color-mask-96-3)',
        'mask-100-4': 'var(--color-mask-100-4)',

        // ========== 次要色 (Secondary) ==========
        'secondary-1': 'var(--color-secondary-level-1)',
        'secondary-2': 'var(--color-secondary-level-2)',
        'secondary-3': 'var(--color-secondary-level-3)',
        'secondary-4': 'var(--color-secondary-level-4)',
        'secondary-5': 'var(--color-secondary-level-5)',
        'secondary-6': 'var(--color-secondary-level-6)',
        'secondary-7': 'var(--color-secondary-level-7)',
        'assist-red': 'var(--color-assist-red)',
        'assist-green': 'var(--color-assist-green)',
        'assist-blue': 'var( --color-assist-blue)',

        // ========== 通用色 (Common) ==========
        'common-100': 'var(--color-common-100)',
        'common-60': 'var(--color-common-60)',

        // ========== 输入框色 (Input) ==========
        'input-1': 'var(--color-input-level-1)',
        'input-2': 'var(--color-input-level-2)',
        'input-3': 'var(--color-input-level-3)'
      },

      // ========== 背景渐变 (Background Gradient) ==========
      backgroundImage: {
        'game-casino': 'var(--color-game-casino)',
        'game-sports': 'var(--color-game-sports)',
        'game-contract': 'var(--color-game-contract)',
        'game-slots': 'var(--color-game-slots)',
        'game-fishing': 'var(--color-game-fishing)',
        'game-live': 'var(--color-game-live)',
        'game-lottery': 'var(--color-game-lottery)',
        'game-table': 'var(--color-game-table)'
      },

      // ========== SVG 描边色 (Stroke) ==========
      stroke: {
        'text-1': 'var(--color-text-level-1)',
        'text-2': 'var(--color-text-level-2)',
        'text-3': 'var(--color-text-level-3)',
        'text-4': 'var(--color-text-level-4)',
        'icon-1': 'var(--color-icon-level-1)',
        'icon-2': 'var(--color-icon-level-2)',
        'icon-3': 'var(--color-icon-level-3)',
        'icon-4': 'var(--color-icon-level-4)',
        primary: 'var(--color-theme-level-1)'
      },

      // ========== SVG 填充色 (Fill) ==========
      fill: {
        'text-1': 'var(--color-text-level-1)',
        'text-2': 'var(--color-text-level-2)',
        'text-3': 'var(--color-text-level-3)',
        'text-4': 'var(--color-text-level-4)',
        'icon-1': 'var(--color-icon-level-1)',
        'icon-2': 'var(--color-icon-level-2)',
        'icon-3': 'var(--color-icon-level-3)',
        'icon-4': 'var(--color-icon-level-4)',
        primary: 'var(--color-theme-level-1)'
      },
      // ========== 背景模糊 (Backdrop Blur) ==========
      backdropBlur: {
        1: '1px'
      }
    }
  },
  plugins: []
}
