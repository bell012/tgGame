export type ScoreDetailsFilterKey =
  | 'all'
  | 'popular'
  | 'handicap-totals'
  | 'correct-score'
  | 'goals'
  | 'corners'
  | 'first-half'

export interface ScoreDetailsFilterTab {
  key: ScoreDetailsFilterKey
  label: string
  count: number
}

export interface DualOddsCell {
  line: string
  odds: string
}

export interface DualColumnMarketCard {
  id: string
  kind: 'dual-column'
  title: string
  leftHeader: string
  rightHeader: string
  rows: Array<{ left: DualOddsCell; right: DualOddsCell }>
  filters: ScoreDetailsFilterKey[]
}

export interface OneXTwoOption {
  label: string
  odds: string
}

export interface OneXTwoMarketCard {
  id: string
  kind: '1x2'
  title: string
  options: OneXTwoOption[]
  filters: ScoreDetailsFilterKey[]
}

export interface ScoreTeamRow {
  teamId: 'home' | 'away'
  name: string
  logo: string
}

export interface ScorePickerMarketCard {
  id: string
  kind: 'score-picker'
  title: string
  teams: ScoreTeamRow[]
  line: string
  odds: string
  filters: ScoreDetailsFilterKey[]
}

export type ScoreDetailsMarketCard =
  | DualColumnMarketCard
  | OneXTwoMarketCard
  | ScorePickerMarketCard
