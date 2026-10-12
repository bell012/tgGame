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

export type BalanceRefreshError = {
  kind: 'business' | 'network'
  message: string
}

export interface RefreshBalanceOptions {
  force?: boolean
}

export const useUserStore = defineStore('user', () => {
  const userInfo = profileUserInfoState
  const acctInfo = ref<QueryAcctInfoResult | null>(null)
  const isRefreshingBalance = ref(false)
  const balanceRefreshError = ref<BalanceRefreshError | null>(null)

  // 每次切换会话或刷新余额时递增。返回时版本不一致的请求不能写入当前账户状态。
  let balanceRefreshVersion = 0
  let pendingBalanceRefresh: {
    version: number
    promise: Promise<QueryAcctInfoResult | null>
  } | null = null

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

  const syncCurrentCurrencyFromAcctInfo = async (
    nextAcctInfo?: QueryAcctInfoResult | null,
    isCurrent = () => true
  ) => {
    if (!isCurrent()) {
      return
    }

    const localeStore = useLocaleStore()
    const accountCurrency = normalizeCurrencyCode(nextAcctInfo?.currency)

    if (accountCurrency) {
      if (isCurrent()) {
        localeStore.setCurrency(accountCurrency)
      }
      return
    }

    const siteConfigStore = useSiteConfigStore()
    const siteConfig = siteConfigStore.config ?? (await siteConfigStore.initSiteConfig())
    const defaultCurrency = normalizeCurrencyCode(siteConfig?.baseSiteConfig?.defaultCurrency)

    if (defaultCurrency && isCurrent()) {
      localeStore.setCurrency(defaultCurrency)
    }
  }

  /**
   * 让已发出的余额请求失效。请求无法可靠取消，但旧响应将不再覆盖当前会话的数据。
   */
  const invalidateBalanceRefresh = () => {
    balanceRefreshVersion += 1
    pendingBalanceRefresh = null
    isRefreshingBalance.value = false
    balanceRefreshError.value = null
  }

  const syncStoredUserData = () => {
    const previousAcctInfo = acctInfo.value
    const previousSessionKey = JSON.stringify([
      userInfo.value?.memberId ?? previousAcctInfo?.memberId ?? '',
      userInfo.value?.tradeToken ?? ''
    ])
    const storedAcctInfo = parseStoredItem<QueryAcctInfoResult>(ACCT_INFO_STORAGE_KEY)

    syncProfileCustomizationState()
    syncProfileUserInfoState()
    const nextSessionKey = JSON.stringify([
      userInfo.value?.memberId ?? storedAcctInfo?.memberId ?? '',
      userInfo.value?.tradeToken ?? ''
    ])
    const acctInfoChanged = JSON.stringify(previousAcctInfo) !== JSON.stringify(storedAcctInfo)

    // 页面挂载也会调用此方法，只有本地账户数据或会话身份真的变化时才废弃旧请求。
    if (acctInfoChanged || previousSessionKey !== nextSessionKey) {
      invalidateBalanceRefresh()
    }

    acctInfo.value = storedAcctInfo
    const storedCurrency = normalizeCurrencyCode(acctInfo.value?.currency)

    if (storedCurrency) {
      useLocaleStore().setCurrency(storedCurrency)
    }

    return {
      userInfo: userInfo.value,
      acctInfo: acctInfo.value
    }
  }

  /**
   * 全局余额刷新入口。
   *
   * `acctInfo` 是 TopNav 和 useDisplayCurrency 的响应式余额来源；成功写入后，
   * `currentBalanceText` 会自动重新计算，调用页面无需直接操作 TopNav。
   * 默认复用正在进行中的余额查询；传入 force=true 时会发起最新查询，
   * 并让此前尚未完成的余额查询结果失效。
   */
  const refreshBalance = (
    options: RefreshBalanceOptions = {}
  ): Promise<QueryAcctInfoResult | null> => {
    if (!options.force && pendingBalanceRefresh) {
      return pendingBalanceRefresh.promise
    }

    // 业务操作（充值、提现、领奖、切钱包等）完成后必须以这次请求为准。
    balanceRefreshVersion += 1
    pendingBalanceRefresh = null
    const requestVersion = balanceRefreshVersion
    const isCurrentRequest = () => requestVersion === balanceRefreshVersion

    isRefreshingBalance.value = true
    balanceRefreshError.value = null

    const promise = (async (): Promise<QueryAcctInfoResult | null> => {
      try {
        const response = await Api.user.queryAcctInfo({})

        if (!isCurrentRequest()) {
          return null
        }

        if (!response?.result) {
          // 刷新失败时保留现有 acctInfo，避免顶部余额闪成 0 或空值。
          balanceRefreshError.value = {
            kind: 'business',
            message: response?.message || 'Failed to refresh balance'
          }
          return null
        }

        // 余额是本次请求的核心结果，不能因可选的币种默认值初始化失败而丢弃。
        const nextAcctInfo = setAcctInfoState(response.result)

        try {
          await syncCurrentCurrencyFromAcctInfo(nextAcctInfo, isCurrentRequest)
        } catch (error) {
          // 币种字段正常存在时不会走到这里；兜底配置拉取失败只记录，不影响余额刷新。
          if (isCurrentRequest()) {
            console.error(error)
          }
        }

        return isCurrentRequest() ? nextAcctInfo : null
      } catch (error) {
        if (isCurrentRequest()) {
          // 请求错误由触发页面决定是否提示；Store 只保留可观察的错误状态。
          balanceRefreshError.value = {
            kind: 'network',
            message: error instanceof Error ? error.message : 'Failed to refresh balance'
          }
        }
        if (isCurrentRequest()) {
          console.error(error)
        }
        return null
      }
    })()

    pendingBalanceRefresh = { version: requestVersion, promise }

    void promise.finally(() => {
      // 旧请求结束时不能关闭新请求的 loading，也不能清掉新请求的引用。
      if (pendingBalanceRefresh?.promise !== promise) {
        return
      }

      pendingBalanceRefresh = null

      if (isCurrentRequest()) {
        isRefreshingBalance.value = false
      }
    })

    return promise
  }

  /**
   * @deprecated 业务页面请使用 refreshBalance()，名称更能表达调用意图。
   * 保留该别名，避免旧模块或外部扩展在升级时中断。
   */
  const refreshAcctInfo = () => refreshBalance()

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

    // 登录/注册会传入明确账号。此时即使 localStorage 尚未更新，也必须隔离游客或旧账号的请求。
    if (memberId) {
      invalidateBalanceRefresh()
    }

    const storedMemberId = memberId || userInfo.value?.memberId || acctInfo.value?.memberId

    if (storedMemberId) {
      const [latestAcctInfo, latestUserInfo] = await Promise.all([
        refreshBalance(),
        refreshUserInfo(storedMemberId)
      ])

      return {
        acctInfo: latestAcctInfo ?? acctInfo.value,
        userInfo: latestUserInfo ?? userInfo.value
      }
    }

    const latestAcctInfo = await refreshBalance()
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
    invalidateBalanceRefresh()
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
    isRefreshingBalance,
    balanceRefreshError,
    syncStoredUserData,
    refreshBalance,
    refreshAcctInfo,
    refreshUserInfo,
    refreshCurrentUserData,
    logout,
    handleAuthExpired
  }
})
