import { defineStore } from 'pinia'
import { ref } from 'vue'
import Api from '@/api'
import { SITE_CONFIG_STORAGE_KEY, useSiteConfigStore } from '@/stores/siteConfig'
import { useLocaleStore } from '@/stores/locale'
import type { QueryAcctInfoResult } from '@/api/interface/user'
import { useAuthModalStore } from '@/stores/authModal'
import { withLocalePrefix } from '@/utils/locale'
import { PLAYED_GAMES_CACHE_STORAGE_PREFIXES } from '@/utils/played-games-cache'
import { NOTIFICATION_CACHE_STORAGE_PREFIXES } from '@/utils/notification-cache'
import { setManualLogoutInProgress } from '@/utils/request'
import { getCurrentLocale, navigateTo } from '@/utils/router'
import {
  clearProfileAvatarPreviewState,
  profileUserInfoState,
  setProfileUserInfoState,
  syncProfileCustomizationState,
  syncProfileUserInfoState
} from '@/utils/profile-customization'

const ACCT_INFO_STORAGE_KEY = 'acctInfo'
const REMEMBERED_ACCOUNT_STORAGE_KEY = 'rememberedAccount'
const REMEMBERED_PASSWORD_STORAGE_KEY = 'rememberedPassword'
const REMEMBERED_SIGNIN_CREDENTIALS_STORAGE_KEY = 'rememberedSigninCredentials'
const TRADE_MESSAGE_SYNC_STORAGE_KEY = 'memberTradeMessageSync'

export const useUserStore = defineStore('user', () => {
  const userInfo = profileUserInfoState
  const acctInfo = ref<QueryAcctInfoResult | null>(null)

  const normalizeCurrencyCode = (value: unknown) => {
    return String(value ?? '')
      .trim()
      .toUpperCase()
  }

  const parseStoredItem = <T>(key: string): T | null => {
    const storedValue = localStorage.getItem(key)

    if (!storedValue) {
      return null
    }

    try {
      return JSON.parse(storedValue) as T
    } catch (error) {
      console.error(error)
      return null
    }
  }

  /**
   * 清除 localStorage 中除指定键外的所有数据
   * @param keys - 需要保留的键数组
   */
  function clearStorageExcept(keys: string[], keyPrefixes: string[] = []) {
    const removableKeys: string[] = []

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key || keys.includes(key) || keyPrefixes.some(prefix => key.startsWith(prefix))) {
        continue
      }
      removableKeys.push(key)
    }

    // 保留项不先删除再写回，避免覆盖其他标签页刚更新的记录。
    removableKeys.forEach(key => localStorage.removeItem(key))
  }

  const setAcctInfoState = (nextAcctInfo: QueryAcctInfoResult | null, persist = true) => {
    acctInfo.value = nextAcctInfo

    if (persist) {
      if (nextAcctInfo) {
        localStorage.setItem(ACCT_INFO_STORAGE_KEY, JSON.stringify(nextAcctInfo))
      } else {
        localStorage.removeItem(ACCT_INFO_STORAGE_KEY)
      }
    }

    return acctInfo.value
  }

  const syncCurrentCurrencyFromAcctInfo = async (nextAcctInfo?: QueryAcctInfoResult | null) => {
    const localeStore = useLocaleStore()
    const accountCurrency = normalizeCurrencyCode(nextAcctInfo?.currency)

    if (accountCurrency) {
      localeStore.setCurrency(accountCurrency)
      return
    }

    const siteConfigStore = useSiteConfigStore()
    const siteConfig = siteConfigStore.config ?? (await siteConfigStore.initSiteConfig())
    const defaultCurrency = normalizeCurrencyCode(siteConfig?.baseSiteConfig?.defaultCurrency)

    if (defaultCurrency) {
      localeStore.setCurrency(defaultCurrency)
    }
  }

  const syncStoredUserData = () => {
    syncProfileCustomizationState()
    syncProfileUserInfoState()
    acctInfo.value = parseStoredItem<QueryAcctInfoResult>(ACCT_INFO_STORAGE_KEY)
    const storedCurrency = normalizeCurrencyCode(acctInfo.value?.currency)

    if (storedCurrency) {
      useLocaleStore().setCurrency(storedCurrency)
    }

    return {
      userInfo: userInfo.value,
      acctInfo: acctInfo.value
    }
  }

  const refreshAcctInfo = async () => {
    try {
      const response = await Api.user.queryAcctInfo({})

      if (response?.result) {
        const nextAcctInfo = setAcctInfoState(response.result)
        await syncCurrentCurrencyFromAcctInfo(nextAcctInfo)
        return nextAcctInfo
      }

      await syncCurrentCurrencyFromAcctInfo(null)

      return acctInfo.value
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const refreshUserInfo = async (memberId: string) => {
    try {
      const response = await Api.user.selectMember({ memberId })

      if (response?.result) {
        return setProfileUserInfoState({
          ...(userInfo.value ?? {}),
          ...response.result
        })
      }

      return userInfo.value
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const refreshCurrentUserData = async (memberId?: string) => {
    syncStoredUserData()

    const storedMemberId = memberId || userInfo.value?.memberId || acctInfo.value?.memberId

    if (storedMemberId) {
      const [latestAcctInfo, latestUserInfo] = await Promise.all([
        refreshAcctInfo(),
        refreshUserInfo(storedMemberId)
      ])

      return {
        acctInfo: latestAcctInfo ?? acctInfo.value,
        userInfo: latestUserInfo ?? userInfo.value
      }
    }

    const latestAcctInfo = await refreshAcctInfo()
    const nextMemberId = latestAcctInfo?.memberId || acctInfo.value?.memberId
    const latestUserInfo = nextMemberId ? await refreshUserInfo(nextMemberId) : userInfo.value

    return {
      acctInfo: latestAcctInfo ?? acctInfo.value,
      userInfo: latestUserInfo ?? userInfo.value
    }
  }

  /**
   * 清除所有用户相关的本地状态，但保留基础偏好设置和按账号隔离的通知缓存
   */
  const clearUserSessionData = () => {
    clearStorageExcept(
      [
        'language',
        'currency',
        'theme',
        'device_trace_id',
        SITE_CONFIG_STORAGE_KEY,
        REMEMBERED_ACCOUNT_STORAGE_KEY,
        REMEMBERED_PASSWORD_STORAGE_KEY,
        REMEMBERED_SIGNIN_CREDENTIALS_STORAGE_KEY,
        TRADE_MESSAGE_SYNC_STORAGE_KEY
      ],
      [
        ...NOTIFICATION_CACHE_STORAGE_PREFIXES,
        ...PLAYED_GAMES_CACHE_STORAGE_PREFIXES,
        'sportsAcceptAnyOdds:'
      ]
    )
    clearProfileAvatarPreviewState()
    syncProfileCustomizationState()
    syncProfileUserInfoState()
    setAcctInfoState(null, false)
  }

  /**
   * 手动退出登录：返回首页并刷新页面
   */
  function logout() {
    const authModalStore = useAuthModalStore()

    authModalStore.closeModal()
    setManualLogoutInProgress(true)
    clearUserSessionData()

    if (typeof window !== 'undefined') {
      window.location.replace(withLocalePrefix('/', getCurrentLocale()))
      return
    }

    void navigateTo('/', { replace: true })
  }

  /**
   * 登录失效处理：回到首页后打开登录弹窗
   */
  async function handleAuthExpired() {
    clearUserSessionData()
    await navigateTo('/', { replace: true })

    const authModalStore = useAuthModalStore()
    authModalStore.openLoginModal()
  }

  return {
    userInfo,
    acctInfo,
    syncStoredUserData,
    refreshAcctInfo,
    refreshUserInfo,
    refreshCurrentUserData,
    logout,
    handleAuthExpired
  }
})
