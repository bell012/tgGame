export interface ChipOrigin {
  amount: number
  x: number
  y: number
  size: number
  filter?: string
}

/** 缩写较大的筹码面额，保持选筹码与投注区的文案一致。 */
export function formatChipAmount(amount: number) {
  if (amount >= 1000000) return `${Number((amount / 1000000).toFixed(1))}M`
  if (amount >= 10000) return `${Number((amount / 1000).toFixed(1))}K`
  return String(amount)
}
