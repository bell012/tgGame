import { onActivated, onDeactivated, onMounted, onScopeDispose, ref, shallowRef, watch } from 'vue'
import { getMatchDisplayTime } from '../shared/match'
import type { SportsMatch } from '../shared/types'

type MatchTimeOptions = {
  matches: () => readonly SportsMatch[]
  enabled: () => boolean
}

type DisplayClock = NonNullable<SportsMatch['phaseClock']>

/** 页面共用一个秒表，只在有需要计时的赛事时运行。 */
export const useMatchTime = (options: MatchTimeOptions) => {
  const now = ref(Date.now())
  const clocks = shallowRef(new Map<string, DisplayClock>())
  let mounted = false
  let active = true
  let timer: ReturnType<typeof setInterval> | undefined

  const stop = () => {
    clearInterval(timer)
    timer = undefined
  }
  const sync = () => {
    now.value = Date.now()
    const matches = options.matches()
    // 筛选和换页不重置已见赛事的计时起点。
    const next = new Map(clocks.value)
    for (const match of matches) {
      const clock = match.phaseClock
      if (!clock) {
        next.delete(match.id)
        continue
      }
      const previous = clocks.value.get(match.id)
      // 同阶段持续运行时沿用前端起点；暂停、恢复或换阶段才校准。
      const keepClock = clock.running && previous?.running && previous.period === clock.period
      next.set(match.id, keepClock ? previous : clock)
    }
    clocks.value = next
    const running = matches.some(match => match.phaseClock?.running)
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
    clocks.value = new Map()
  })

  return {
    getMatchTime: (match: SportsMatch) =>
      getMatchDisplayTime(match, now.value, clocks.value.get(match.id) ?? match.phaseClock)
  }
}
