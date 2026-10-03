import { defineStore } from 'pinia'
import { computed, onScopeDispose, ref, watch } from 'vue'
import Api from '@/api'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { useSportsAuthStore } from '@/stores/sportsAuth'
import type { EnsureSportsCredentialsOptions, SportsCredentials } from '@/stores/sportsAuth'
import i18n from '@/i18n'
import { globalShowToast } from '@/utils/toast'

type SportsBalanceError = {
  kind: 'credentials' | 'business' | 'network'
  message: string
  code?: number | string
}

type SportsBalanceUpdate = { amount?: unknown; refresh?: boolean }
const BALANCE_INTERVAL = 30_000

export const useSportsBalanceStore = defineStore('sportsBalance', () => {
  const sportsAuth = useSportsAuthStore()
  const userStore = useUserStore()
  const siteConfigStore = useSiteConfigStore()
  const { currentCurrencyCode } = useDisplayCurrency()
  const isLoggedIn = computed(() =>
    Boolean(userStore.userInfo?.tradeToken || userStore.acctInfo?.memberId)
  )
  // 独立 Pinia 单例，与凭证 Store 同生命周期；仅保存当前标签页内存状态。
  const sportsBalance = ref<number | null>(null)
  const sportsBalanceLoading = ref(false)
  const sportsBalanceError = ref<SportsBalanceError | null>(null)
  const balanceRequestTimes = new Map<string, number>()
  const walletOwner = computed(() =>
    JSON.stringify([
      isLoggedIn.value,
      userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId,
      currentCurrencyCode.value,
      siteConfigStore.getConfigString('IM.im_app_url')
    ])
  )
  let balanceGeneration = 0
  let balanceRevision = 0
  let balanceMemberCode: string | null = null
  let balancePending: {
    generation: number
    credentialsVersion: number
    promise: Promise<boolean>
  } | null = null
  const balanceTasks = new Set<symbol>()
  let credentialTaskVersion = 0
  const balanceUpdates = new Set<symbol>()
  let balanceUpdatesOverlapped = false
  let balanceRefreshRequested = false
  let balanceTimer: ReturnType<typeof setTimeout> | undefined
  const clearBalanceTimer = () => {
    if (balanceTimer !== undefined) clearTimeout(balanceTimer)
    balanceTimer = undefined
  }
  const resetBalance = () => {
    balanceGeneration += 1
    balanceRevision += 1
    balanceMemberCode = null
    balancePending = null
    balanceTasks.clear()
    balanceUpdates.clear()
    balanceUpdatesOverlapped = false
    balanceRefreshRequested = false
    clearBalanceTimer()
    sportsBalance.value = null
    sportsBalanceLoading.value = false
    sportsBalanceError.value = null
  }
  watch(walletOwner, resetBalance, { flush: 'sync' })
  // 只观察凭证公开状态；失效任务不应拖住新查询的 loading 或冷却补查。
  watch(
    [() => sportsAuth.contextVersion, () => sportsAuth.isReady],
    () => {
      if (sportsAuth.isReady) return
      credentialTaskVersion += 1
      balancePending = null
      balanceTasks.clear()
      sportsBalanceLoading.value = false
    },
    { flush: 'sync' }
  )
  const bindBalanceMember = (memberCode: string) => {
    if (balanceMemberCode !== null && balanceMemberCode !== memberCode) resetBalance()
    balanceMemberCode = memberCode
  }
  const rateKey = (memberCode: string) =>
    JSON.stringify([siteConfigStore.getConfigString('IM.im_app_url'), memberCode])
  const balanceDelay = (memberCode: string) => {
    const last = balanceRequestTimes.get(rateKey(memberCode))
    return last === undefined ? 0 : Math.max(0, last + BALANCE_INTERVAL - Date.now())
  }
  const drainBalanceRefresh = () => {
    if (
      !balanceRefreshRequested ||
      balancePending ||
      balanceTasks.size ||
      balanceUpdates.size ||
      balanceTimer !== undefined
    )
      return
    const delay = balanceMemberCode ? balanceDelay(balanceMemberCode) : 0
    balanceTimer = setTimeout(() => {
      balanceTimer = undefined
      if (balanceRefreshRequested) void fetchSportsBalance({ fetchIfMissing: false })
    }, delay)
  }
  const scheduleSportsBalanceRefresh = () => {
    if (!isLoggedIn.value) return
    balanceRefreshRequested = true
    drainBalanceRefresh()
  }

  // 先取得有效凭证，再按其版本合并查询；不依赖凭证 Store 的内部状态。
  const querySportsBalance = (snapshot: SportsCredentials): Promise<boolean> => {
    const requestGeneration = balanceGeneration
    if (
      balancePending?.generation === requestGeneration &&
      balancePending.credentialsVersion === snapshot.version
    )
      return balancePending.promise
    const current = () =>
      requestGeneration === balanceGeneration && sportsAuth.isCredentialsCurrent(snapshot)
    sportsBalanceError.value = null
    const promise = Promise.resolve().then(async () => {
      let requestRevision = balanceRevision
      try {
        if (!current()) return false
        if (balanceUpdates.size) return sportsBalance.value !== null
        if (balanceDelay(snapshot.memberCode)) {
          // 首次查询失败或旧上下文已发送时也不能永久停在 --。
          if (sportsBalance.value === null) balanceRefreshRequested = true
          return sportsBalance.value !== null
        }
        requestRevision = balanceRevision
        balanceRequestTimes.set(rateKey(snapshot.memberCode), Date.now())
        // 补查直到当前钱包的有效响应才消费；凭证变化导致响应过期时保留。
        clearBalanceTimer()
        const response = await Api.sport.getBalance(
          siteConfigStore.getConfigString('IM.im_app_url'),
          { Token: snapshot.token, MemberCode: snapshot.memberCode, TimeStamp: Date.now() }
        )
        if (!current() || requestRevision !== balanceRevision) {
          if (requestGeneration === balanceGeneration && sportsBalance.value === null)
            balanceRefreshRequested = true
          return false
        }
        balanceRefreshRequested = false
        if ([102, '102', 202, '202'].includes(response.stc)) {
          sportsAuth.clearCredentials(snapshot)
          sportsBalanceError.value = {
            kind: 'credentials',
            code: response.stc,
            message: response.std
          }
          globalShowToast({ type: 'fail', message: i18n.global.t('sports.betLoginFailed') })
          return false
        }
        if (
          (response.stc !== 100 && response.stc !== '100') ||
          typeof response.av !== 'number' ||
          !Number.isFinite(response.av)
        ) {
          sportsBalanceError.value = { kind: 'business', code: response.stc, message: response.std }
          return false
        }
        sportsBalance.value = response.av
        return true
      } catch (error) {
        if (current() && requestRevision === balanceRevision) {
          balanceRefreshRequested = false
          sportsBalanceError.value = {
            kind: 'network',
            message: error instanceof Error ? error.message : 'Balance query failed'
          }
        } else if (requestGeneration === balanceGeneration && sportsBalance.value === null) {
          balanceRefreshRequested = true
        }
        return false
      } finally {
        if (balancePending?.promise === promise) {
          balancePending = null
          drainBalanceRefresh()
        }
      }
    })
    balancePending = {
      generation: requestGeneration,
      credentialsVersion: snapshot.version,
      promise
    }
    return promise
  }

  const fetchSportsBalance = async (
    options: EnsureSportsCredentialsOptions = {}
  ): Promise<boolean> => {
    if (!isLoggedIn.value || !siteConfigStore.getConfigString('IM.im_app_url')) return false
    const owner = balanceGeneration
    const context = sportsAuth.contextVersion
    const credentialsVersion = credentialTaskVersion
    const task = Symbol('sports-balance-query')
    balanceTasks.add(task)
    sportsBalanceLoading.value = true
    try {
      const snapshot = await sportsAuth.ensureCredentials(options)
      if (
        owner !== balanceGeneration ||
        context !== sportsAuth.contextVersion ||
        credentialsVersion !== credentialTaskVersion
      )
        return false
      if (!snapshot) {
        // 旧登录结束时可能已有新凭证，不覆盖新查询的状态。
        if (!sportsAuth.isReady) {
          balanceRefreshRequested = false
          sportsBalanceError.value = {
            kind: 'credentials',
            message: 'Sports credentials unavailable'
          }
        }
        return false
      }
      if (!sportsAuth.isCredentialsCurrent(snapshot)) return false
      bindBalanceMember(snapshot.memberCode)
      // 会员变化会清空旧任务；当前任务已验证为新会员，重新登记。
      balanceTasks.add(task)
      sportsBalanceLoading.value = true
      if (balanceUpdates.size) return sportsBalance.value !== null
      return await querySportsBalance(snapshot)
    } finally {
      balanceTasks.delete(task)
      sportsBalanceLoading.value = balanceTasks.size > 0
      drainBalanceRefresh()
    }
  }

  const beginSportsBalanceUpdate = (snapshot?: SportsCredentials) => {
    const valid = !snapshot || sportsAuth.isCredentialsCurrent(snapshot)
    if (snapshot && valid) bindBalanceMember(snapshot.memberCode)
    const owner = balanceGeneration
    const memberCode = snapshot?.memberCode ?? balanceMemberCode
    const key = Symbol('sports-balance-update')
    if (valid) {
      if (balanceUpdates.size) balanceUpdatesOverlapped = true
      balanceUpdates.add(key)
      balanceRevision += 1
    }
    let finished = false
    return ({ amount, refresh = false }: SportsBalanceUpdate = {}) => {
      if (finished) return
      finished = true
      if (!valid || owner !== balanceGeneration) return
      balanceUpdates.delete(key)
      if (memberCode && balanceMemberCode && memberCode !== balanceMemberCode) return
      // 重叠更新无法按响应到达顺序判断哪笔 av 最新，整个重叠区间统一补查。
      if (!balanceUpdatesOverlapped && typeof amount === 'number' && Number.isFinite(amount)) {
        balanceMemberCode = memberCode ?? balanceMemberCode
        sportsBalance.value = amount
        sportsBalanceError.value = null
        balanceRevision += 1
      }
      if (refresh) balanceRefreshRequested = true
      if (!balanceUpdates.size && balanceUpdatesOverlapped) {
        balanceUpdatesOverlapped = false
        balanceRefreshRequested = true
      }
      drainBalanceRefresh()
    }
  }

  watch(
    () => sportsAuth.isReady,
    ready => {
      if (ready) void fetchSportsBalance({ fetchIfMissing: false })
    },
    { immediate: true }
  )

  onScopeDispose(resetBalance)

  return {
    sportsBalance,
    sportsBalanceLoading,
    sportsBalanceError,
    fetchSportsBalance,
    scheduleSportsBalanceRefresh,
    beginSportsBalanceUpdate
  }
})
