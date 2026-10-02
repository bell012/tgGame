export const MAX_SELECTIONS = 8
/** 空输入按 0 处理，拒绝负数、指数和超过两位的小数。 */
export const parseSportsStake = (raw: string): number | null => {
  const value = raw.trim()
  if (!value) return 0
  if (!/^\d{1,7}(?:\.\d{0,2})?$/.test(value)) return null
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

export const moneyRound = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export const adjustSportsStakeToBalance = (
  raw: string,
  balance: number | null,
  otherStake: number,
  combinationCount: number
): { value: string; adjusted: boolean } => {
  const amount = parseSportsStake(raw)
  if (
    amount === null ||
    balance === null ||
    !Number.isFinite(balance) ||
    balance < 0 ||
    !Number.isFinite(otherStake) ||
    !Number.isInteger(combinationCount) ||
    combinationCount <= 0
  )
    return { value: raw, adjusted: false }
  // 扣除其他输入项，再按组合注数分配；不足一分的余额不计入。
  const availableCents = Math.max(
    0,
    Math.floor(balance * 100 + 0.000001) - Math.round(Math.max(0, otherStake) * 100)
  )
  const maximum = Math.floor(availableCents / combinationCount) / 100
  return amount > maximum
    ? { value: maximum.toFixed(2), adjusted: true }
    : { value: raw, adjusted: false }
}
