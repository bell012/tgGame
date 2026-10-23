interface OddsButtonState {
  selected: boolean
  unavailable: boolean
}

/** 只共享 PC 赔率按钮的状态配色，布局和业务判定由调用方保留。 */
export const pcOddsButtonTone = ({ selected, unavailable }: OddsButtonState): string => {
  if (unavailable) return 'bg-bg-3 text-text-1'
  if (selected) return 'bg-theme-primary text-text-4'
  return 'bg-bg-3 text-text-1 transition-colors lg:hover:bg-[var(--color-background-odds-hover-light)] dark:lg:hover:bg-bg-2'
}
