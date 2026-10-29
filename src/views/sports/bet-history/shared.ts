import type { SportsBetHistoryWager, SportsBetHistoryWagerSelection } from '@/api/interface/sport'
import { formatUsDateTime12h } from '@/utils/date'
import { readOdds, isSportsOddsType } from '../shared/odds'
import { findSportItemBySportId, sportItems } from '../components/sports-navigation/sport-items'

type Translate = (key: string, values?: Record<string, string | number>) => string
export type HistoryResult =
  | 'win'
  | 'loss'
  | 'draw'
  | 'halfWin'
  | 'halfLoss'
  | 'partialLoss'
  | 'eventCancelled'
  | 'betCancelled'

/** 区分接口缺值与真实零值，缺值不生成虚假的金额或比分。 */
export const historyNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && !value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const historyAmount = (value: unknown, signed = false) => {
  const amount = historyNumber(value)
  return amount === null ? '--' : `${signed && amount > 0 ? '+' : ''}${amount.toFixed(2)}`
}

export const isHistorySettled = (wager: SportsBetHistoryWager) => wager.bss === 1

/** 已兑现不是取消；有效结算结果优先于投注项取消标志。 */
export const isHistoryCancelled = (wager: SportsBetHistoryWager) => {
  if (wager.bts === 1) return false
  if (wager.bcs === 3 || wager.bcs === 4) return true
  if (isHistorySettled(wager) && wager.ou != null) return false
  if (isHistorySettled(wager) && (historyNumber(wager.mwla) ?? 0) !== 0) return false
  const items = wager.wil ?? []
  return (
    items.length > 0 &&
    items.every(item => [2, 3].includes(item.waict) || [3, 4].includes(item.waics))
  )
}

const outcomeResult = (outcome: number | undefined): HistoryResult | undefined => {
  const results: Record<number, HistoryResult> = {
    1: 'win',
    2: 'loss',
    3: 'draw',
    4: 'halfWin',
    5: 'halfLoss',
    6: 'partialLoss'
  }
  return outcome === undefined ? undefined : results[outcome]
}

export const historyResult = (wager: SportsBetHistoryWager): HistoryResult => {
  if (isHistoryCancelled(wager))
    return wager.wil?.some(item => item.waict === 3) ? 'eventCancelled' : 'betCancelled'
  return (
    outcomeResult(wager.ou) ??
    ((historyNumber(wager.mwla) ?? 0) === 0 ? 'draw' : Number(wager.mwla) < 0 ? 'loss' : 'win')
  )
}

export const resultTextClass = (result: HistoryResult, pc = false) => {
  if (result === 'win' || result === 'halfWin') return 'text-secondary-2'
  if (result === 'loss' || result === 'halfLoss' || result === 'partialLoss')
    return 'text-theme-primary'
  if (result === 'draw') return pc ? 'text-secondary-6' : 'text-secondary-7'
  return 'text-text-2'
}

export const resultBadgeClass = (result: HistoryResult) => {
  if (result === 'win' || result === 'halfWin') return 'bg-secondary-1 text-secondary-2'
  if (result === 'loss' || result === 'halfLoss' || result === 'partialLoss')
    return 'bg-theme-3 text-theme-primary'
  if (result === 'draw') return 'bg-secondary-9 text-secondary-7'
  return 'bg-opacity-10 text-text-2'
}

/** 入口和提交共用资格校验；报价为零仍可能有效，缺值或负值不可提交。 */
export const canCashOut = (wager: SportsBetHistoryWager) =>
  wager.bss === 0 &&
  wager.cas === true &&
  ![1, 2].includes(wager.bts) &&
  !isHistoryCancelled(wager) &&
  historyNumber(wager.bbp) !== null &&
  Number(wager.bbp) >= 0 &&
  wager.prid != null &&
  String(wager.prid).trim().length > 0

export const historyComboLabel = (wager: SportsBetHistoryWager, t: Translate) => {
  const combo = wager.combs
  const label =
    combo >= 9 && combo <= 17
      ? t('sports.betSlip.fold', { count: combo - 7 })
      : combo >= 1 && combo <= 8
        ? t(`sports.betSlip.systems.${combo}`)
        : combo === 18
          ? t('sports.betSlip.fold', { count: wager.wil?.length ?? 0 })
          : t('sports.betSlip.combo', { count: combo })
  return label
}

const scoreText = (home: unknown, away: unknown) => {
  const h = historyNumber(home)
  const a = historyNumber(away)
  return h === null || a === null ? '--' : `${h}-${a}`
}

export const mapHistorySelection = (
  item: SportsBetHistoryWagerSelection,
  wager: SportsBetHistoryWager,
  t: Translate
) => {
  const cancelled = [2, 3].includes(item.waict) || [3, 4].includes(item.waics)
  const result = isHistorySettled(wager) ? outcomeResult(item.wio) : undefined
  const status = cancelled
    ? item.waics === 3
      ? 'rejected'
      : 'cancelled'
    : (result ?? (item.waics === 2 ? 'confirmed' : 'pending'))
  const odds = readOdds(item.o, wager.ot)
  return {
    id: `${item.eid}:${item.mlid}:${item.btsid}:${item.sen}`,
    matchName:
      item.htn || item.atn
        ? `${item.htn || '--'} VS ${item.atn || '--'}`
        : item.eon || item.en || '--',
    leagueName: item.cn || '--',
    eventTime: formatUsDateTime12h(item.edt),
    marketName: item.btn || '--',
    selectionName: item.sen || item.otn || '--',
    handicapText: item.dih ? `(${item.dih})` : '',
    oddsText: odds === null ? '@ --' : `@ ${odds.toFixed(2)}`,
    live: item.m === 3,
    statusLabel: t(`sportsHistory.${status}`),
    statusClass: cancelled
      ? 'text-secondary-2'
      : result
        ? resultTextClass(result)
        : item.waics === 2
          ? 'text-theme-primary'
          : 'text-text-2',
    halfScore: scoreText(item.hthts, item.athts),
    fullScore: scoreText(item.htfts, item.atfts)
  }
}

/** PC、H5 列表和详情共用金额与状态映射；已兑现也只取 mwla。 */
export const mapHistoryWager = (wager: SportsBetHistoryWager, currency: string, t: Translate) => {
  const settled = isHistorySettled(wager)
  const result = historyResult(wager)
  const parlay = wager.wat === 2
  const selections = (wager.wil ?? []).map(item => mapHistorySelection(item, wager, t))
  return {
    id: String(wager.wid),
    raw: wager,
    settled,
    parlay,
    result,
    selections,
    currency,
    sportIcon: findSportItemBySportId(wager.wil?.[0]?.sid)?.icon ?? sportItems[0]?.icon,
    title: t(parlay ? 'sportsHistory.comboBet' : 'sportsHistory.singleBet'),
    matchName: parlay ? historyComboLabel(wager, t) : (selections[0]?.matchName ?? '--'),
    comboLabel: historyComboLabel(wager, t),
    statusLabel: t(
      settled ? 'betHistory.filterOptions.settled' : 'betHistory.filterOptions.unsettled'
    ),
    transactionLabel:
      wager.bts === 1
        ? t('sportsHistory.cashedOut')
        : wager.bts === 2
          ? t('sportsHistory.processing')
          : '',
    resultLabel: t(`sportsHistory.${result}`),
    amountClass: settled ? resultTextClass(result) : 'text-text-1',
    pcResultClass: resultTextClass(result, true),
    statusBadgeClass: resultBadgeClass(result),
    detailStatusBadgeClass: !settled
      ? 'bg-secondary-7 text-common-100'
      : result === 'win' || result === 'halfWin'
        ? 'bg-secondary-2 text-common-100'
        : result === 'loss' || result === 'halfLoss' || result === 'partialLoss'
          ? 'bg-theme-primary text-text-4'
          : 'bg-opacity-10 text-text-2',
    betAmount: historyAmount(wager.isa),
    resultAmount: historyAmount(settled ? wager.mwla : wager.pp, settled),
    totalOdds: historyNumber(wager.coo) === null ? '--' : Number(wager.coo).toFixed(2),
    orderNo: String(wager.wid),
    createdAt: formatUsDateTime12h(wager.wcdt),
    oddsTypeLabel: isSportsOddsType(wager.ot) ? t('sports.betOddsType' + wager.ot) : '--',
    cashOutAvailable: canCashOut(wager)
  }
}

export type HistoryWagerView = ReturnType<typeof mapHistoryWager>
export type HistorySelectionView = ReturnType<typeof mapHistorySelection>
