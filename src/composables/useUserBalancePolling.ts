import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, watch } from 'vue'

const BALANCE_POLL_MS = 10_000

let owners = 0
let timer: ReturnType<typeof setInterval> | null = null
let visibilityBound = false

const isDocumentVisible = () =>
  typeof document === 'undefined' || document.visibilityState === 'visible'

const isLoggedIn = () => {
  const userStore = useUserStore()
  return Boolean(userStore.userInfo?.tradeToken || userStore.acctInfo?.memberId)
}

const clearTimer = () => {
  if (timer == null) {
    return
  }

  clearInterval(timer)
  timer = null
}

const ensureTimer = () => {
  if (timer != null || owners <= 0 || !isLoggedIn() || !isDocumentVisible()) {
    return
  }

  const userStore = useUserStore()
  timer = setInterval(() => {
    if (owners <= 0 || !isLoggedIn() || !isDocumentVisible()) {
      clearTimer()
      return
    }

    // 普通刷新：进行中的强制刷新会被复用，不会被这次轮询覆盖。
    void userStore.refreshBalance()
  }, BALANCE_POLL_MS)
}

const syncTimer = () => {
  if (owners > 0 && isLoggedIn() && isDocumentVisible()) {
    ensureTimer()
    return
  }

  clearTimer()
}

const handleVisibilityChange = () => {
  syncTimer()
}

const bindVisibility = () => {
  if (visibilityBound || typeof document === 'undefined') {
    return
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  visibilityBound = true
}

const unbindVisibility = () => {
  if (!visibilityBound || typeof document === 'undefined') {
    return
  }

  document.removeEventListener('visibilitychange', handleVisibilityChange)
  visibilityBound = false
}

/**
 * 登录后每 10 秒刷新一次主账户余额。多个页面共用一个定时器。
 * 组件卸载、KeepAlive 停用或退出登录时停止；引用归零才真正 clearInterval。
 */
export const useUserBalancePolling = () => {
  const userStore = useUserStore()
  const { acctInfo, userInfo } = storeToRefs(userStore)
  let active = false

  const start = () => {
    if (active) {
      return
    }

    active = true
    owners += 1
    bindVisibility()
    syncTimer()
  }

  const stop = () => {
    if (!active) {
      return
    }

    active = false
    owners = Math.max(0, owners - 1)

    if (owners <= 0) {
      clearTimer()
      unbindVisibility()
    }
  }

  onMounted(start)
  // KeepAlive 首次进入会先 onMounted 再 onActivated，active 锁避免引用加两次。
  onActivated(start)
  onDeactivated(stop)
  onBeforeUnmount(stop)

  watch(
    () => Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId),
    () => {
      if (!active) {
        return
      }

      syncTimer()
    }
  )
}
