import type {
  SportCompetitionGroup,
  SportEventExtraInfo,
  SportRelatedScore
} from '@/api/interface/sport'
import i18n from '@/i18n'
import { formatSportsKickoff } from '@/utils/date'
import { sportItems } from '../components/sports-navigation/sport-items'
import type { SportsMatch } from './types'

const getSportsText = (value: unknown): string =>
  typeof value === 'string'
    ? value.trim()
    : typeof value === 'number' && Number.isFinite(value)
      ? String(value)
      : ''

const getCardCount = (value: unknown): string => {
  const text = getSportsText(value)
  return /^\d+$/.test(text) && Number.isSafeInteger(Number(text)) ? text : '0'
}

const getExtraCount = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined

/** 黄牌缺失或无效时按 0 显示。 */
const getExtraCounts = (value: string): Partial<Pick<SportEventExtraInfo, 'htycs' | 'atycs'>> => {
  if (!value) return {}
  try {
    const extra: unknown = JSON.parse(value)
    if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return {}
    return {
      htycs: 'htycs' in extra ? getExtraCount(extra.htycs) : undefined,
      atycs: 'atycs' in extra ? getExtraCount(extra.atycs) : undefined
    }
  } catch {
    return {}
  }
}

// 顺序对应资料中的 index，用于截取比分和高亮当前项。
const playingPeriods: Readonly<Record<number, readonly string[]>> = {
  1: ['1H', '2H'],
  2: ['Q1', 'Q2', 'Q3', 'Q4', '1H', '2H', 'OT'],
  3: ['S1', 'S2', 'S3', 'S4', 'S5'],
  7: ['G1', 'G2', 'G3', 'BRK'],
  8: [
    '1INNS',
    '2INNS',
    '3INNS',
    '4INNS',
    '5INNS',
    '6INNS',
    '7INNS',
    '8INNS',
    '9INNS',
    'EINNS',
    'BRK',
    '1H',
    '2H'
  ],
  13: ['1INNS', '2INNS', 'SO'],
  19: ['Q1', 'Q2', 'Q3', 'Q4', '1H', '2H', 'H1', 'H2', 'OT'],
  34: Array.from({ length: 35 }, (_, index) => `F${index + 1}`),
  36: ['BRK', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'],
  40: ['S1', 'S2', 'S3', 'S4', 'S5']
}

export const getGamePlayingName = (sportId: number, rbTime?: string): string => {
  const period = getSportsText(rbTime).split(/\s+/, 1)[0]
  const t = i18n.global.t
  if (period === 'HT') return t('sports.matchCard.periods.paused')
  if (period === 'FT') return t('sports.matchCard.periods.finished')
  if (period === '!LIVE') return t('sports.matchCard.periods.notStarted')
  if (!playingPeriods[sportId]?.includes(period)) return ''
  if (period === 'BRK') return t('sports.matchCard.periods.paused')
  if (['OT', 'EINNS', 'SO'].includes(period)) return t('sports.matchCard.periods.overtime')
  if (period === '1H' || period === 'H1') return t('sports.matchCard.periods.firstHalf')
  if (period === '2H' || period === 'H2') return t('sports.matchCard.periods.secondHalf')
  const number = Number(period.match(/\d+/)?.[0])
  if (period.startsWith('Q')) return t('sports.matchCard.periods.quarter', { number })
  if (period.startsWith('S')) return t('sports.matchCard.periods.set', { number })
  if (period.startsWith('G')) return t('sports.matchCard.periods.game', { number })
  if (period.startsWith('F')) return t('sports.matchCard.periods.frame', { number })
  return t('sports.matchCard.periods.inning', { number })
}

const getRelatedScore = (score?: SportRelatedScore): string | undefined => {
  if (!score) return undefined
  const home = getSportsText(score.HomeScore)
  const away = getSportsText(score.AwayScore)
  return /^\d+$/.test(home) && /^\d+$/.test(away) ? `${home}-${away}` : undefined
}

const mapRelatedScores = (
  sportId: number,
  phase: string,
  scores: readonly SportRelatedScore[]
): NonNullable<SportsMatch['relatedScores']> => {
  if (sportId === 1) {
    return (
      [
        { type: 22, label: 'HT' },
        { type: 23, label: 'FT' }
      ] as const
    ).flatMap(({ type, label }) => {
      const score = getRelatedScore(scores.find(item => item?.EventGroupTypeId === type))
      return score ? [{ key: String(type), score, label, active: false }] : []
    })
  }
  if (!playingPeriods[sportId]) return []
  const period = phase.split(' ', 1)[0]
  const index = Math.max(0, playingPeriods[sportId]?.indexOf(period) ?? -1)
  return scores.slice(0, index + 1).flatMap((item, position) => {
    const score = getRelatedScore(item)
    return score ? [{ key: String(position), score, active: position === index }] : []
  })
}

const getPhaseClock = (
  phase: string,
  status: number,
  receivedAt: number
): SportsMatch['phaseClock'] => {
  const [period, time, extra] = phase.split(' ')
  if (['HT', 'FT', '!LIVE'].includes(period)) return undefined
  if (!time || extra) return undefined
  const clock = /^(\d+)(?::([0-5]\d))?$/.exec(time)
  if (!clock) return undefined
  const seconds = Number(clock[1]) * 60 + Number(clock[2] ?? 0)
  if (!Number.isSafeInteger(seconds)) return undefined
  return { period, seconds, running: status !== 3, receivedAt }
}

/** 按实际经过时间计时，浏览器暂停回调不会造成计时漂移。 */
export const getMatchDisplayTime = (
  match: SportsMatch,
  now: number,
  clock = match.phaseClock
): string => {
  if (match.sportId === 51) return match.kickoff
  if (match.Market === 3 && match.rbTimeStatus === 3)
    return i18n.global.t('sports.matchCard.periods.paused')
  const [period, time] = match.phase.split(' ')
  if (!period || period === '!LIVE') return match.kickoff
  const name = getGamePlayingName(match.sportId, period)
  if (period === 'HT' || period === 'FT') return name
  if (!time) return name || match.kickoff
  if (!clock?.running) return [name, time].filter(Boolean).join(' ')
  const elapsed = Math.max(0, Math.floor((now - clock.receivedAt) / 1000))
  // 篮球使用剩余时间；未确认方向的球种仍按正计。
  const seconds = Math.max(0, clock.seconds + (match.sportId === 2 ? -elapsed : elapsed))
  const displayTime = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  return [name, displayTime].filter(Boolean).join(' ')
}

/** PC/H5 共用赛事显示数据。 */
export const mapSportsMatches = (
  groups: readonly SportCompetitionGroup[],
  sportId: number,
  teamLogoUrl: (id: number) => string,
  formatKickoff: (value: string) => string = formatSportsKickoff,
  getClockUpdatedAt: (sportId: number, eventId: number) => number = () => Date.now()
): SportsMatch[] => {
  const sportKey = sportItems.find(item => item.sportId === sportId)?.key ?? ''
  const matches = new Map<string, SportsMatch>()
  for (const group of groups) {
    if (!group || !Array.isArray(group.Sports)) continue
    for (const event of group.Sports) {
      if (!event || !Number.isSafeInteger(event.EventId) || event.EventId <= 0) continue
      const id = `${sportId}:${event.EventId}`
      if (matches.has(id)) continue
      const competitionId = event.Competition?.CompetitionId ?? group.CompetitionId
      if (!Number.isSafeInteger(competitionId)) continue
      const phase = sportId === 51 ? '' : getSportsText(event.RBTime).split(/\s+/).join(' ')
      const extra = getExtraCounts(event.ExtraInfo)
      const scores = Array.isArray(event.RelatedScores) ? event.RelatedScores : []
      matches.set(id, {
        id,
        EventId: event.EventId,
        sportId,
        sportKey,
        leagueId: `${sportId}:${competitionId}`,
        league:
          getSportsText(event.Competition?.CompetitionName) || getSportsText(group.CompetitionName),
        kickoff: formatKickoff(event.EventDate),
        // IsLive 仅表示支持滚球，赛事当前是否滚球以 Market 为准。
        live: event.Market === 3,
        Market: event.Market,
        OpenParlay: event.OpenParlay === true,
        phase,
        rbTimeStatus: event.RBTimeStatus,
        phaseClock: getPhaseClock(
          phase,
          event.Market === 3 ? event.RBTimeStatus : 0,
          getClockUpdatedAt(sportId, event.EventId)
        ),
        homeScore: getSportsText(event.HomeScore) || '—',
        awayScore: getSportsText(event.AwayScore) || '—',
        cornerScore:
          sportId === 1
            ? (getRelatedScore(scores.find(item => item?.EventGroupTypeId === 2)) ?? '0-0')
            : undefined,
        halfTimeScore:
          sportId === 1
            ? getRelatedScore(scores.find(item => item?.EventGroupTypeId === 22))
            : undefined,
        relatedScores: mapRelatedScores(sportId, phase, scores),
        home: {
          name: getSportsText(event.HomeTeam),
          badge: event.HomeTeamId > 0 ? teamLogoUrl(event.HomeTeamId) : '',
          redCards: getCardCount(event.HomeRedCard),
          yellowCards: String(extra.htycs ?? 0)
        },
        away: {
          name: getSportsText(event.AwayTeam),
          badge: event.AwayTeamId > 0 ? teamLogoUrl(event.AwayTeamId) : '',
          redCards: getCardCount(event.AwayRedCard),
          yellowCards: String(extra.atycs ?? 0)
        },
        hasVideo:
          event.LiveStreaming === 1 &&
          Array.isArray(event.LiveStreamingUrl) &&
          event.LiveStreamingUrl.length > 0,
        hasAnimation: (event.BREventId ?? 0) > 0,
        totalMarkets:
          Number.isInteger(event.TotalMarketLineCount) && event.TotalMarketLineCount >= 0
            ? event.TotalMarketLineCount
            : undefined,
        IsFavourite: event.IsFavourite === true,
        HomeTeam: event.HomeTeam,
        AwayTeam: event.AwayTeam,
        HomeScore: getSportsText(event.HomeScore),
        AwayScore: getSportsText(event.AwayScore),
        HomeTeamId: event.HomeTeamId,
        AwayTeamId: event.AwayTeamId,
        MarketLines: Array.isArray(event.MarketLines) ? event.MarketLines : []
      })
    }
  }
  return [...matches.values()]
}
