import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light')
  const systemPreference = ref<Theme>('light')

  const syncSystemThemeColor = () => {
    const html = document.documentElement
    const computedStyle = getComputedStyle(html)
    const systemUiThemeColor = computedStyle.getPropertyValue('--color-background-level-2').trim()
    const pageBackgroundColor = computedStyle.getPropertyValue('--color-background-level-1').trim()
    const bodyBackgroundColor = document.body
      ? getComputedStyle(document.body).backgroundColor.trim()
      : ''
    const resolvedSystemUiThemeColor = systemUiThemeColor || bodyBackgroundColor
    const resolvedBackgroundColor = pageBackgroundColor || bodyBackgroundColor

    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColorMeta && resolvedSystemUiThemeColor) {
      themeColorMeta.setAttribute('content', resolvedSystemUiThemeColor)
    }

    if (resolvedBackgroundColor) {
      html.style.backgroundColor = resolvedBackgroundColor
      if (document.body) {
        document.body.style.backgroundColor = resolvedBackgroundColor
      }
    }
  }

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

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      systemPreference.value = e.matches ? 'dark' : 'light'
      if (!localStorage.getItem('theme')) {
        setTheme(systemPreference.value)
      }
    })
  }

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement

    if (newTheme === 'dark') {
      html.classList.remove('light')
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
    }
    setTimeout(() => {
      syncSystemThemeColor()
    }, 0)
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

  watch(theme, newTheme => {
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
