import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'
import Api from '@/api'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { isApiBusinessSuccess } from '@/utils/apiBusiness'
import { getLanguageCode } from '@/utils/request'
import i18n from '@/i18n'
import { globalShowToast } from '@/utils/toast'

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

  // 旧请求的过期响应不能清掉新凭据。
  const clearCredentials = (expected?: SportsCredentials): boolean => {
    if (expected && !isCredentialsCurrent(expected)) return false
    generation += 1
    credentials.value = null
    pending = null
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
    if (pending) return pending
    if (credentials.value && isCredentialsCurrent(credentials.value))
      return Promise.resolve(credentials.value)
    if (!fetchIfMissing) return Promise.resolve(null)

    const requestGeneration = generation
    const requestContext = context.value
    const currency = currentCurrencyCode.value
    const language = getLanguageCode()
    loading.value = true
    const isCurrent = () =>
      requestGeneration === generation && requestContext === context.value && isLoggedIn.value
    // 先保存 pending，再发请求，避免旧请求清理新请求的状态。
    const request = Promise.resolve().then(async () => {
      try {
        if (!isCurrent()) return null
        const response = await Api.game.getloginPlatform(
          {
            pgType: 'TY',
            platformCode: 'TG_TY',
            targetCurrency: currency,
            languageCode: language
          },
          { showSuccessToast: false, showErrorToast: true }
        )
        if (!isCurrent()) return null
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
        return next
      } catch (error) {
        if (isCurrent()) {
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

  onScopeDispose(() => {
    clearCredentials()
  })

  return {
    isReady,
    isLoading,
    contextVersion,
    ensureCredentials,
    refreshCredentials,
    clearCredentials,
    isCredentialsCurrent
  }
})
