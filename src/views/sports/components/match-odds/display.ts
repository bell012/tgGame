import type { SportMarketLine, SportWagerSelection } from '@/api/interface/sport'
import { decimalOdds } from '../bet-slip/bet-info'

/** PC 优先独赢 → 让球 → 大小，其余玩法按接口顺序补齐。 */
const HOME_BET_TYPE_ORDER = [3, 1, 2] as const
/** H5 优先让球 → 大小 → 独赢，其余玩法按接口顺序补齐。 */
const H5_LIST_BET_TYPE_ORDER = [1, 2, 3] as const
/** 热门条优先展示的大小盘。 */
const OVER_UNDER_BET_TYPE_ID = 2

/** 卡片每种盘口最多三项：PC 横排三列，H5 列表竖排三行。 */
export const MAX_CARD_SELECTIONS = 3

export const hasFiniteOdds = (selection: SportWagerSelection) => Number.isFinite(selection.Odds)

/** 仅转换卡片显示值，保留原始 Odds / OddsType 供投注流程使用。 */
export const formatEuropeanOdds = (
  selection: Pick<SportWagerSelection, 'Odds' | 'OddsType'>
): string => {
  const { Odds: odds, OddsType: type } = selection
  if (!Number.isFinite(odds)) return ''

  let converted = odds
  if (type === 6) {
    const europeanOdds = decimalOdds(odds, type)
    if (europeanOdds === null) return ''
    converted = europeanOdds
  } else if (type !== 3) {
    if (odds > 0) converted = odds + 1
    else if ((type === 1 || type === 4) && odds !== 0) converted = 1 - 1 / odds
  }
  // 最多两位小数，避免除法尾数；不强制补零，沿用卡片原有数字展示方式。
  return Number.isFinite(converted) ? String(Number(converted.toFixed(2))) : ''
}

/** 卡片按转换后的显示值筛选，不改变详情页对原始赔率的校验。 */
export const hasDisplayableCardOdds = (selection: SportWagerSelection) =>
  formatEuropeanOdds(selection) !== ''

const isDisplayableLine = (line: SportMarketLine) =>
  Number.isSafeInteger(line.MarketlineId) &&
  Array.isArray(line.WagerSelections) &&
  line.WagerSelections.some(hasDisplayableCardOdds)

/** 列表在没有有效赔率时仍保留锁盘盘口，用来画锁图标。 */
const isOpenOrLockedLine = (line: SportMarketLine) =>
  isDisplayableLine(line) || (line.IsLocked === true && Number.isSafeInteger(line.MarketlineId))

const compareHomepageCandidates = (left: SportMarketLine, right: SportMarketLine) => {
  const leftFullTime = left.PeriodId === 1 ? 0 : 1
  const rightFullTime = right.PeriodId === 1 ? 0 : 1
  if (leftFullTime !== rightFullTime) return leftFullTime - rightFullTime

  const leftOpen = left.MarketlineStatusId === 1 && !left.IsLocked ? 0 : 1
  const rightOpen = right.MarketlineStatusId === 1 && !right.IsLocked ? 0 : 1
  if (leftOpen !== rightOpen) return leftOpen - rightOpen

  return left.MarketLineLevel - right.MarketLineLevel
}

const pickPreferredLine = (candidates: readonly SportMarketLine[]) =>
  [...candidates].sort(compareHomepageCandidates)[0]

/** 独赢不展示盘口线；让球/大小保留包括 0 在内的 Handicap。 */
export const shouldShowHandicap = (line: SportMarketLine, selection: SportWagerSelection) =>
  line.BetTypeId !== 3 && Number.isFinite(selection.Handicap)

const formatHandicapPart = (abs: number, negative: boolean) => {
  if (abs === 0) return '0'
  const text = String(Math.round(abs * 100) / 100)
  return negative ? `-${text}` : text
}

/** 四分盘拆成相邻两档，如 0.25 → 0/0.5、-0.75 → -0.5/-1。半球和整数保持原样。 */
export const formatHandicap = (value: number) => {
  if (!Number.isFinite(value)) return ''
  const quarters = Math.round(value * 4)
  const negative = quarters < 0
  const absQuarters = Math.abs(quarters)
  if (absQuarters % 2 === 1) {
    const low = (absQuarters - 1) / 4
    const high = (absQuarters + 1) / 4
    return `${formatHandicapPart(low, negative)}/${formatHandicapPart(high, negative)}`
  }
  return formatHandicapPart(absQuarters / 4, negative)
}

/** 让球 1 主 / 2 客，大小 3 大 / 4 小，独赢 5 主 / 6 客 / 7 和。 */
const SELECTION_LETTER_KEY: Record<number, string> = {
  1: 'sports.oddsHome',
  2: 'sports.oddsAway',
  3: 'sports.oddsOver',
  4: 'sports.oddsUnder',
  5: 'sports.oddsHome',
  6: 'sports.oddsAway',
  7: 'sports.oddsDraw'
}

export const selectionLetterKey = (selection: SportWagerSelection) =>
  SELECTION_LETTER_KEY[selection.SelectionId]

export const isWagerSelected = (
  selection: SportWagerSelection,
  selectedWagerSelectionId?: number | string
) =>
  selectedWagerSelectionId !== undefined &&
  selectedWagerSelectionId !== '' &&
  Number(selectedWagerSelectionId) === selection.WagerSelectionId

const pickMarketLinesByOrder = (
  lines: readonly SportMarketLine[],
  betTypeIds: readonly number[],
  acceptLine: (line: SportMarketLine) => boolean = isDisplayableLine
): SportMarketLine[] => {
  if (!Array.isArray(lines) || !lines.length) return []

  const candidatesByType = new Map<number, SportMarketLine[]>()
  for (const line of lines) {
    if (!acceptLine(line)) continue
    const candidates = candidatesByType.get(line.BetTypeId) ?? []
    candidates.push(line)
    candidatesByType.set(line.BetTypeId, candidates)
  }
  const orderedTypes = new Set([...betTypeIds, ...candidatesByType.keys()])
  const picked: SportMarketLine[] = []
  for (const betTypeId of orderedTypes) {
    const candidates = candidatesByType.get(betTypeId)
    if (!candidates?.length) continue

    const preferred = pickPreferredLine(candidates)
    if (preferred) picked.push(preferred)
    if (picked.length === 3) break
  }
  return picked
}

/** 只挑出卡片要展示的原盘口引用，不生成新 DTO、不改字段名。锁盘盘口即使没有赔率也保留。 */
export const pickHomepageMarketLines = (lines: readonly SportMarketLine[]): SportMarketLine[] =>
  pickMarketLinesByOrder(lines, HOME_BET_TYPE_ORDER, isOpenOrLockedLine)

/** H5 最多展示三种玩法，缺玩法不补空列。锁盘盘口即使没有赔率也保留。 */
export const pickH5ListMarketLines = (lines: readonly SportMarketLine[]): SportMarketLine[] =>
  pickMarketLinesByOrder(lines, H5_LIST_BET_TYPE_ORDER, isOpenOrLockedLine)

/** 热门条只展示一条：优先大小，没有则退回列表第一条可展示盘口。 */
export const pickOverUnderOrFirstMarketLine = (
  lines: readonly SportMarketLine[]
): SportMarketLine[] => {
  if (!Array.isArray(lines) || !lines.length) return []

  const overUnder = lines.filter(
    line => line.BetTypeId === OVER_UNDER_BET_TYPE_ID && isDisplayableLine(line)
  )
  const preferred = overUnder.length ? pickPreferredLine(overUnder) : lines.find(isDisplayableLine)
  return preferred ? [preferred] : []
}
