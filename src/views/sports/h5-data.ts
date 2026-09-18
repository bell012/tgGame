import teamBadge from '@/static/img/explore/sports-team.png'
import type { SportsMatch } from './index'
import type { OddsMarket } from './components/match-odds/types'

export const H5_SPORTS = [
  { key: 'football', label: 'Football' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'tennis', label: 'Tennis' },
  { key: 'badminton', label: 'Badminton' },
  { key: 'boxing', label: 'Boxing' },
  { key: 'american-football', label: 'American Football' },
  { key: 'baseball', label: 'Baseball' }
] as const

export type H5SportsKey = (typeof H5_SPORTS)[number]['key']

export type H5SportsMatch = SportsMatch & {
  sportKey: H5SportsKey
  leagueId: string
  live: boolean
  phase: string
  /** 按比赛顺序展示各节、局或盘比分，足球使用角球及半场专属字段。 */
  periodScores: string[]
  totalScore: string
  mockBetStatus: 'open' | 'closed' | 'fail'
  markets: OddsMarket[]
}

type MockLeague = {
  id: string
  country: string
  name: string
  teams: readonly [string, string, string, string]
}

type SportScore = {
  phase: string
  home: number
  away: number
  periods: string[]
  total: string
}

type SportProfile = {
  handicap: string
  total: string
  draw: boolean
  scores: readonly [SportScore, SportScore]
  leagues: readonly [MockLeague, MockLeague, MockLeague]
}

const league = (
  id: string,
  country: string,
  name: string,
  teams: MockLeague['teams']
): MockLeague => ({ id, country, name, teams })

// 比分和赔率仅用于本地界面联调，不代表即时赛况或真实结算规则。
const SPORT_PROFILES: Record<H5SportsKey, SportProfile> = {
  football: {
    handicap: '0/0.5',
    total: '3.5',
    draw: true,
    scores: [
      { phase: '2H 67:23', home: 2, away: 1, periods: [], total: '2-1' },
      { phase: '1H 32:18', home: 1, away: 0, periods: [], total: '1-0' }
    ],
    leagues: [
      league('premier-league', 'England', 'Premier League', [
        'Manchester United',
        'Chelsea',
        'Arsenal',
        'Liverpool'
      ]),
      league('la-liga', 'Spain', 'La Liga', [
        'Real Madrid',
        'Real Betis',
        'Barcelona',
        'Atletico Madrid'
      ]),
      league('bundesliga', 'Germany', 'Bundesliga', [
        'Bayern Munich',
        'Borussia Dortmund',
        'Bayer Leverkusen',
        'RB Leipzig'
      ])
    ]
  },
  basketball: {
    handicap: '5.5',
    total: '178.5',
    draw: false,
    scores: [
      {
        phase: 'Q3 06:42',
        home: 59,
        away: 54,
        periods: ['23-20', '22-24', '14-10'],
        total: '59-54'
      },
      { phase: 'Q2 04:18', home: 37, away: 40, periods: ['22-24', '15-16'], total: '37-40' }
    ],
    leagues: [
      league('nba', 'USA', 'NBA', [
        'Boston Celtics',
        'Miami Heat',
        'LA Lakers',
        'Golden State Warriors'
      ]),
      league('euroleague', 'Europe', 'EuroLeague', [
        'Real Madrid',
        'Olympiacos',
        'Fenerbahce',
        'Panathinaikos'
      ]),
      league('pba', 'Philippines', 'PBA', [
        'Barangay Ginebra',
        'San Miguel Beermen',
        'TNT Tropang Giga',
        'Meralco Bolts'
      ])
    ]
  },
  tennis: {
    handicap: '2.5',
    total: '22.5',
    draw: false,
    scores: [
      { phase: '2nd Set · Best of 3', home: 2, away: 3, periods: ['6-4', '2-3'], total: '1-0' },
      {
        phase: '3rd Set · Best of 3',
        home: 4,
        away: 3,
        periods: ['4-6', '6-3', '4-3'],
        total: '1-1'
      }
    ],
    leagues: [
      league('atp-tour', 'International', 'ATP Tour · Singles', [
        'Carlos Alcaraz',
        'Jannik Sinner',
        'Daniil Medvedev',
        'Alexander Zverev'
      ]),
      league('wta-tour', 'International', 'WTA Tour · Singles', [
        'Iga Swiatek',
        'Aryna Sabalenka',
        'Coco Gauff',
        'Elena Rybakina'
      ]),
      league('challenger-tour', 'International', 'ATP Challenger Tour', [
        'Alex Martin',
        'Luca Rossi',
        'Daniel Kim',
        'Oliver Evans'
      ])
    ]
  },
  badminton: {
    handicap: '4.5',
    total: '78.5',
    draw: false,
    scores: [
      {
        phase: 'Game 2 · Best of 3',
        home: 13,
        away: 16,
        periods: ['21-17', '13-16'],
        total: '1-0'
      },
      {
        phase: 'Game 3 · Best of 3',
        home: 11,
        away: 9,
        periods: ['18-21', '21-15', '11-9'],
        total: '1-1'
      }
    ],
    leagues: [
      league('bwf-men', 'International', "BWF World Tour · Men's Singles", [
        'Viktor Axelsen',
        'Lee Zii Jia',
        'Kunlavut Vitidsarn',
        'Shi Yu Qi'
      ]),
      league('bwf-women', 'International', "BWF World Tour · Women's Singles", [
        'An Se Young',
        'Wang Zhi Yi',
        'Akane Yamaguchi',
        'Han Yue'
      ]),
      league('malaysia-open', 'Malaysia', 'Malaysia Open · Singles', [
        'Alex Tan',
        'Kenji Sato',
        'Daniel Lim',
        'Arjun Rao'
      ])
    ]
  },
  boxing: {
    handicap: '2.5',
    total: '9.5',
    draw: true,
    scores: [
      {
        phase: 'Round 4 · 01:35',
        home: 29,
        away: 28,
        periods: ['10-9', '9-10', '10-9'],
        total: '29-28'
      },
      { phase: 'Round 3 · 02:10', home: 19, away: 19, periods: ['10-9', '9-10'], total: '19-19' }
    ],
    leagues: [
      league('heavyweight', 'International', 'Heavyweight · 12 Rounds', [
        'James Walker',
        'Marco Silva',
        'David Turner',
        'Luis Garcia'
      ]),
      league('welterweight', 'International', 'Welterweight · 12 Rounds', [
        'Ryan Brooks',
        'Miguel Santos',
        'Jack Wilson',
        'Andre Martin'
      ]),
      league('lightweight', 'International', 'Lightweight · 10 Rounds', [
        'Ethan Price',
        'Rafael Cruz',
        'Noah Reed',
        'Diego Flores'
      ])
    ]
  },
  'american-football': {
    handicap: '3.5',
    total: '45.5',
    draw: false,
    scores: [
      { phase: 'Q3 08:12', home: 21, away: 14, periods: ['7-0', '7-7', '7-7'], total: '21-14' },
      { phase: 'Q2 03:44', home: 10, away: 7, periods: ['7-0', '3-7'], total: '10-7' }
    ],
    leagues: [
      league('nfl', 'USA', 'NFL', [
        'Kansas City Chiefs',
        'Buffalo Bills',
        'Philadelphia Eagles',
        'Dallas Cowboys'
      ]),
      league('ncaa', 'USA', 'NCAA Football', [
        'Michigan Wolverines',
        'Ohio State Buckeyes',
        'Georgia Bulldogs',
        'Alabama Crimson Tide'
      ]),
      league('european-league', 'Europe', 'European League of Football', [
        'Vienna Vikings',
        'Rhein Fire',
        'Stuttgart Surge',
        'Paris Musketeers'
      ])
    ]
  },
  baseball: {
    handicap: '1.5',
    total: '8.5',
    draw: false,
    scores: [
      {
        phase: 'Bottom 5th',
        home: 3,
        away: 2,
        periods: ['0-0', '1-0', '0-1', '2-1', '0-0'],
        total: '3-2'
      },
      { phase: 'Top 4th', home: 1, away: 4, periods: ['0-2', '1-0', '0-1', '0-1'], total: '1-4' }
    ],
    leagues: [
      league('mlb', 'USA', 'MLB', [
        'NY Yankees',
        'Boston Red Sox',
        'LA Dodgers',
        'San Diego Padres'
      ]),
      league('npb', 'Japan', 'NPB', [
        'Yomiuri Giants',
        'Hanshin Tigers',
        'SoftBank Hawks',
        'Hokkaido Fighters'
      ]),
      league('kbo', 'South Korea', 'KBO League', [
        'LG Twins',
        'Doosan Bears',
        'KIA Tigers',
        'Samsung Lions'
      ])
    ]
  }
}

const createMarkets = (profile: SportProfile, matchIndex: number): OddsMarket[] => [
  {
    id: 'handicap',
    title: 'Handicap',
    options: [
      {
        id: 'home',
        label: 'H',
        line: `-${profile.handicap}`,
        odds: '1.96',
        trend: matchIndex === 0 ? 'up' : null
      },
      { id: 'away', label: 'A', line: `+${profile.handicap}`, odds: '1.96' }
    ]
  },
  {
    id: 'ou',
    title: 'Over/Under',
    options: [
      { id: 'over', label: 'Over', line: profile.total, odds: '1.88' },
      {
        id: 'under',
        label: 'Under',
        line: profile.total,
        odds: '1.96',
        trend: matchIndex === 1 ? 'down' : null
      }
    ]
  },
  {
    id: '1x2',
    title: '1X2',
    options: profile.draw
      ? [
          { id: 'home', label: 'H', odds: '2.16' },
          { id: 'away', label: 'A', odds: '3.10' },
          { id: 'draw', label: 'D', odds: '3.25' }
        ]
      : [
          { id: 'home', label: 'H', odds: '1.76' },
          { id: 'away', label: 'A', odds: '2.10' }
        ]
  }
]

/** 三个联赛各含两场滚球和两场未开赛，稳定 ID 保证切换分组时仍能保留投注及收藏。 */
export const H5_MATCHES: H5SportsMatch[] = H5_SPORTS.flatMap(({ key }) => {
  const profile = SPORT_PROFILES[key]
  return profile.leagues.flatMap((item, leagueIndex) =>
    Array.from({ length: 4 }, (_, matchIndex): H5SportsMatch => {
      const live = matchIndex < 2
      const score = profile.scores[matchIndex % 2]
      const homeIndex = [0, 2, 1, 3][matchIndex]
      const awayIndex = [1, 3, 2, 0][matchIndex]
      const football = live && key === 'football'
      return {
        id: `h5-${key}-${item.id}-${matchIndex + 1}`,
        sportKey: key,
        leagueId: `${key}-${item.id}`,
        country: item.country,
        league: item.name,
        live,
        kickoff: `${matchIndex === 3 ? 'Tomorrow' : 'Today'}, ${String(18 + leagueIndex).padStart(2, '0')}:${matchIndex % 2 === 0 ? '00' : '30'}`,
        phase: live ? score.phase : 'Not Started',
        homeScore: live ? score.home : 0,
        awayScore: live ? score.away : 0,
        cornerScore: football ? (matchIndex === 0 ? '3-1' : '2-0') : '',
        halfTimeScore: football ? (matchIndex === 0 ? '1-0' : '-') : '',
        periodScores: live ? [...score.periods] : [],
        totalScore: live ? score.total : '0-0',
        home: {
          name: item.teams[homeIndex],
          badge: teamBadge,
          redCards: 0,
          yellowCards: football ? 2 : 0
        },
        away: {
          name: item.teams[awayIndex],
          badge: teamBadge,
          redCards: football && matchIndex === 0 ? 1 : 0,
          yellowCards: football ? 1 : 0
        },
        // 末组滚球保留固定的关盘与失败样例，直接从赛事入口验证投注单错误状态。
        mockBetStatus: leagueIndex === 2 && live ? (matchIndex === 0 ? 'closed' : 'fail') : 'open',
        markets: createMarkets(profile, matchIndex)
      }
    })
  )
})
