import type {
  SportMarketLine,
  SportWagerSelection,
  SportsResponseOddsType
} from '@/api/interface/sport'
import { hasFiniteOdds, shouldShowHandicap } from '@/views/sports/components/match-odds/display'
import type {
  DualColumnMarketCard,
  OneXTwoMarketCard,
  ScoreDetailsFilterTab,
  ScoreDetailsMarketCard
} from './types'

const LEFT_SELECTION_IDS = new Set([1, 3, 5])
const RIGHT_SELECTION_IDS = new Set([2, 4, 6, 7])

/** 赛事详情页底部 Odds Format 可选盘型（含美式 6）。 */
export type EventDetailsOddsFormat = 1 | 2 | 3 | 4 | 6

/** 按底部 Odds Format 从 OddsList 取对应 OddsType 的 OddsValues.A。 */
export const resolveOddsForFormat = (
  selection: SportWagerSelection,
  oddsFormat: EventDetailsOddsFormat
): string => {
  const match = (selection.OddsList ?? []).find(
    item => Number(item.OddsType) === (oddsFormat as SportsResponseOddsType)
  )
  const value = match?.OddsValues?.A
  return value !== undefined && value !== '' ? value : ''
}

const hasOddsForFormat = (selection: SportWagerSelection, oddsFormat: EventDetailsOddsFormat) =>
  resolveOddsForFormat(selection, oddsFormat) !== ''

const formatLine = (line: SportMarketLine, selection: SportWagerSelection) => {
  if (shouldShowHandicap(line, selection)) {
    return String(selection.Handicap)
  }
  return selection.SelectionName?.trim() ?? ''
}

const isOneXTwoLine = (line: SportMarketLine, selections: SportWagerSelection[]) =>
  line.BetTypeId === 3 ||
  (selections.length === 3 && selections.every(item => item.SelectionId >= 5))

const mapOneXTwo = (
  line: SportMarketLine,
  selections: SportWagerSelection[],
  oddsFormat: EventDetailsOddsFormat
): OneXTwoMarketCard => ({
  id: String(line.MarketlineId),
  kind: '1x2',
  title: line.BetTypeName,
  betTypeName: line.BetTypeName,
  options: selections.map(selection => ({
    label: selection.SelectionName,
    odds: resolveOddsForFormat(selection, oddsFormat),
    selection
  }))
})

const mapDualColumn = (
  line: SportMarketLine,
  selections: SportWagerSelection[],
  oddsFormat: EventDetailsOddsFormat
): DualColumnMarketCard => {
  const leftSelections = selections.filter(item => LEFT_SELECTION_IDS.has(item.SelectionId))
  const rightSelections = selections.filter(item => RIGHT_SELECTION_IDS.has(item.SelectionId))

  const leftPool = leftSelections.length ? leftSelections : selections.slice(0, 1)
  const rightPool = rightSelections.length
    ? rightSelections
    : selections.length > 1
      ? selections.slice(1)
      : []

  const leftHeader = leftPool[0]?.SelectionName ?? ''
  const rightHeader = rightPool[0]?.SelectionName ?? ''

  const rightByHandicap = new Map(
    rightPool.map(selection => [selection.Handicap, selection] as const)
  )

  const rows = leftPool.map((left, index) => {
    const right = rightByHandicap.get(left.Handicap) ?? rightPool[index] ?? rightPool[0]
    const emptyCell = { line: '', odds: '' as const, selection: undefined }
    return {
      left: {
        line: formatLine(line, left),
        odds: resolveOddsForFormat(left, oddsFormat),
        selection: left
      },
      right: right
        ? {
            line: formatLine(line, right),
            odds: resolveOddsForFormat(right, oddsFormat),
            selection: right
          }
        : emptyCell
    }
  })

  if (!rows.length && selections.length) {
    const [only] = selections
    rows.push({
      left: {
        line: formatLine(line, only),
        odds: resolveOddsForFormat(only, oddsFormat),
        selection: only
      },
      right: { line: '', odds: '', selection: undefined }
    })
  }

  return {
    id: String(line.MarketlineId),
    kind: 'dual-column',
    title: line.BetTypeName,
    betTypeName: line.BetTypeName,
    leftHeader,
    rightHeader,
    rows
  }
}

export const mapMarketLineToCard = (
  line: SportMarketLine,
  oddsFormat: EventDetailsOddsFormat = 1
): ScoreDetailsMarketCard | null => {
  if (!line || !Number.isSafeInteger(line.MarketlineId)) {
    return null
  }
  const selections = (line.WagerSelections ?? []).filter(
    item => hasOddsForFormat(item, oddsFormat) || hasFiniteOdds(item)
  )
  if (!selections.length) {
    return null
  }
  if (isOneXTwoLine(line, selections)) {
    return mapOneXTwo(line, selections, oddsFormat)
  }
  return mapDualColumn(line, selections, oddsFormat)
}

export const mapMarketLinesToCards = (
  lines: readonly SportMarketLine[],
  oddsFormat: EventDetailsOddsFormat = 1
): ScoreDetailsMarketCard[] =>
  (lines ?? []).flatMap(line => {
    const card = mapMarketLineToCard(line, oddsFormat)
    return card ? [card] : []
  })

export const buildScoreDetailsFilterTabs = (
  lines: readonly SportMarketLine[],
  allTabLabel = 'All'
): ScoreDetailsFilterTab[] => {
  const marketLines = lines ?? []
  const cards = mapMarketLinesToCards(marketLines)
  const countByBetType = new Map<string, number>()

  for (const card of cards) {
    countByBetType.set(card.betTypeName, (countByBetType.get(card.betTypeName) ?? 0) + 1)
  }

  const tabs: ScoreDetailsFilterTab[] = [{ key: 'all', label: allTabLabel, count: cards.length }]

  for (const [betTypeName, count] of countByBetType) {
    tabs.push({ key: betTypeName, label: betTypeName, count })
  }

  return tabs
}
