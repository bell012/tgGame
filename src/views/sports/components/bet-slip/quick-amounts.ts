import { parseSportsStake } from './shared'

export const DEFAULT_QUICK_AMOUNTS: readonly number[] = [20, 50, 100, 200, 500, 1000]
export const QUICK_AMOUNT_COUNT = DEFAULT_QUICK_AMOUNTS.length

export const isValidQuickAmounts = (value: unknown): value is number[] =>
  Array.isArray(value) &&
  value.length === QUICK_AMOUNT_COUNT &&
  value.every(
    amount =>
      typeof amount === 'number' && amount > 0 && parseSportsStake(String(amount)) === amount
  ) &&
  new Set(value).size === QUICK_AMOUNT_COUNT
