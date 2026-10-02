import { reactive } from 'vue'
import type { SportMarketLine } from './types'
import type { OddsTrend } from './types'

const TREND_MS = 5000

const previous = new Map<number, number>()
const trends = reactive(new Map<number, Exclude<OddsTrend, null>>())
const timers = new Map<number, ReturnType<typeof setTimeout>>()

/** 第一次只记基准。之后变大记 up、变小记 down，相同数值不刷新箭头。 */
export const noteOdds = (id: number, odds: number) => {
  if (!Number.isFinite(id) || !Number.isFinite(odds)) return
  const prev = previous.get(id)
  previous.set(id, odds)
  if (prev === undefined || prev === odds) return

  trends.set(id, odds > prev ? 'up' : 'down')
  const existing = timers.get(id)
  if (existing) clearTimeout(existing)
  timers.set(
    id,
    setTimeout(() => {
      trends.delete(id)
      timers.delete(id)
    }, TREND_MS)
  )
}

export const trendOf = (id: number): OddsTrend => trends.get(id) ?? null

/** 锁盘不记趋势，避免锁图标格子闪出涨跌。 */
export const noteMarketLines = (lines: readonly SportMarketLine[]) => {
  for (const line of lines) {
    if (line.IsLocked) continue
    for (const selection of line.WagerSelections ?? []) {
      noteOdds(selection.WagerSelectionId, selection.Odds)
    }
  }
}
