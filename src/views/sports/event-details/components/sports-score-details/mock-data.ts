import type { ScoreDetailsFilterTab, ScoreDetailsMarketCard } from './types'
import homeLogo from '../match-details/icon/team1.svg?url'
import awayLogo from '../match-details/icon/team2.svg?url'

const dualRows = (extra = 0) => {
  const rows = [
    { left: { line: '2.5', odds: '-0.667' }, right: { line: '2.5', odds: '0.45' } },
    { left: { line: '2.5', odds: '-0.667' }, right: { line: '2.5', odds: '0.45' } },
    { left: { line: '2.5', odds: '-0.667' }, right: { line: '2.5', odds: '0.45' } }
  ]
  for (let index = 0; index < extra; index += 1) {
    rows.push({
      left: { line: '3.5', odds: '-0.512' },
      right: { line: '3.5', odds: '0.38' }
    })
  }
  return rows
}

export const SCORE_DETAILS_FILTER_TABS: ScoreDetailsFilterTab[] = [
  { key: 'all', label: 'All', count: 18 },
  { key: 'popular', label: 'Popular', count: 13 },
  { key: 'handicap-totals', label: 'Handicap & Totals', count: 6 },
  { key: 'correct-score', label: 'Correct Score', count: 4 },
  { key: 'goals', label: 'Goals', count: 0 },
  { key: 'corners', label: 'Corners', count: 0 },
  { key: 'first-half', label: '1st Half', count: 0 }
]

export const SCORE_DETAILS_MARKETS: ScoreDetailsMarketCard[] = [
  {
    id: 'handicap',
    kind: 'dual-column',
    title: 'Handicap',
    leftHeader: 'West Ham United',
    rightHeader: 'Everton',
    rows: dualRows(2),
    filters: ['all', 'popular', 'handicap-totals']
  },
  {
    id: '1x2',
    kind: '1x2',
    title: '1X2',
    options: [
      { label: 'Home', odds: '1.96' },
      { label: 'Draw', odds: '1.96' },
      { label: 'Away', odds: '1.96' }
    ],
    filters: ['all', 'popular']
  },
  {
    id: 'over-under',
    kind: 'dual-column',
    title: 'Over/Under',
    leftHeader: 'Over',
    rightHeader: 'Under',
    rows: dualRows(),
    filters: ['all', 'popular', 'handicap-totals', 'goals']
  },
  {
    id: 'correct-score',
    kind: 'score-picker',
    title: 'Correct Score',
    teams: [
      { teamId: 'home', name: 'West Ham United', logo: homeLogo },
      { teamId: 'away', name: 'Everton', logo: awayLogo }
    ],
    line: '0.5',
    odds: '1.43',
    filters: ['all', 'popular', 'correct-score']
  },
  {
    id: 'odd-even',
    kind: 'dual-column',
    title: 'Odd/Even',
    leftHeader: 'Odd',
    rightHeader: 'Even',
    rows: dualRows(),
    filters: ['all', 'popular']
  },
  {
    id: 'incorrect-score',
    kind: 'score-picker',
    title: 'Incorrect Score',
    teams: [
      { teamId: 'home', name: 'West Ham United', logo: homeLogo },
      { teamId: 'away', name: 'Everton', logo: awayLogo }
    ],
    line: '0.5',
    odds: '1.43',
    filters: ['all', 'correct-score']
  },
  {
    id: 'west-ham-total',
    kind: 'dual-column',
    title: 'West Ham United Total',
    leftHeader: 'Over',
    rightHeader: 'Under',
    rows: dualRows(),
    filters: ['all', 'handicap-totals', 'goals']
  },
  {
    id: 'everton-total',
    kind: 'dual-column',
    title: 'Everton Total',
    leftHeader: 'Over',
    rightHeader: 'Under',
    rows: dualRows(),
    filters: ['all', 'handicap-totals', 'goals']
  }
]
