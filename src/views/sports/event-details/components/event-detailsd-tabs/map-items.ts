import type { SportCompetitionGroup, SportEventExtraInfo } from '@/api/interface/sport'
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
  let homeCorners = 0
  let awayCorners = 0
  const text = raw?.trim()
  if (!text) {
    return { homeYellowCard, awayYellowCard, homeCorners, awayCorners }
  }
  try {
    const parsed = JSON.parse(text) as Partial<SportEventExtraInfo>
    if (typeof parsed.htycs === 'number' && Number.isFinite(parsed.htycs)) {
      homeYellowCard = parsed.htycs
    }
    if (typeof parsed.atycs === 'number' && Number.isFinite(parsed.atycs)) {
      awayYellowCard = parsed.atycs
    }
    if (typeof parsed.c15mhs === 'number' && Number.isFinite(parsed.c15mhs)) {
      homeCorners = parsed.c15mhs
    }
    if (typeof parsed.c15mas === 'number' && Number.isFinite(parsed.c15mas)) {
      awayCorners = parsed.c15mas
    }
  } catch {
    // 非 JSON 或字段缺失时保持 0
  }
  return { homeYellowCard, awayYellowCard, homeCorners, awayCorners }
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
      const { homeYellowCard, awayYellowCard, homeCorners, awayCorners } = parseExtraInfoStats(
        event.ExtraInfo
      )
      items.push({
        id: String(event.EventId),
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
        homeCorners,
        awayCorners,
        isFavourite: event.IsFavourite === true
      })
    }
  }

  return items
}
