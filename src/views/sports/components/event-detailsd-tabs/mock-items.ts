import type { EventDetailTabItem } from './types'

export const EVENT_DETAIL_TAB_MOCK_ITEMS: EventDetailTabItem[] = [
  {
    id: 'west-ham-everton',
    home: { name: 'West Ham United', score: 2 },
    away: { name: 'Everton', score: 3 },
    status: { kind: 'live', minute: "29'", period: '1st Half' }
  },
  {
    id: 'rasistai-sisaket',
    home: { name: 'Rasistai United', score: 0 },
    away: { name: 'Sisaket United FC', score: 0 },
    status: { kind: 'half_time' }
  },
  {
    id: 'real-madrid-man-utd-finished',
    home: { name: 'Real Madrid', score: 0 },
    away: { name: 'Manchester United', score: 0 },
    status: { kind: 'finished' }
  },
  {
    id: 'elche-real-madrid',
    home: { name: 'Elche', score: 3 },
    away: { name: 'Real Madrid', score: 1 },
    status: { kind: 'live', minute: "86'", period: '2nd Half' }
  },
  {
    id: 'real-madrid-man-utd-scheduled',
    home: { name: 'Real Madrid', score: 0 },
    away: { name: 'Manchester United', score: 0 },
    status: { kind: 'scheduled', primary: '28/09 19:30' }
  },
  {
    id: 'tomorrow-fixture',
    home: { name: 'Real Madrid', score: 0 },
    away: { name: 'Manchester United', score: 0 },
    status: { kind: 'scheduled', primary: 'Tomorrow', secondary: '03:30' }
  },
  {
    id: 'format-fixture',
    home: { name: 'Real Madrid', score: 0 },
    away: { name: 'Manchester United', score: 0 },
    status: { kind: 'scheduled', primary: '2 x 45' }
  }
]
