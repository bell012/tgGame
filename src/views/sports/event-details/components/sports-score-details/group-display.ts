import type { ScoreDetailsMarketCard, ScoreDetailsMarketGroup } from './types'

export const COLLAPSED_GROUP_ROW_LIMIT = 3

export const getMarketRowCount = (market: ScoreDetailsMarketCard): number => {
  if (market.kind === 'dual-column') return market.rows.length
  if (market.kind === 'score-picker') return 1
  return Math.ceil(market.options.length / 3)
}

export const shouldExpandGroup = (group: ScoreDetailsMarketGroup): boolean =>
  group.markets.reduce((count, market) => count + getMarketRowCount(market), 0) >
  COLLAPSED_GROUP_ROW_LIMIT

/** 仅截取显示行，保留原盘口 ID、行内空位及选项对象，不跨盘口拼行。 */
export const getVisibleGroupMarkets = (
  group: ScoreDetailsMarketGroup,
  expanded: boolean
): ScoreDetailsMarketCard[] => {
  if (expanded) return group.markets
  let remaining = COLLAPSED_GROUP_ROW_LIMIT
  const visible: ScoreDetailsMarketCard[] = []
  for (const market of group.markets) {
    if (remaining <= 0) break
    const count = getMarketRowCount(market)
    if (count <= remaining) {
      visible.push(market)
    } else if (market.kind === 'dual-column') {
      visible.push({ ...market, rows: market.rows.slice(0, remaining) })
    } else if (market.kind !== 'score-picker') {
      visible.push({ ...market, options: market.options.slice(0, remaining * 3) })
    }
    remaining -= count
  }
  return visible
}
