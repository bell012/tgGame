export type NoticeKey =
  | ''
  | 'needTwoSelections'
  | 'selectionLimit'
  | 'submitted'
  | 'balanceRefreshed'
  | 'notImplemented'
  | 'currencyChanged'
export const MOCK_BALANCE = 1000
export const MAX_SELECTIONS = 8
export const NOTICE_MESSAGES: Record<Exclude<NoticeKey, ''>, string> = {
  needTwoSelections: 'Add selections from at least two different matches to place a parlay.',
  selectionLimit: 'You can select up to eight different matches.',
  submitted: 'Local simulation complete. No real bet was placed and no balance was deducted.',
  balanceRefreshed: 'Mock balance refreshed. No real account was requested.',
  notImplemented: 'The design for this dialog is not available yet.',
  currencyChanged: 'Display currency changed. Mock bets have been reset.'
}
/** 空输入按 0 处理，拒绝负数、指数和超过两位的小数。 */
export const parseSportsStake = (raw: string): number | null => {
  const value = raw.trim()
  if (!value) return 0
  if (!/^\d{1,7}(?:\.\d{0,2})?$/.test(value)) return null
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

export const moneyRound = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

/** 本地串关组合计算，不代表服务端的真实结算规则。 */
export const getSportsCombinations = (odds: readonly number[], size: number): number[] => {
  if (!Number.isInteger(size) || size < 2 || size > odds.length || odds.length > MAX_SELECTIONS)
    return []
  const products: number[] = []
  const visit = (start: number, remaining: number, product: number) => {
    if (remaining === 0) {
      products.push(product)
      return
    }
    for (let index = start; index <= odds.length - remaining; index += 1) {
      const odd = odds[index]
      if (!Number.isFinite(odd) || odd <= 1) continue
      visit(index + 1, remaining - 1, product * odd)
    }
  }
  visit(0, size, 1)
  return products
}
