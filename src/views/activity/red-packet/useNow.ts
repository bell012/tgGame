import { onScopeDispose, ref } from 'vue'

const now = ref(Date.now())
let subscribers = 0
let timer: ReturnType<typeof setInterval> | null = null

/** 多个倒计时共享同一个每秒刷新的时间戳。 */
export function useNow() {
  subscribers += 1
  if (!timer) {
    now.value = Date.now()
    timer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }

  onScopeDispose(() => {
    subscribers -= 1
    if (subscribers === 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  })

  return now
}

const pad = (value: number) => String(value).padStart(2, '0')

/** 剩余毫秒数格式化为 HH:mm:ss（超过 99 小时按实际小时数显示）。 */
export const formatCountdown = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

/** 时间戳格式化为 MM/DD HH:mm，withSeconds 时追加秒。 */
export const formatDateTime = (timestamp?: number, withSeconds = false) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const base = `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  return withSeconds ? `${base}:${pad(date.getSeconds())}` : base
}

/** 时间戳格式化为 MM/DD/YYYY HH:mm:ss。 */
export const formatFullDateTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
