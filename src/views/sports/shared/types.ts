import type { SportMarketLine, SportsEventMarket } from '@/api/interface/sport'
import type { OddsTrend } from '../components/match-odds/types'

export type SportsBetMode = 'single' | 'parlay'
export type SportsMatch = {
  id: string
  EventId: number
  sportId: number
  Market: SportsEventMarket
  /** 接口明确允许时才可加入串关。 */
  OpenParlay: boolean
  sportKey: string
  leagueId: string
  country?: string
  league: string
  kickoff: string
  homeScore: string
  awayScore: string
  cornerScore?: string
  halfTimeScore?: string
  periodScores?: string[]
  totalScore?: string
  home: { name: string; badge: string; redCards?: string; yellowCards?: string }
  away: { name: string; badge: string; redCards?: string; yellowCards?: string }
  live: boolean
  phase: string
  phaseClock?: {
    period: string
    seconds: number
    running: boolean
    receivedAt: number
  }
  hasVideo: boolean
  hasAnimation: boolean
  totalMarkets?: number
  /** 赛事自身的收藏状态，独立于列表的收藏置顶查询条件。 */
  IsFavourite: boolean
  HomeTeam: string
  AwayTeam: string
  HomeScore: string
  AwayScore: string
  HomeTeamId: number
  AwayTeamId: number
  MarketLines: SportMarketLine[]
}
export type SportsBetSelection = {
  id: string
  matchId: string
  selection: string
  market: string
  marketTitle: string
  fixture: string
  homeTeam: string
  awayTeam: string
  league: string
  odds: number
  stake: string
  trend?: OddsTrend
  live?: boolean
  mockBetStatus?: 'open' | 'closed' | 'fail'
  betStatus?: 'idle' | 'pending' | 'open' | 'closed' | 'unavailable' | 'error'
  oddsType?: number
  minStake?: number
  maxStake?: number
  payoutPerUnit?: number
  stakeError?: string
  limitText?: string
}
export type SportsParlay = {
  id: string
  size: number
  combinationCount: number
  odds?: number
  stake: string
  label?: string
  comboSelection?: number
  minStake?: number
  maxStake?: number
  payoutPerUnit?: number
  stakeError?: string
  limitText?: string
}
