import type {
  SportsBetInfoQuote,
  SportsBetInfoSetting,
  SportsBetInfoSelectionParams
} from '@/api/interface/sport'

const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const isBetInfoQuote = (value: unknown): value is SportsBetInfoQuote =>
  record(value) &&
  ['st', 'eid', 'mlid', 'mlsid', 'wsid', 'btsid', 'sid', 'ot', 'o'].every(key =>
    finite(value[key])
  ) &&
  (value.rid === null || finite(value.rid)) &&
  (value.h === null || finite(value.h)) &&
  (value.sp === null || typeof value.sp === 'string')

export const isBetInfoSetting = (value: unknown): value is SportsBetInfoSetting =>
  record(value) &&
  ['masa', 'misa', 'noc', 'combs', 'epa'].every(key => finite(value[key])) &&
  (value.rid === null || finite(value.rid)) &&
  Number(value.misa) >= 0 &&
  Number(value.masa) >= Number(value.misa) &&
  Number(value.epa) >= 0 &&
  Number.isInteger(value.noc) &&
  Number(value.noc) >= 0 &&
  Number.isInteger(value.combs)

// 单项缺失或格式异常只标记该项，不丢掉其他单关的有效报价。
export const parseBetInfoItems = (
  selections: SportsBetInfoSelectionParams[],
  rawQuotes: readonly unknown[],
  rawSettings: readonly unknown[],
  single: boolean
) => {
  const quotes: (SportsBetInfoQuote & { rid: number })[] = []
  const settings: SportsBetInfoSetting[] = []
  const errors: Record<number, string> = {}
  for (const input of selections) {
    const candidates = rawQuotes.filter(
      quote =>
        record(quote) &&
        (quote.rid === null || quote.rid === input.RefId) &&
        quote.eid === input.EventId &&
        quote.sid === input.SportId &&
        quote.mlid === input.MarketlineId &&
        quote.wsid === input.WagerSelectionId &&
        quote.btsid === input.BetTypeSelectionId
    )
    const quote = candidates[0]
    if (candidates.length !== 1 || !isBetInfoQuote(quote)) {
      let reason = 'sports.betInfoIncomplete'
      if (candidates.length === 1 && record(quote)) {
        if (quote.st === 380 && quote.mlsid === 2) reason = 'sports.betMarketClosed'
        else if (finite(quote.st) && ![100, 381].includes(quote.st))
          reason =
            !single && quote.st === 439
              ? 'sports.betParlayUnsupported'
              : 'sports.betInfoSelectionUnavailable'
      }
      errors[input.RefId] = reason
      continue
    }
    quotes.push({ ...quote, rid: input.RefId })
    if (!single) continue
    const matchingSettings = rawSettings.filter(
      item => record(item) && item.rid === input.RefId && item.combs === 0
    )
    const setting = matchingSettings[0]
    if (matchingSettings.length === 1 && isBetInfoSetting(setting)) settings.push(setting)
    else if ([100, 381].includes(quote.st) && quote.mlsid === 1)
      errors[input.RefId] = 'sports.betInfoIncomplete'
  }
  return { quotes, settings, errors }
}

export const comboLabel = (combo: number, count: number) => {
  if (combo >= 9 && combo <= 17) return `${combo - 7}-Fold`
  const systems: Record<number, string> = {
    1: 'Trixie',
    2: 'Yankee',
    3: 'Super Yankee',
    4: 'Heinz',
    5: 'Super Heinz',
    6: 'Goliath',
    7: '9-Fold System',
    8: '10-Fold System'
  }
  return systems[combo] ?? (combo === 18 ? `${count}-Fold` : `Combo ${combo}`)
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

export const sameHandicap = (a: number | null, b: number | null) => a === b
