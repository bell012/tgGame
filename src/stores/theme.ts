import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { syncIdleStatusBarColor } from '@/utils/sheetStatusBar'

export type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('dark')
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

    if (resolvedSystemUiThemeColor) {
      syncIdleStatusBarColor(resolvedSystemUiThemeColor)
    }

    if (resolvedBackgroundColor) {
      html.style.backgroundColor = resolvedBackgroundColor
      if (document.body) {
        document.body.style.backgroundColor = resolvedBackgroundColor
      }
    }
  }

  const initTheme = () => {
    const storedTheme = localStorage.getItem('theme')
    const savedTheme: Theme | null =
      storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null
    const colorSchemeQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null
    // 若浏览器不支持系统主题查询，统一使用深色作为兜底。
    systemPreference.value = colorSchemeQuery
      ? colorSchemeQuery.matches
        ? 'dark'
        : 'light'
      : 'dark'

    if (savedTheme) {
      theme.value = savedTheme
    } else {
      theme.value = systemPreference.value
    }

    applyTheme(theme.value)

    colorSchemeQuery?.addEventListener('change', e => {
      systemPreference.value = e.matches ? 'dark' : 'light'
      // 没有手动选择时继续跟随手机系统或 PC 浏览器主题；手动选择会在刷新后保留。
      if (!localStorage.getItem('theme')) {
        theme.value = systemPreference.value
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
    theme.value = systemPreference.value
    applyTheme(theme.value)
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
