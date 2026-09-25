import type { EventDetailTabItem } from './components/event-detailsd-tabs/types'
import type { MatchHeaderViewModel } from './components/match-header/types'
import type { SportsMatch } from '../shared/types'

const parseScore = (value: string | undefined) => {
  const text = value?.trim() ?? ''
  if (!text || text === '—' || text === '-') {
    return 0
  }
  const score = Number(text)
  return Number.isFinite(score) ? score : 0
}

const parseCardCount = (value: string | undefined) => {
  const text = value?.trim() ?? ''
  if (!/^\d+$/.test(text)) {
    return 0
  }
  return Number(text)
}

const splitPhaseClock = (rbTime: string) => {
  const text = rbTime.trim()
  if (!text) {
    return { phaseText: '', clockText: '' }
  }
  const parts = text.split(/\s+/)
  if (parts.length >= 2) {
    return { phaseText: parts[0] ?? '', clockText: parts.slice(1).join(' ') }
  }
  return { phaseText: text, clockText: '' }
}

export const mapEventDetailTabToMatchHeader = (
  item: EventDetailTabItem,
  teamLogoUrl: (id: number) => string
): MatchHeaderViewModel => {
  const { phaseText, clockText } = splitPhaseClock(item.rbTime)
  return {
    league: item.league,
    phase: item.isLive ? 'live' : 'prematch',
    home: {
      name: item.home.name,
      logo: item.home.teamId > 0 ? teamLogoUrl(item.home.teamId) : '',
      cards: { red: item.homeRedCard, yellow: item.homeYellowCard }
    },
    away: {
      name: item.away.name,
      logo: item.away.teamId > 0 ? teamLogoUrl(item.away.teamId) : '',
      cards: { red: item.awayRedCard, yellow: item.awayYellowCard }
    },
    homeScore: item.home.score ?? 0,
    awayScore: item.away.score ?? 0,
    kickoffText: item.rbTime || '—',
    durationText: '',
    phaseText,
    periodScoreText: '',
    clockText: clockText || item.rbTime,
    cornerScore:
      item.homeCorners || item.awayCorners ? `${item.homeCorners}-${item.awayCorners}` : '—',
    halfTimeScore: '—'
  }
}

export const mapSportsMatchToMatchHeader = (
  match: SportsMatch,
  teamLogoUrl: (id: number) => string
): MatchHeaderViewModel => {
  const { phaseText, clockText } = splitPhaseClock(match.phase)
  return {
    league: match.league,
    phase: match.live ? 'live' : 'prematch',
    home: {
      name: match.home.name,
      logo: match.home.badge || (match.HomeTeamId > 0 ? teamLogoUrl(match.HomeTeamId) : ''),
      cards: {
        red: parseCardCount(match.home.redCards),
        yellow: parseCardCount(match.home.yellowCards)
      }
    },
    away: {
      name: match.away.name,
      logo: match.away.badge || (match.AwayTeamId > 0 ? teamLogoUrl(match.AwayTeamId) : ''),
      cards: {
        red: parseCardCount(match.away.redCards),
        yellow: parseCardCount(match.away.yellowCards)
      }
    },
    homeScore: parseScore(match.homeScore),
    awayScore: parseScore(match.awayScore),
    kickoffText: match.kickoff || match.phase || '—',
    durationText: '',
    phaseText,
    periodScoreText: '',
    clockText: clockText || match.phase,
    cornerScore: match.cornerScore ?? '—',
    halfTimeScore: match.halfTimeScore ?? '—'
  }
}
