import type { SportCompetitionGroup, SportEventExtraInfo } from '@/api/interface/sport'
import { formatSportsKickoff } from '@/utils/date'
import { sportItems } from '../components/sports-navigation/sport-items'
import type { SportsMatch } from './types'

const getSportsText = (value: unknown): string =>
  typeof value === 'string'
    ? value.trim()
    : typeof value === 'number' && Number.isFinite(value)
      ? String(value)
      : ''

const getCardCount = (value: unknown): string | undefined => {
  const text = getSportsText(value)
  return /^\d+$/.test(text) ? text : undefined
}

const getExtraCount = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined

/** 扩展信息缺失时，角球数按 0 显示。 */
const getCornerCounts = (value: string): Pick<SportEventExtraInfo, 'htycs' | 'atycs'> => {
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

/** 金融投注只显示开赛时间，其余球种保留接口阶段。 */
export const getGamePlayingName = (sportId: number, rbTime?: string): string =>
  sportId === 51 ? '' : getSportsText(rbTime).split(/\s+/).join(' ')

const getPhaseClock = (
  phase: string,
  status: number,
  receivedAt: number
): SportsMatch['phaseClock'] => {
  const [period, time, extra] = phase.split(' ')
  if (!time || extra) return undefined
  const clock = /^(\d+)(?::([0-5]\d))?$/.exec(time)
  if (!clock) return undefined
  const seconds = Number(clock[1]) * 60 + Number(clock[2] ?? 0)
  if (!Number.isSafeInteger(seconds)) return undefined
  return { period, seconds, running: status !== 3, receivedAt }
}

/** 按实际经过时间累加，浏览器暂停回调不会造成计时漂移。 */
export const getMatchDisplayTime = (
  match: SportsMatch,
  now: number,
  clock = match.phaseClock
): string => {
  if (!clock?.running) return match.phase || match.kickoff
  const elapsed = Math.max(0, Math.floor((now - clock.receivedAt) / 1000))
  const seconds = clock.seconds + elapsed
  return `${clock.period} ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

/** 将本次返回的联赛赛事转换为两端共用的基础展示信息；不推定扩展比分与赔率规则。 */
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
      const phase = getGamePlayingName(sportId, event.RBTime)
      const corners = sportId === 1 ? getCornerCounts(event.ExtraInfo) : undefined
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
        phaseClock: getPhaseClock(
          phase,
          event.RBTimeStatus,
          getClockUpdatedAt(sportId, event.EventId)
        ),
        homeScore: getSportsText(event.HomeScore) || '—',
        awayScore: getSportsText(event.AwayScore) || '—',
        cornerScore: corners ? `${corners.htycs ?? 0}-${corners.atycs ?? 0}` : undefined,
        home: {
          name: getSportsText(event.HomeTeam),
          badge: event.HomeTeamId > 0 ? teamLogoUrl(event.HomeTeamId) : '',
          redCards: getCardCount(event.HomeRedCard)
        },
        away: {
          name: getSportsText(event.AwayTeam),
          badge: event.AwayTeamId > 0 ? teamLogoUrl(event.AwayTeamId) : '',
          redCards: getCardCount(event.AwayRedCard)
        },
        hasVideo: event.LiveStreaming === 1,
        hasAnimation: event.HasVisualization === true,
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
