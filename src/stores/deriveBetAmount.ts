/**
 * 投注金额 = winAmount / multiple（保留两位小数）。
 */
export function deriveBetAmountFromWinAndMultiplier(
  winAmount: string | number | undefined,
  multiple: string | number | undefined
): string | null {
  const win = Number(
    String(winAmount ?? '')
      .replace(/,/g, '')
      .trim()
  )
  const mult = Number(
    String(multiple ?? '')
      .replace(/x$/i, '')
      .replace(/,/g, '')
      .trim()
  )
  if (!Number.isFinite(win) || !Number.isFinite(mult) || mult === 0) {
    return null
  }
  const quotient = win / mult
  if (!Number.isFinite(quotient)) {
    return null
  }
  return quotient.toFixed(2)
}
