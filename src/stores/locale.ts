import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

export const useLocaleStore = defineStore('locale', () => {
  const router = useRouter()
  const { locale } = useI18n()

  // 当前语言（zh-CN 或 en）
  const currentLanguage = ref<string>(localStorage.getItem('language') || 'en')

  // 当前货币（none、USD、CNY）
  const currentCurrency = ref<string>(localStorage.getItem('currency') || 'none')

  // 同步语言
  watch(
    () => router.currentRoute.value.params.locale,
    (newLocale) => {
      if (newLocale) {
        const languageCode = newLocale === 'zh' ? 'zh-CN' : 'en'
        if (currentLanguage.value !== languageCode) {
          currentLanguage.value = languageCode
          locale.value = newLocale === 'zh' ? 'zh' : 'en'
          localStorage.setItem('language', languageCode)
          console.log('[LocaleStore] Route changed, language updated to:', languageCode)
        }
      }
    },
    { immediate: true }
  )

  // 计算实际使用的货币
  const actualCurrency = computed(() => {
    return currentCurrency.value === 'none' ? 'USD' : currentCurrency.value
  })

  // 初始化语言
  const initLanguage = () => {
    const route = router.currentRoute.value
    const routeLocale = route.params.locale as string

    console.log('[LocaleStore] initLanguage - routeLocale:', routeLocale)

    if (routeLocale) {
      if (routeLocale === 'zh') {
        currentLanguage.value = 'zh-CN'
        locale.value = 'zh'
      } else {
        currentLanguage.value = 'en'
        locale.value = 'en'
      }
    } else {
      const savedLanguage = localStorage.getItem('language') || 'en'
      currentLanguage.value = savedLanguage
      locale.value = savedLanguage === 'zh-CN' ? 'zh' : 'en'
    }

    localStorage.setItem('language', currentLanguage.value)
    console.log('[LocaleStore] initLanguage - currentLanguage:', currentLanguage.value)
    console.log('[LocaleStore] initLanguage - currentCurrency:', currentCurrency.value)
  }

  // 切换语言
  const setLanguage = (code: string) => {
    currentLanguage.value = code
    const i18nLocale = code === 'zh-CN' ? 'zh' : 'en'
    locale.value = i18nLocale
    localStorage.setItem('language', code)
    const route = router.currentRoute.value
    const currentPath = route.path.replace(/^\/(zh|en)/, '')
    if (i18nLocale === 'zh') {
      router.push(`/zh${currentPath || '/'}`)
    } else {
      router.push(currentPath || '/')
    }
  }

  // 切换货币
  const setCurrency = (code: string) => {
    currentCurrency.value = code
    localStorage.setItem('currency', code)
  }

  return {
    currentLanguage,
    currentCurrency,
    actualCurrency,
    initLanguage,
    setLanguage,
    setCurrency
  }
})

