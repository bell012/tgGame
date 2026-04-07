import { computed, onMounted, onUnmounted, ref } from 'vue'

// 持久化倒计时
interface UsePersistentCountdownOptions {
  storageKey: string
  durationSeconds?: number
}

const getStoredExpiresAt = (storageKey: string): number | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const storedValue = window.localStorage.getItem(storageKey)
  const expiresAt = Number(storedValue)

  return Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : null
}

export const usePersistentCountdown = ({
  storageKey,
  durationSeconds = 60
}: UsePersistentCountdownOptions) => {
  const remainingSeconds = ref(0)
  let timer: number | null = null

  /**
   * 停止当前倒计时定时器。
   */
  const stopTimer = () => {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }

  /**
   * 清除本地持久化倒计时。
   */
  const clearCountdown = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey)
    }

    remainingSeconds.value = 0
    stopTimer()
  }

  /**
   * 同步当前剩余倒计时秒数。
   */
  const syncCountdown = () => {
    const expiresAt = getStoredExpiresAt(storageKey)

    if (!expiresAt) {
      clearCountdown()
      return
    }

    const nextRemainingSeconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
    remainingSeconds.value = nextRemainingSeconds

    if (nextRemainingSeconds <= 0) {
      clearCountdown()
    }
  }

  /**
   * 启动定时同步。
   */
  const startTimer = () => {
    stopTimer()
    syncCountdown()

    if (remainingSeconds.value <= 0) {
      return
    }

    timer = window.setInterval(() => {
      syncCountdown()
    }, 1000)
  }

  /**
   * 开始一个新的持久化倒计时。
   */
  const startCountdown = (seconds: number = durationSeconds) => {
    if (typeof window !== 'undefined') {
      const expiresAt = Date.now() + seconds * 1000
      window.localStorage.setItem(storageKey, String(expiresAt))
    }

    startTimer()
  }

  onMounted(() => {
    startTimer()
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    remainingSeconds,
    isRunning: computed(() => remainingSeconds.value > 0),
    canStart: computed(() => remainingSeconds.value <= 0),
    startCountdown,
    clearCountdown,
    syncCountdown
  }
}
