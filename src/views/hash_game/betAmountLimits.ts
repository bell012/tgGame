import type { HashGameLotteryInfo } from '@/api/interface/hash_game.interface'

// 筹码根据接口设置最大筹码金额和最小筹码金额
function parseLimit(value: number | string | undefined) {
  if (typeof value === 'number' || (typeof value === 'string' && value.trim())) return Number(value)
  return NaN
}

export function getBetAmountLimitError(info: HashGameLotteryInfo | null, amount: number) {
  const minimum = parseLimit(info?.betAmountMin)
  if (Number.isFinite(minimum) && amount < minimum) {
    return { key: 'hashGame.minimumBetAmount', params: { amount: minimum } }
  }

  const maximum = parseLimit(info?.betAmountMax)
  if (Number.isFinite(maximum) && amount > maximum) {
    return { key: 'hashGame.maximumBetAmount', params: { amount: maximum } }
  }
}
