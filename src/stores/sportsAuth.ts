import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import Api from '@/api'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { isApiBusinessSuccess } from '@/utils/apiBusiness'
import { getLanguageCode } from '@/utils/request'
import i18n from '@/i18n'
import { globalShowToast } from '@/utils/toast'
import { stripLocalePrefix } from '@/utils/locale'

export type SportsCredentials = Readonly<{
  token: string
  memberCode: string
  version: number
  contextVersion: number
}>

export type EnsureSportsCredentialsOptions = {
  /** false：只复用已有凭据或在途登录，不主动发起登录。 */
  fetchIfMissing?: boolean
}

export const useSportsAuthStore = defineStore('sportsAuth', () => {
  const userStore = useUserStore()
  const localeStore = useLocaleStore()
  const siteConfigStore = useSiteConfigStore()
  const router = useRouter()
  const isSportsRoute = computed(() => {
    const path = stripLocalePrefix(router.currentRoute.value.path)
    return path === '/sports' || path.startsWith('/sports/')
  })
  const { currentCurrencyCode } = useDisplayCurrency()
  const isLoggedIn = computed(() =>
    Boolean(userStore.userInfo?.tradeToken || userStore.acctInfo?.memberId)
  )
  const credentials = shallowRef<SportsCredentials | null>(null)
  const context = ref(0)
  const loading = ref(false)
  const contextVersion = computed(() => context.value)
  const isReady = computed(() => credentials.value !== null)
  const isLoading = computed(() => loading.value)
  let generation = 0
  let credentialVersion = 0
  let pending: Promise<SportsCredentials | null> | null = null
  let pendingCanLogin = false
  let balanceRefreshNeeded = false

  const isCredentialsCurrent = (snapshot: SportsCredentials) => {
    const current = credentials.value
    return (
      current !== null &&
      current.contextVersion === context.value &&
      current.version === snapshot.version &&
      current.contextVersion === snapshot.contextVersion &&
      current.token === snapshot.token &&
      current.memberCode === snapshot.memberCode
    )
  }

  /** 仅供赛事列表读取已有会员身份，不等待余额或登录请求；需 Token 的接口仍使用 ensureCredentials。 */
  const peekCredentials = (): SportsCredentials | null => {
    const current = credentials.value
    if (!isLoggedIn.value || !currentCurrencyCode.value || !current) return null
    return isCredentialsCurrent(current) ? current : null
  }

  // 旧请求的过期响应不能清掉新凭据。
  const clearCredentials = (expected?: SportsCredentials): boolean => {
    if (expected && !isCredentialsCurrent(expected)) return false
    generation += 1
    credentials.value = null
    pending = null
    pendingCanLogin = false
    loading.value = false
    return true
  }

  watch(
    [
      () => userStore.userInfo?.tradeToken,
      () => userStore.userInfo?.memberId,
      () => userStore.acctInfo?.memberId,
      currentCurrencyCode,
      () => localeStore.currentLanguage,
      () => siteConfigStore.getConfigString('IM.im_app_url')
    ],
    () => {
      context.value += 1
      clearCredentials()
    },
    { flush: 'sync' }
  )

  const ensureCredentials = ({
    fetchIfMissing = true
  }: EnsureSportsCredentialsOptions = {}): Promise<SportsCredentials | null> => {
    if (!isLoggedIn.value || !currentCurrencyCode.value) return Promise.resolve(null)
    if (pending) {
      if (fetchIfMissing) pendingCanLogin = true
      return pending
    }
    if (!fetchIfMissing && !credentials.value) return Promise.resolve(null)

    const requestContext = context.value
    const currency = currentCurrencyCode.value
    const language = getLanguageCode()
    pendingCanLogin = fetchIfMissing
    loading.value = true
    const isContextCurrent = (): boolean =>
      pending === request && requestContext === context.value && isLoggedIn.value
    // 先保存 pending，再发请求，避免旧请求清理新请求的状态。
    const request = Promise.resolve().then(async () => {
      try {
        while (isContextCurrent()) {
          // 主账户查询可能使平台凭据过期，缓存复用和新登录都要等查询结束。
          await userStore.waitForBalanceQueries()
          if (!isContextCurrent()) return null
          if (credentials.value && isCredentialsCurrent(credentials.value)) return credentials.value
          if (!pendingCanLogin || (balanceRefreshNeeded && !isSportsRoute.value)) return null
          const requestGeneration = generation
          const balanceVersion = userStore.balanceUpdatedVersion
          const response = await Api.game.getloginPlatform(
            {
              pgType: 'TY',
              platformCode: 'TG_TY',
              targetCurrency: currency,
              languageCode: language
            },
            { showSuccessToast: false, showErrorToast: true }
          )
          await userStore.waitForBalanceQueries()
          if (!isContextCurrent()) return null
          if (requestGeneration !== generation) {
            // 仅余额事件触发补取；普通登录失败不循环重试，离开体育也不主动登录。
            if (balanceVersion !== userStore.balanceUpdatedVersion && isSportsRoute.value) continue
            return null
          }
          if (!isApiBusinessSuccess(response)) {
            if (!response.message)
              globalShowToast({ type: 'fail', message: i18n.global.t('sports.serviceUnavailable') })
            return null
          }
          const account = response.result?.platformAcct
          const token = response.result?.token
          if (
            typeof account !== 'string' ||
            !account.trim() ||
            typeof token !== 'string' ||
            !token.trim()
          ) {
            credentials.value = null
            globalShowToast({ type: 'fail', message: i18n.global.t('sports.serviceUnavailable') })
            return null
          }
          const next: SportsCredentials = Object.freeze({
            memberCode: account.trim(),
            token,
            version: ++credentialVersion,
            contextVersion: requestContext
          })
          credentials.value = next
          balanceRefreshNeeded = false
          return next
        }
        return null
      } catch (error) {
        if (isContextCurrent()) {
          credentials.value = null
          // HTTP 错误已有提示；断网和超时没有响应，需要补一次提示。
          if (isAxiosError(error) && !error.response && error.code !== 'ERR_CANCELED')
            globalShowToast({ type: 'fail', message: i18n.global.t('sports.serviceUnavailable') })
        }
        return null
      } finally {
        if (pending === request) {
          pending = null
          loading.value = false
        }
      }
    })
    pending = request
    return request
  }

  const refreshCredentials = (): Promise<SportsCredentials | null> => {
    if (pending) return pending
    clearCredentials()
    return ensureCredentials()
  }

  watch(
    () => userStore.balanceUpdatedVersion,
    () => {
      // 保留在途登录的排队入口；其响应会按代际丢弃并在需要时补取。
      generation += 1
      credentials.value = null
      balanceRefreshNeeded = true
      if (isSportsRoute.value && isLoggedIn.value) void ensureCredentials()
    },
    { flush: 'sync' }
  )
  watch(isSportsRoute, active => {
    if (active && balanceRefreshNeeded && isLoggedIn.value) void ensureCredentials()
  })

  onScopeDispose(() => {
    clearCredentials()
  })

  return {
    isReady,
    isLoading,
    contextVersion,
    peekCredentials,
    ensureCredentials,
    refreshCredentials,
    clearCredentials,
    isCredentialsCurrent
  }
})
