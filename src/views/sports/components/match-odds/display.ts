import type { SportMarketLine, SportWagerSelection } from '@/api/interface/sport'

/** 首页卡片展示顺序：独赢 → 让球 → 大小，不改盘口对象本身。 */
const HOME_BET_TYPE_ORDER = [3, 1, 2] as const

export const hasFiniteOdds = (selection: SportWagerSelection) => Number.isFinite(selection.Odds)

/** 独赢不展示盘口线；让球/大小保留包括 0 在内的 Handicap。 */
export const shouldShowHandicap = (line: SportMarketLine, selection: SportWagerSelection) =>
  line.BetTypeId !== 3 && Number.isFinite(selection.Handicap)

export const isWagerSelected = (
  selection: SportWagerSelection,
  selectedWagerSelectionId?: number | string
) =>
  selectedWagerSelectionId !== undefined &&
  selectedWagerSelectionId !== '' &&
  Number(selectedWagerSelectionId) === selection.WagerSelectionId

/** 只挑出卡片要展示的原盘口引用，不生成新 DTO、不改字段名。 */
export const pickHomepageMarketLines = (lines: readonly SportMarketLine[]): SportMarketLine[] => {
  if (!Array.isArray(lines) || !lines.length) return []

  const picked: SportMarketLine[] = []
  for (const betTypeId of HOME_BET_TYPE_ORDER) {
    const candidates = lines.filter(
      line =>
        line.BetTypeId === betTypeId &&
        Number.isSafeInteger(line.MarketlineId) &&
        Array.isArray(line.WagerSelections) &&
        line.WagerSelections.some(hasFiniteOdds)
    )
    if (!candidates.length) continue

    const preferred = [...candidates].sort((left, right) => {
      const leftFullTime = left.PeriodId === 1 ? 0 : 1
      const rightFullTime = right.PeriodId === 1 ? 0 : 1
      if (leftFullTime !== rightFullTime) return leftFullTime - rightFullTime

      const leftOpen = left.MarketlineStatusId === 1 && !left.IsLocked ? 0 : 1
      const rightOpen = right.MarketlineStatusId === 1 && !right.IsLocked ? 0 : 1
      if (leftOpen !== rightOpen) return leftOpen - rightOpen

      return left.MarketLineLevel - right.MarketLineLevel
    })[0]

    if (preferred) picked.push(preferred)
  }
  return picked
}
