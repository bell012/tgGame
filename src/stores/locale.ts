import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import i18n from '@/i18n'
import {
  getLocaleFromRouteParam,
  getLanguageCode,
  getStoredLocale,
  getStorageLanguageCode,
  DEFAULT_LOCALE,
  type Locale
} from '@/utils/locale'
import { switchLanguage } from '@/utils/router'

export const useLocaleStore = defineStore('locale', () => {
  const router = useRouter()

  // 当前语言（zh 或 eng）
  const currentLanguage = ref<Locale>(getStoredLocale())

  // 当前货币（none、USD、CNY）
  const currentCurrency = ref<string>(localStorage.getItem('currency') || 'none')

  // 同步语言
  watch(
    () => router.currentRoute.value.params.locale,
    newLocale => {
      const routeLocale = getLocaleFromRouteParam(newLocale as string | undefined) ?? DEFAULT_LOCALE
      const languageCode = getStorageLanguageCode(routeLocale) as Locale

      if (currentLanguage.value !== languageCode) {
        currentLanguage.value = languageCode
        i18n.global.locale.value = getLanguageCode(languageCode) as Locale
        localStorage.setItem('language', languageCode)
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
    const routeLocale = getLocaleFromRouteParam(route.params.locale as string | undefined)

    console.log('[LocaleStore] initLanguage - routeLocale:', routeLocale)

    if (routeLocale) {
      const languageCode = getStorageLanguageCode(routeLocale) as Locale
      currentLanguage.value = languageCode
      i18n.global.locale.value = getLanguageCode(languageCode) as Locale
    } else {
      const savedLanguage = getStoredLocale()
      currentLanguage.value = savedLanguage
      i18n.global.locale.value = getLanguageCode(savedLanguage) as Locale
    }

    localStorage.setItem('language', currentLanguage.value)
    console.log('[LocaleStore] initLanguage - currentLanguage:', currentLanguage.value)
    console.log('[LocaleStore] initLanguage - currentCurrency:', currentCurrency.value)
  }

  // 切换语言
  const setLanguage = (code: Locale) => {
    currentLanguage.value = code
    const i18nLocale = getLanguageCode(code) as Locale
    i18n.global.locale.value = i18nLocale
    localStorage.setItem('language', code)
    switchLanguage(code)
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
