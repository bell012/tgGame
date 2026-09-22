export interface MatchTeamStats {
  redCards: number
  yellowCards: number
  corners: number
}

export interface MatchTeamInfo {
  name: string
  logo?: string
  stats: MatchTeamStats
}

export interface MatchDetailsViewModel {
  region: string
  league: string
  homeTeam: MatchTeamInfo
  awayTeam: MatchTeamInfo
  homeScore: number | string
  awayScore: number | string
  statusText: string
  periodScoreLabel: string
  isLive: boolean
}
