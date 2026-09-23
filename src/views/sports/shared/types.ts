import type { SportMarketLine } from '@/api/interface/sport'
import type { OddsTrend } from '../components/match-odds/types'

export type SportsBetMode = 'single' | 'parlay'
export type SportsMatch = {
  id: string
  EventId: number
  sportId: number
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
}
export type SportsParlay = {
  id: string
  size: number
  combinationCount: number
  odds: number
  stake: string
}
