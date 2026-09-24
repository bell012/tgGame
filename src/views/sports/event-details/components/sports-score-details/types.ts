/** `all` 表示全部玩法；其余 key 为接口 BetTypeName。 */
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
}

export interface OneXTwoMarketCard extends ScoreDetailsMarketBase {
  id: string
  kind: '1x2'
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
  | DualColumnMarketCard
  | OneXTwoMarketCard
  | ScorePickerMarketCard
