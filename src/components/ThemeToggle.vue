<template>
  <button
    class="theme-toggle-btn"
    :aria-label="t('theme.toggle')"
    @click="toggleTheme"
  >
    <transition name="theme-icon" mode="out-in">
      <svg
        v-if="theme === 'light'"
        key="sun"
        class="icon sun-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <svg
        v-else
        key="moon"
        class="icon moon-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </transition>
  </button>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const { toggleTheme } = themeStore
</script>

<style scoped>
.theme-toggle-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background-color: var(--color-opacity-8);
  transition: all 0.3s;
  border: 1px solid var(--color-opacity-15);
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  background-color: var(--color-opacity-10);
}

.theme-toggle-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-theme-level-1);
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.sun-icon {
  color: var(--color-secondary-level-6);
}

.moon-icon {
  color: var(--color-theme-level-1);
}

.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.3s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0);
}
</style>

