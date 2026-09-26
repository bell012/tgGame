import type { EventDetailTabItem } from './types'

export const EVENT_DETAIL_TAB_MOCK_ITEMS: EventDetailTabItem[] = [
  {
    id: 'west-ham-everton',
    competitionId: 0,
    league: 'Premier League',
    marketLines: [],
    home: { name: 'West Ham United', score: 2, teamId: 0 },
    away: { name: 'Everton', score: 3, teamId: 0 },
    rbTime: "29' 1st Half",
    isLive: true,
    homeRedCard: 0,
    awayRedCard: 0,
    homeYellowCard: 3,
    awayYellowCard: 3,
    homeCorners: 1,
    awayCorners: 1,
    isFavourite: false
  }
]
