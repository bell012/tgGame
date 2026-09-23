import type { SportCompetitionGroup } from '@/api/interface/sport'
import { formatTimestamp } from '@/utils/date'
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

/** 将本次返回的联赛赛事转换为两端共用的基础展示信息；不推定扩展比分与赔率规则。 */
export const mapSportsMatches = (
  groups: readonly SportCompetitionGroup[],
  sportId: number,
  teamLogoUrl: (id: number) => string,
  formatKickoff: (value: string) => string = formatTimestamp
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
        phase: getSportsText(event.RBTime),
        homeScore: getSportsText(event.HomeScore) || '—',
        awayScore: getSportsText(event.AwayScore) || '—',
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
