import { defineStore } from 'pinia'
import { ref } from 'vue'
import Api from '@/api'
import type { QueryAcctInfoResult } from '@/api/interface/user'
import { useAuthModalStore } from '@/stores/authModal'
import { withLocalePrefix } from '@/utils/locale'
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

export const useUserStore = defineStore('user', () => {
  const userInfo = profileUserInfoState
  const acctInfo = ref<QueryAcctInfoResult | null>(null)

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
  function clearStorageExcept(keys: string[]) {
    const keep: Record<string, string> = {}

    keys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) keep[key] = value
    })

    localStorage.clear()

    Object.entries(keep).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })
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

  const syncStoredUserData = () => {
    syncProfileCustomizationState()
    syncProfileUserInfoState()
    acctInfo.value = parseStoredItem<QueryAcctInfoResult>(ACCT_INFO_STORAGE_KEY)

    return {
      userInfo: userInfo.value,
      acctInfo: acctInfo.value
    }
  }

  const refreshAcctInfo = async () => {
    try {
      const response = await Api.user.queryAcctInfo({})

      if (response?.result) {
        return setAcctInfoState(response.result)
      }

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
   * 清除所有用户相关的本地状态，但保留语言、货币和主题设置
   */
  const clearUserSessionData = () => {
    clearStorageExcept(['language', 'currency', 'theme'])
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
