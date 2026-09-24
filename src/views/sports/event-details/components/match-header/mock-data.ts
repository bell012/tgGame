import type { MatchHeaderViewModel } from './types'
import teamLogo from './icon/team-logo.png?url'

export const MATCH_HEADER_MOCK: MatchHeaderViewModel = {
  league: 'German Bundesliga',
  phase: 'live',
  home: {
    name: 'Real Madrid',
    logo: teamLogo,
    cards: { red: 1, yellow: 3 }
  },
  away: {
    name: "Manchester United's club",
    logo: teamLogo,
    cards: { red: 1, yellow: 3 }
  },
  homeScore: 2,
  awayScore: 3,
  kickoffText: '19:00 19:00',
  durationText: '2 x 45',
  phaseText: '2H',
  periodScoreText: '(0-1) (1-0)',
  clockText: '88:58',
  cornerScore: '3-1',
  halfTimeScore: '0-0',
  callout: {
    title: '球门球',
    detail: '特尼斯登后备队'
  }
}
