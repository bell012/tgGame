import type {
  SportCompetitionGroup,
  SportEventExtraInfo,
  SportRelatedScore
} from '@/api/interface/sport'
import { parseLiveStreamUrl } from '../match-media-panel/parse-live-stream'
import type { EventDetailTabItem } from './types'

const parseScore = (value: string | undefined): number | null => {
  if (value == null) {
    return null
  }
  const text = value.trim()
  if (!text || text === '—' || text === '-') {
    return null
  }
  const score = Number(text)
  return Number.isFinite(score) ? score : null
}

const parseCardCount = (value: string | undefined): number => {
  if (value == null) {
    return 0
  }
  const text = value.trim()
  if (!/^\d+$/.test(text)) {
    return 0
  }
  return Number(text)
}

const getSportsText = (value: unknown): string =>
  typeof value === 'string'
    ? value.trim()
    : typeof value === 'number' && Number.isFinite(value)
      ? String(value)
      : ''

const parseExtraInfoStats = (raw: string) => {
  let homeYellowCard = 0
  let awayYellowCard = 0
  const text = raw?.trim()
  if (!text) {
    return { homeYellowCard, awayYellowCard }
  }
  try {
    const parsed = JSON.parse(text) as Partial<SportEventExtraInfo>
    if (typeof parsed.htycs === 'number' && Number.isFinite(parsed.htycs)) {
      homeYellowCard = parsed.htycs
    }
    if (typeof parsed.atycs === 'number' && Number.isFinite(parsed.atycs)) {
      awayYellowCard = parsed.atycs
    }
  } catch {
    // 非 JSON 或字段缺失时保持 0
  }
  return { homeYellowCard, awayYellowCard }
}

/** 足球 RelatedScores：2 角球、22 上半场，与首页 mapSportsMatches 保持一致。 */
const findRelatedScore = (
  scores: readonly SportRelatedScore[],
  eventGroupTypeId: number
): { home: number; away: number } | null => {
  const score = scores.find(item => item?.EventGroupTypeId === eventGroupTypeId)
  if (!score) {
    return null
  }
  const home = getSportsText(score.HomeScore)
  const away = getSportsText(score.AwayScore)
  return /^\d+$/.test(home) && /^\d+$/.test(away)
    ? { home: Number(home), away: Number(away) }
    : null
}

/** 将 getSportsV2 联赛分组展平为详情页横向 Tab 列表项。 */
export function mapEventDetailTabItems(
  groups: readonly SportCompetitionGroup[]
): EventDetailTabItem[] {
  const items: EventDetailTabItem[] = []

  for (const group of groups) {
    if (!group || !Array.isArray(group.Sports)) {
      continue
    }
    for (const event of group.Sports) {
      if (!event || !Number.isSafeInteger(event.EventId) || event.EventId <= 0) {
        continue
      }
      const { homeYellowCard, awayYellowCard } = parseExtraInfoStats(event.ExtraInfo)
      const relatedScores = Array.isArray(event.RelatedScores) ? event.RelatedScores : []
      const corners = findRelatedScore(relatedScores, 2)
      const halfTime = findRelatedScore(relatedScores, 22)
      const competitionId = event.Competition?.CompetitionId ?? group.CompetitionId
      items.push({
        id: String(event.EventId),
        competitionId: Number.isSafeInteger(competitionId) ? competitionId : 0,
        marketLines: Array.isArray(event.MarketLines) ? event.MarketLines : [],
        league:
          getSportsText(event.Competition?.CompetitionName) || getSportsText(group.CompetitionName),
        home: {
          name: event.HomeTeam?.trim() ?? '',
          score: parseScore(event.HomeScore),
          teamId: event.HomeTeamId
        },
        away: {
          name: event.AwayTeam?.trim() ?? '',
          score: parseScore(event.AwayScore),
          teamId: event.AwayTeamId
        },
        rbTime: event.RBTime?.trim() ?? '',
        isLive: event.Market === 3,
        homeRedCard: parseCardCount(event.HomeRedCard),
        awayRedCard: parseCardCount(event.AwayRedCard),
        homeYellowCard,
        awayYellowCard,
        homeCorners: corners?.home ?? 0,
        awayCorners: corners?.away ?? 0,
        halfTimeScore: halfTime ? `${halfTime.home}-${halfTime.away}` : '',
        isFavourite: event.IsFavourite === true,
        liveStreamUrl: parseLiveStreamUrl(event.LiveStreamingUrl),
        brEventId:
          Number.isSafeInteger(event.BREventId) && event.BREventId > 0 ? event.BREventId : 0
      })
    }
  }

  return items
}
