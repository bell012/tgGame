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
