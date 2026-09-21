import type { MatchDetailsViewModel } from './types'

export const MATCH_DETAILS_MOCK: MatchDetailsViewModel = {
  region: 'International',
  league: 'AFC Champions League Elite',
  isLive: true,
  homeTeam: {
    name: 'West Ham United',
    stats: { redCards: 0, yellowCards: 3, corners: 1 }
  },
  awayTeam: {
    name: 'Everton',
    stats: { redCards: 0, yellowCards: 3, corners: 1 }
  },
  homeScore: 2,
  awayScore: 1,
  statusText: "29' 1st Half",
  periodScoreLabel: '1st Half 1:1'
}
