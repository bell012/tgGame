import type { SportMarketLine, SportWagerSelection } from '@/api/interface/sport'

export type { SportMarketLine, SportWagerSelection }

export type OddsTrend = 'up' | 'down' | null

export interface OddsSelectPayload {
  market: SportMarketLine
  option: SportWagerSelection
}
