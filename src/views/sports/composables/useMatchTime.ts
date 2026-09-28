import {
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  provide,
  ref,
  shallowReactive,
  watch
} from 'vue'
import type { InjectionKey } from 'vue'
import { getMatchDisplayTime } from '../shared/match'
import type { SportsMatch } from '../shared/types'

type MatchTimeOptions = {
  matches: () => readonly SportsMatch[]
  enabled: () => boolean
  retainClock: (id: string) => boolean
}

type DisplayClock = NonNullable<SportsMatch['phaseClock']>
export const matchTimeKey: InjectionKey<(match: SportsMatch) => string> = Symbol('match-time')

/** 页面共用一个秒表，只在有需要计时的赛事时运行。 */
export const useMatchTime = (options: MatchTimeOptions) => {
  const now = ref(Date.now())
  const clocks = shallowReactive(new Map<string, DisplayClock>())
  let mounted = false
  let active = true
  let timer: ReturnType<typeof setInterval> | undefined

  const stop = () => {
    clearInterval(timer)
    timer = undefined
  }
  const sync = () => {
    const matches = options.matches()
    // 筛选和换页不重置已见赛事的计时起点。
    const activeIds = new Set(matches.map(match => match.id))
    for (const id of clocks.keys())
      if (!activeIds.has(id) && !options.retainClock(id)) clocks.delete(id)
    for (const match of matches) {
      const clock = match.phaseClock
      if (!clock) {
        clocks.delete(match.id)
        continue
      }
      const previous = clocks.get(match.id)
      // 同阶段持续运行时沿用前端起点；暂停、恢复或换阶段才校准。
      const keepClock = clock.running && previous?.running && previous.period === clock.period
      if (!keepClock) clocks.set(match.id, clock)
    }
    const running = matches.some(match => match.phaseClock?.running)
    if (!mounted || !active || document.hidden || !options.enabled() || !running) {
      stop()
    } else if (!timer) {
      now.value = Date.now()
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
    clocks.clear()
  })

  const getMatchTime = (match: SportsMatch) => {
    const clock = clocks.get(match.id) ?? match.phaseClock
    return getMatchDisplayTime(match, clock?.running ? now.value : 0, clock)
  }
  provide(matchTimeKey, getMatchTime)
  return { getMatchTime }
}
