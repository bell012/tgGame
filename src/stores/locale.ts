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
import { initGlobalDicCache } from '@/utils/global-dic'
import { useGameStore } from '@/stores/game'
import { usePromotionsStore } from '@/stores/promotions'
import type { SiteConfig } from '@/stores/siteConfig'

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

  // 将 /sy/dlicgh 返回的默认语言转换成项目内部使用的语言 code。
  const normalizeSiteDefaultLanguage = (value: unknown): Locale | null => {
    const normalizedValue = String(value ?? '').trim()
    if (!normalizedValue) {
      return null
    }

    const languageCode = getStorageLanguageCode(normalizedValue)
    return languageCode ? (languageCode as Locale) : null
  }

  // 将 /sy/dlicgh 返回的默认货币统一转换成大写币种 code。
  const normalizeSiteDefaultCurrency = (value: unknown) => {
    return String(value ?? '')
      .trim()
      .toUpperCase()
  }

  // 页面刷新初始化时，以 /sy/dlicgh 的默认语言为准；默认货币只在本地没有选择时兜底。
  // 登录用户的当前货币以后端 /acct/queryAcctInfo 返回的 currency 为准。
  const applySiteDefaults = (siteConfig?: SiteConfig | null) => {
    const baseSiteConfig = siteConfig?.baseSiteConfig
    const defaultLanguage = normalizeSiteDefaultLanguage(baseSiteConfig?.defaultLanguageCode)
    const defaultCurrency = normalizeSiteDefaultCurrency(baseSiteConfig?.defaultCurrency)

    // defaultLanguageCode 控制当前语言和路由语言前缀，例如 eng / zh。
    if (defaultLanguage) {
      currentLanguage.value = defaultLanguage
      i18n.global.locale.value = getLanguageCode(defaultLanguage) as Locale
      localStorage.setItem('language', defaultLanguage)
      switchLanguage(defaultLanguage)
    }

    if (defaultCurrency && currentCurrency.value === 'none') {
      setCurrency(defaultCurrency)
    }
  }

  // 切换语言
  const setLanguage = async (code: Locale) => {
    currentLanguage.value = code
    const i18nLocale = getLanguageCode(code) as Locale
    i18n.global.locale.value = i18nLocale
    localStorage.setItem('language', code)

    // 切换语言时同步刷新全局多语言字典缓存与游戏列表缓存。
    const gameStore = useGameStore()
    const promotionsStore = usePromotionsStore()

    await Promise.all([
      initGlobalDicCache(),
      gameStore.refreshGameData(true),
      Promise.resolve(promotionsStore.syncGroupsLanguage())
    ])

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
    applySiteDefaults,
    setLanguage,
    setCurrency
  }
})
