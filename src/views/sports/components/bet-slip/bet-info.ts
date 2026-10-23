import type {
  SportsBetInfoQuote,
  SportsBetInfoSelectionParams,
  SportsOddsType
} from '@/api/interface/sport'

export const isBetInfoMarketClosed = (quote: SportsBetInfoQuote | null | undefined) =>
  Number(quote?.mlsid) === 2

export const isBetInfoRetryable = (quote: SportsBetInfoQuote | null | undefined) =>
  Number(quote?.st) === 380 && Number(quote?.mlsid) === 1

/** 只接受同盘型的可投或已更新报价；失败项即使带旧赔率也不能用于提交。 */
export const isBetInfoQuoteUsable = (
  quote: SportsBetInfoQuote | null | undefined,
  oddsType: SportsOddsType
) =>
  Boolean(
    quote &&
    [100, 381].includes(Number(quote.st)) &&
    Number(quote.mlsid) === 1 &&
    Number(quote.ot) === oddsType &&
    decimalOdds(quote.o, oddsType) !== null
  )

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
      // 串关失效项可能返回空 rid、零盘口/选项 ID；仅将明确关盘结果关联到唯一原选项。
      // 不按响应顺序匹配，也不把缺少身份信息的可投报价用于下单。
      if (quote.st === 380 && quote.mlsid === 2 && quote.wsid === 0 && quote.mlid === 0) {
        const candidates = selections.filter(
          item =>
            item.EventId === quote.eid &&
            item.SportId === quote.sid &&
            item.BetTypeId === quote.btid &&
            item.BetTypeSelectionId === quote.btsid
        )
        if (candidates.length === 1) {
          const original = candidates[0]
          // 关盘响应的盘口值可能为 0；展示仍保留原选项，不把占位值当成换线。
          quotes.set(original.RefId, {
            ...quote,
            rid: original.RefId,
            h: original.Handicap,
            dih: null,
            o: original.Odds,
            ot: original.OddsType,
            sp: original.Specifiers
          })
          continue
        }
      }
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

/** 将同一投注选项的赔率换算为欧洲盘；无效或未知盘型返回 null，不计算派彩。 */
export const decimalOdds = (odds: number, type: number): number | null => {
  if (!Number.isFinite(odds)) return null
  if (type === 3) return odds > 1 ? odds : null
  if (type === 2) return odds > 0 ? odds + 1 : null
  if (type === 1 || type === 4)
    return odds > 0 ? odds + 1 : odds < 0 ? 1 + 1 / Math.abs(odds) : null
  if (type === 6) return odds > 0 ? 1 + odds / 100 : odds < 0 ? 1 + 100 / Math.abs(odds) : null
  return null
}
