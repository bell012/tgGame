export type OddsTrend = 'up' | 'down' | null

export interface OddsOption {
  id: string
  label: string
  /** PC 大小盘：与 label 相距 8px 的盘口线（如 3.5） */
  line?: string
  odds: string | number
  selected?: boolean
  trend?: OddsTrend
}

export interface OddsMarket {
  id: string
  title: string
  options: OddsOption[]
}

export interface OddsSelectPayload {
  market: OddsMarket
  option: OddsOption
}
