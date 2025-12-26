import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light')
  const systemPreference = ref<Theme>('light')

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    systemPreference.value = prefersDark ? 'dark' : 'light'
    
    if (savedTheme) {
      theme.value = savedTheme
    } else {
      theme.value = systemPreference.value
    }
    
    applyTheme(theme.value)
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      systemPreference.value = e.matches ? 'dark' : 'light'
      if (!localStorage.getItem('theme')) {
        setTheme(systemPreference.value)
      }
    })
  }

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement
    
    if (newTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#1a1a1a' : '#42b883')
    }
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const useSystemTheme = () => {
    localStorage.removeItem('theme')
    setTheme(systemPreference.value)
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    systemPreference,
    initTheme,
    setTheme,
    toggleTheme,
    useSystemTheme
  }
})

