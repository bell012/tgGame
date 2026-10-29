import type { SportsOddsType, SportWagerSelection } from '@/api/interface/sport'
import { decimalOdds } from '../components/bet-slip/bet-info'

export const ODDS_TYPES: readonly SportsOddsType[] = [3, 6, 2, 4, 1]
export const isSportsOddsType = (value: unknown): value is SportsOddsType =>
  typeof value === 'number' && ODDS_TYPES.includes(value as SportsOddsType)

/** 只接受有效的同盘型赔率，不以零或其他盘型填补缺失值。 */
export const readOdds = (value: unknown, type: number): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && !value.trim()) return null
  const odds = Number(value)
  return decimalOdds(odds, type) === null ? null : odds
}

export const resolveSelectionOdds = (
  selection: SportWagerSelection,
  type: SportsOddsType
): number | null => {
  const listed = selection.OddsList?.find(item => Number(item.OddsType) === type)
  const odds = readOdds(listed?.OddsValues?.A, type)
  if (odds !== null) return odds
  return Number(selection.OddsType) === type ? readOdds(selection.Odds, type) : null
}

/** 串关查询沿用原有欧洲盘换算；不能用于普通赛事卡片的显示兜底。 */
export const resolveParlayOdds = (selection: SportWagerSelection): number | null =>
  resolveSelectionOdds(selection, 3) ?? decimalOdds(selection.Odds, selection.OddsType)

export const formatOdds = (odds: number | null): string =>
  odds === null ? '' : String(Number(odds.toFixed(2)))
