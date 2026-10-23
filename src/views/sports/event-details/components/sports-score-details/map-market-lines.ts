import type { SportMarketLine, SportWagerSelection, SportsOddsType } from '@/api/interface/sport'
import { hasDisplayableCardOdds } from '@/views/sports/components/match-odds/display'
import type {
  DualColumnMarketCard,
  OneXTwoMarketCard,
  ScoreDetailsFilterTab,
  ScoreDetailsMarketCard,
  ScoreDetailsMarketGroup
} from './types'

import { formatOdds, resolveSelectionOdds } from '../../../shared/odds'
import {
  formatMarketName,
  formatSelectionName,
  type SelectionTeams
} from '../../../shared/selection-name'

/** 赛事详情页底部 Odds Format 可选盘型（含美式 6）。 */
export type EventDetailsOddsFormat = SportsOddsType

/** 按底部 Odds Format 从 OddsList 取对应 OddsType 的 OddsValues.A。 */
export const resolveOddsForFormat = (
  selection: SportWagerSelection,
  oddsFormat: EventDetailsOddsFormat
): string => {
  return formatOdds(resolveSelectionOdds(selection, oddsFormat))
}

const hasOddsForFormat = (selection: SportWagerSelection, oddsFormat: EventDetailsOddsFormat) =>
  resolveOddsForFormat(selection, oddsFormat) !== ''

const isOneXTwoLine = (line: SportMarketLine) => line.BetTypeId === 3 || line.BetTypeId === 35

const mapOneXTwo = (
  line: SportMarketLine,
  selections: SportWagerSelection[],
  oddsFormat: EventDetailsOddsFormat,
  teams: SelectionTeams
): OneXTwoMarketCard => ({
  id: String(line.MarketlineId),
  kind: '1x2',
  title: formatMarketName(line, teams),
  betTypeName: line.BetTypeName,
  options: selections.map(selection => ({
    label: formatSelectionName(line, selection, teams) ?? '',
    odds: resolveOddsForFormat(selection, oddsFormat),
    selection
  }))
})

const mapDualColumn = (
  line: SportMarketLine,
  selections: SportWagerSelection[],
  oddsFormat: EventDetailsOddsFormat,
  teams: SelectionTeams
): DualColumnMarketCard => {
  const cells = selections.map(selection => ({
    line: formatSelectionName(line, selection, teams) ?? '',
    odds: resolveOddsForFormat(selection, oddsFormat),
    selection
  }))
  const rows: DualColumnMarketCard['rows'] = []
  // 按接口顺序逐项展示，不按 Handicap 合并；同盘口值可以对应多个不同投注选项。
  for (let index = 0; index < cells.length; index += 2) {
    rows.push({ left: cells[index], right: cells[index + 1] ?? { line: '', odds: '' } })
  }

  return {
    id: String(line.MarketlineId),
    kind: 'dual-column',
    title: formatMarketName(line, teams),
    betTypeName: line.BetTypeName,
    leftHeader: '',
    rightHeader: '',
    rows
  }
}

export const mapMarketLineToCard = (
  line: SportMarketLine,
  oddsFormat: EventDetailsOddsFormat = 3,
  teams: SelectionTeams = {}
): ScoreDetailsMarketCard | null => {
  if (!line || !Number.isSafeInteger(line.MarketlineId)) {
    return null
  }
  const selections = (line.WagerSelections ?? []).filter(
    item => hasOddsForFormat(item, oddsFormat) || hasDisplayableCardOdds(item)
  )
  if (!selections.length) {
    return null
  }
  if (isOneXTwoLine(line)) {
    return mapOneXTwo(line, selections, oddsFormat, teams)
  }
  return mapDualColumn(line, selections, oddsFormat, teams)
}

export const mapMarketLinesToCards = (
  lines: readonly SportMarketLine[],
  oddsFormat: EventDetailsOddsFormat = 3,
  teams: SelectionTeams = {}
): ScoreDetailsMarketCard[] =>
  (lines ?? []).flatMap(line => {
    const card = mapMarketLineToCard(line, oddsFormat, teams)
    return card ? [card] : []
  })

/** 按玩法和时段合并展示容器，各级别的原盘口保持独立。 */
export const mapMarketLinesToGroups = (
  lines: readonly SportMarketLine[],
  oddsFormat: EventDetailsOddsFormat = 3,
  teams: SelectionTeams = {}
): ScoreDetailsMarketGroup[] => {
  const groups = new Map<string, ScoreDetailsMarketGroup>()
  for (const line of lines) {
    const card = mapMarketLineToCard(line, oddsFormat, teams)
    if (!card) continue
    const id = `${line.BetTypeId}:${line.PeriodId}`
    const group = groups.get(id)
    if (group) {
      group.markets.push(card)
    } else {
      groups.set(id, {
        id,
        betTypeId: line.BetTypeId,
        periodId: line.PeriodId,
        title: card.title,
        markets: [card]
      })
    }
  }
  return [...groups.values()]
}

export const buildScoreDetailsFilterTabs = (
  lines: readonly SportMarketLine[],
  allTabLabel = 'All',
  oddsFormat: EventDetailsOddsFormat = 3,
  teams: SelectionTeams = {}
): ScoreDetailsFilterTab[] => {
  const groups = mapMarketLinesToGroups(lines, oddsFormat, teams)
  const tabsByBetType = new Map<number, ScoreDetailsFilterTab>()
  for (const group of groups) {
    const tab = tabsByBetType.get(group.betTypeId)
    if (tab) {
      tab.count += 1
    } else {
      // 优先使用同玩法全场盘口的原始名称，不自行猜测或截去名称中的阶段信息。
      const labelLine = lines.find(
        line => line.BetTypeId === group.betTypeId && line.PeriodId === 1
      )
      tabsByBetType.set(group.betTypeId, {
        key: String(group.betTypeId),
        label: labelLine?.BetTypeName ?? group.markets[0].betTypeName,
        count: 1
      })
    }
  }
  return [{ key: 'all', label: allTabLabel, count: groups.length }, ...tabsByBetType.values()]
}
