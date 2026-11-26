import Api from '@/api'
import type { GameDetailForPlatformPlay } from '@/composables/useGamePlatformPlay'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { resolveGameSelectionPath } from '@/composables/useGameSelectionReturn'
import { useUserStore } from '@/stores/user'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import { savePlayedGameRowId } from '@/utils/played-games-cache'
import { navigateTo } from '@/utils/router'
import { computed, onBeforeUnmount, ref, watch, type ComputedRef } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from 'vue-router'

type GameSession = {
  key: string
  account: string
  rowId: string
  gameCode: string
  companyCode: string
  currency: string
  url: string
  horizontal: boolean
}
export function useEmbeddedGame(
  detail: ComputedRef<GameDetailForPlatformPlay>,
  closeOverlay: () => boolean
) {
  const userStore = useUserStore()
  const route = useRoute()
  const { currentCurrencyCode, setDisplayCurrency } = useDisplayCurrency()
  const account = computed(() =>
    userStore.userInfo?.tradeToken
      ? `${userStore.userInfo.tradeToken}:${userStore.acctInfo?.memberRowId ?? ''}`
      : ''
  )
  const target = computed(() => {
    const game = detail.value
    const rowId = String(game?.rowId ?? '').trim()
    const gameCode = String(game?.itemCode ?? '').trim()
    const companyCode = String(game?.platformCode ?? '').trim()
    const currency = currentCurrencyCode.value
    if (
      !account.value ||
      !rowId ||
      rowId !== String(route.params.rowId) ||
      !gameCode ||
      !companyCode ||
      !currency ||
      currency === 'NONE'
    )
      return null
    return {
      key: JSON.stringify([account.value, rowId, gameCode, companyCode, currency]),
      account: account.value,
      rowId,
      gameCode,
      companyCode,
      currency,
      pgType: game?.pgType
    }
  })
  const session = ref<GameSession | null>(null)
  const fullscreen = ref(false)
  const busy = ref(false)
  const frameLoading = ref(false)
  const failedTargetKey = ref<string>()
  const loadError = computed(
    () => Boolean(failedTargetKey.value) && failedTargetKey.value === target.value?.key
  )
  const showExitProgress = ref(false)
  const leaving = ref(false)
  let active = true
  let operation: Promise<boolean> | null = null
  let leaveOperation: Promise<boolean> | null = null
  let exitTimer: ReturnType<typeof setTimeout> | undefined
  let frameTimer: ReturnType<typeof setTimeout> | undefined

  const clearFrameTimer = () => {
    clearTimeout(frameTimer)
    frameTimer = undefined
  }
  const clearSession = () => {
    clearFrameTimer()
    session.value = null
    frameLoading.value = false
    fullscreen.value = false
  }
  const finishFrameLoad = () => {
    clearFrameTimer()
    frameLoading.value = false
  }
  const failFrameLoad = () => {
    finishFrameLoad()
    failedTargetKey.value = session.value?.key
  }

  const stopSession = async () => {
    const previous = session.value
    if (previous && previous.account === account.value) {
      ensureApiBusinessSuccess(
        await Api.game.logoutAllPlatform({
          companyCode: previous.companyCode,
          gameCode: previous.gameCode
        })
      )
    }
    clearSession()
  }

  // 所有启动、换币和退出操作串行，避免旧退出请求结束掉新游戏会话。
  const run = (work: () => Promise<void>): Promise<boolean> => {
    if (operation) return Promise.resolve(false)
    const originalKey = target.value?.key
    const originalAccount = account.value
    busy.value = true
    const pending = Promise.resolve()
      .then(work)
      .then(() => true)
      .catch(() => {
        if (
          active &&
          originalAccount === account.value &&
          originalKey === target.value?.key &&
          !session.value?.url
        )
          failedTargetKey.value = originalKey
        return false
      })
      .finally(() => {
        operation = null
        busy.value = false
        if (active && !leaving.value && !loadError.value && originalKey !== target.value?.key)
          void start()
      })
    operation = pending
    return pending
  }

  const launch = async (syncWallet = true, openFullscreen = false) => {
    const next = target.value
    if (!next || !active) return
    try {
      await stopSession()
      if (!active || next.key !== target.value?.key) return
      failedTargetKey.value = undefined
      if (syncWallet) {
        ensureApiBusinessSuccess(await Api.user.changeWallet({ currency: next.currency }))
        if (!active || next.key !== target.value?.key) return
        void userStore.refreshBalance({ force: true })
      }
      const response = ensureApiBusinessSuccess(
        await Api.game.getloginPlatform({
          pgType: next.pgType,
          gameCode: next.gameCode,
          platformCode: next.companyCode,
          currency: next.currency
        })
      )
      if (!active || next.account !== account.value) return
      const rawUrl = response.result?.platformLink
      const url = typeof rawUrl === 'string' ? rawUrl.trim() : ''
      session.value = { ...next, url, horizontal: String(response.result?.isHorizontal) === '1' }
      if (!url) throw new Error('Missing game URL')
      if (next.key !== target.value?.key) return
      frameLoading.value = true
      frameTimer = setTimeout(failFrameLoad, 30000)
      // 手动重试沿用原启动时机：取得链接即全屏，不等待 iframe 加载。
      if (openFullscreen && !leaving.value) {
        fullscreen.value = true
        savePlayedGameRowId(next.rowId)
      }
    } catch (error) {
      // 切币会改变 run 开始时的目标，启动失败必须归属本次实际请求的币种。
      if (
        active &&
        next.key === target.value?.key &&
        (session.value?.key !== next.key || !session.value?.url)
      )
        failedTargetKey.value = next.key
      throw error
    }
  }

  const start = (openFullscreen = false) => {
    if (!active || leaving.value || !target.value || operation) return Promise.resolve(false)
    if (session.value?.url && session.value.key === target.value.key && !loadError.value)
      return Promise.resolve(true)
    return run(() => launch(true, openFullscreen))
  }
  const enterFullscreen = () => {
    if (
      !session.value?.url ||
      session.value.key !== target.value?.key ||
      busy.value ||
      frameLoading.value ||
      loadError.value ||
      leaving.value
    )
      return
    fullscreen.value = true
    savePlayedGameRowId(session.value.rowId)
  }
  const playGame = () => (!session.value?.url || loadError.value ? start(true) : enterFullscreen())
  const changeCurrency = (currency: string) => {
    if (!target.value || leaving.value || operation) return Promise.resolve(false)
    const originalAccount = account.value
    return run(async () => {
      await stopSession()
      if (!active || originalAccount !== account.value) return
      ensureApiBusinessSuccess(await Api.user.changeWallet({ currency }))
      if (!active || originalAccount !== account.value) return
      setDisplayCurrency(currency)
      await userStore.refreshBalance({ force: true })
      if (!active || originalAccount !== account.value) return
      if (currentCurrencyCode.value !== currency) throw new Error('Currency not synchronized')
      await launch(false)
    })
  }

  const leave = async () => {
    leaving.value = true
    exitTimer = setTimeout(() => {
      showExitProgress.value = true
    }, 250)
    try {
      if (operation) await operation
      if (!active || !session.value) return true
      return await run(stopSession)
    } finally {
      clearTimeout(exitTimer)
      showExitProgress.value = false
      leaving.value = false
    }
  }
  const beforeLeave = () => {
    if (closeOverlay()) return false
    if (!leaveOperation) {
      leaveOperation = leave().finally(() => {
        leaveOperation = null
      })
    }
    return leaveOperation
  }
  const requestExit = () => {
    if (leaving.value) return
    // 离页守卫统一结束会话，避免按钮和路由重复发送退出请求。
    return navigateTo(resolveGameSelectionPath(), { replace: true })
  }
  const collapseGame = () => {
    if (busy.value || leaving.value) return
    fullscreen.value = false
  }
  onBeforeRouteLeave(beforeLeave)
  // 详情页按 fullPath 挂载，查询参数变化也会重建页面，需要先结束旧会话。
  onBeforeRouteUpdate((to, from) => (to.fullPath === from.fullPath ? true : beforeLeave()))

  watch(
    account,
    () => {
      clearSession()
      failedTargetKey.value = undefined
    },
    { flush: 'sync' }
  )
  watch(
    () => target.value?.key,
    () => {
      void start()
    },
    { immediate: true }
  )
  onBeforeUnmount(() => {
    active = false
    clearSession()
    clearTimeout(exitTimer)
  })

  return {
    session: computed(() =>
      session.value?.url && session.value.key === target.value?.key ? session.value : null
    ),
    fullscreen,
    busy,
    frameLoading,
    loadError,
    showExitProgress,
    leaving,
    start,
    enterFullscreen,
    playGame,
    changeCurrency,
    finishFrameLoad,
    failFrameLoad,
    collapseGame,
    requestExit
  }
}
