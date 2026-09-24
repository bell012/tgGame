import { onActivated, onDeactivated, onMounted, onScopeDispose, ref, watch } from 'vue'
import { getMatchDisplayTime } from '../shared/match'
import type { SportsMatch } from '../shared/types'

type MatchTimeOptions = {
  matches: () => readonly SportsMatch[]
  enabled: () => boolean
}

/** 页面共用一个秒表，只在有需要计时的赛事时运行。 */
export const useMatchTime = (options: MatchTimeOptions) => {
  const now = ref(Date.now())
  let mounted = false
  let active = true
  let timer: ReturnType<typeof setInterval> | undefined

  const stop = () => {
    clearInterval(timer)
    timer = undefined
  }
  const sync = () => {
    now.value = Date.now()
    const running = options.matches().some(match => match.phaseClock?.running)
    if (!mounted || !active || document.hidden || !options.enabled() || !running) {
      stop()
    } else if (!timer) {
      timer = setInterval(() => {
        now.value = Date.now()
      }, 1000)
    }
  }
  watch([options.matches, options.enabled], sync)
  onMounted(() => {
    mounted = true
    document.addEventListener('visibilitychange', sync)
    sync()
  })
  onActivated(() => {
    active = true
    sync()
  })
  onDeactivated(() => {
    active = false
    stop()
  })
  onScopeDispose(() => {
    active = false
    stop()
    document.removeEventListener('visibilitychange', sync)
  })

  return { getMatchTime: (match: SportsMatch) => getMatchDisplayTime(match, now.value) }
}
