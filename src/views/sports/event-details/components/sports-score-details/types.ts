import type { SportWagerSelection } from '@/api/interface/sport'

/** `all` 表示全部玩法；其余 key 为字符串形式的 BetTypeId。 */
export type ScoreDetailsFilterKey = 'all' | (string & {})

export interface ScoreDetailsFilterTab {
  key: ScoreDetailsFilterKey
  label: string
  count: number
}

export interface ScoreDetailsMarketBase {
  betTypeName: string
}

export interface DualOddsCell {
  line: string
  odds: string
  selection?: SportWagerSelection
}

export interface DualColumnMarketCard extends ScoreDetailsMarketBase {
  id: string
  kind: 'dual-column'
  title: string
  leftHeader: string
  rightHeader: string
  rows: Array<{ left: DualOddsCell; right: DualOddsCell }>
  /** mock 数据筛选用，真实接口数据用 betTypeName。 */
  filters?: ScoreDetailsFilterKey[]
}

export interface OneXTwoOption {
  label: string
  odds: string
  selection?: SportWagerSelection
}

export interface OneXTwoMarketCard extends ScoreDetailsMarketBase {
  id: string
  kind: '1x2' | 'selection-grid'
  title: string
  options: OneXTwoOption[]
  filters?: ScoreDetailsFilterKey[]
}

export interface ScoreTeamRow {
  teamId: 'home' | 'away'
  name: string
  logo: string
}

export interface ScorePickerMarketCard extends ScoreDetailsMarketBase {
  id: string
  kind: 'score-picker'
  title: string
  teams: ScoreTeamRow[]
  line: string
  odds: string
  filters?: ScoreDetailsFilterKey[]
}

export type ScoreDetailsMarketCard =
  DualColumnMarketCard | OneXTwoMarketCard | ScorePickerMarketCard

/** 仅合并展示容器，组内盘口继续使用各自的 ID、选项和开关盘状态。 */
export interface ScoreDetailsMarketGroup {
  id: string
  betTypeId: number
  periodId: number
  title: string
  markets: ScoreDetailsMarketCard[]
}
