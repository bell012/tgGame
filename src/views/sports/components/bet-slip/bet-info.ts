import type { SportsBetInfoQuote, SportsBetInfoSelectionParams } from '@/api/interface/sport'

// 按选项 ID 关联报价；字段缺失不等于投注项失效。
export const parseBetInfoItems = (
  selections: SportsBetInfoSelectionParams[],
  rawQuotes: readonly SportsBetInfoQuote[]
) => {
  const quotes = new Map<number, SportsBetInfoQuote & { rid: number }>()
  const replacedIds = new Set<number>()
  for (const quote of rawQuotes) {
    if (!quote) continue
    const input = selections.find(
      item => item.WagerSelectionId === quote.wsid || item.RefId === quote.rid
    )
    if (!input) {
      const original = selections.find(
        item =>
          item.EventId === quote.eid &&
          item.MarketlineId === quote.mlid &&
          item.BetTypeSelectionId === quote.btsid
      )
      if (original && quote.wsid != null) replacedIds.add(original.RefId)
      continue
    }
    if (quote.wsid != null && quote.wsid !== input.WagerSelectionId) {
      replacedIds.add(input.RefId)
      continue
    }
    quotes.set(input.RefId, { ...quote, rid: input.RefId })
  }
  return { quotes: [...quotes.values()], replacedIds: [...replacedIds] }
}

// 只用于比较赔率改善，不用于计算派彩；派彩读取接口 epa。
export const decimalOdds = (odds: number, type: number): number | null => {
  if (!Number.isFinite(odds)) return null
  if (type === 3) return odds > 1 ? odds : null
  if (type === 2) return odds > 0 ? odds + 1 : null
  if (type === 1 || type === 4)
    return odds > 0 ? odds + 1 : odds < 0 ? 1 + 1 / Math.abs(odds) : null
  if (type === 6) return odds > 0 ? 1 + odds / 100 : odds < 0 ? 1 + 100 / Math.abs(odds) : null
  return null
}
