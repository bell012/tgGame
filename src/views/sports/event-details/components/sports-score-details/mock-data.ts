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

const handicapRows = (extra = 0) => {
  const rows = [
    { left: { line: '0', odds: '1.96' }, right: { line: '0', odds: '1.96' } },
    { left: { line: '0', odds: '1.96' }, right: { line: '0', odds: '1.96' } }
  ]
  for (let index = 0; index < extra; index += 1) {
    rows.push({
      left: { line: '0.5', odds: '1.82' },
      right: { line: '0.5', odds: '1.82' }
    })
  }
  return rows
}

const overUnderRows = () => [
  { left: { line: 'O 2.5', odds: '1.96' }, right: { line: 'U 2.5', odds: '1.96' } },
  { left: { line: 'O 2.5/0.5', odds: '1.96' }, right: { line: 'U 2.5/0.5', odds: '1.96' } }
]

export const SCORE_DETAILS_HANDICAP_TEAMS = {
  home: { name: 'Real Madrid', logo: homeLogo },
  away: { name: "Manchester United's club", logo: awayLogo }
}

export const SCORE_DETAILS_FILTER_TABS: ScoreDetailsFilterTab[] = [
  { key: 'all', label: 'All', count: 18 },
  { key: 'popular', label: 'Popular', count: 13 },
  { key: 'handicap-totals', label: 'Handicap & Totals', count: 6 },
  { key: 'correct-score', label: 'Correct Score', count: 4 },
  { key: 'goals', label: 'Goals', count: 0 },
  { key: 'corners', label: 'Corners', count: 3 },
  { key: 'first-half', label: '1st Half', count: 0 }
]

export const SCORE_DETAILS_MARKETS: ScoreDetailsMarketCard[] = [
  {
    id: 'handicap',
    kind: 'dual-column',
    title: 'Handicap',
    betTypeName: 'Handicap',
    leftHeader: SCORE_DETAILS_HANDICAP_TEAMS.home.name,
    rightHeader: SCORE_DETAILS_HANDICAP_TEAMS.away.name,
    rows: handicapRows(2),
    filters: ['all', 'popular', 'handicap-totals']
  },
  {
    id: 'over-under',
    kind: 'dual-column',
    title: 'Over/Under',
    betTypeName: 'Over/Under',
    leftHeader: 'Over',
    rightHeader: 'Under',
    rows: overUnderRows(),
    filters: ['all', 'popular', 'handicap-totals', 'goals']
  },
  {
    id: '1x2',
    kind: '1x2',
    title: '1X2',
    betTypeName: '1X2',
    options: [
      { label: 'Home', odds: '1.96' },
      { label: 'Away', odds: '1.96' },
      { label: 'Draw', odds: '1.96' }
    ],
    filters: ['all', 'popular']
  },
  {
    id: 'correct-score',
    kind: 'score-picker',
    title: 'Correct Score',
    betTypeName: 'Correct Score',
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
    betTypeName: 'Odd/Even',
    leftHeader: 'Odd',
    rightHeader: 'Even',
    rows: dualRows(),
    filters: ['all', 'popular']
  },
  {
    id: 'incorrect-score',
    kind: 'score-picker',
    title: 'Incorrect Score',
    betTypeName: 'Incorrect Score',
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
    betTypeName: 'West Ham United Total',
    leftHeader: 'Over',
    rightHeader: 'Under',
    rows: dualRows(),
    filters: ['all', 'handicap-totals', 'goals']
  },
  {
    id: 'everton-total',
    kind: 'dual-column',
    title: 'Everton Total',
    betTypeName: 'Everton Total',
    leftHeader: 'Over',
    rightHeader: 'Under',
    rows: dualRows(),
    filters: ['all', 'handicap-totals', 'goals']
  }
]
