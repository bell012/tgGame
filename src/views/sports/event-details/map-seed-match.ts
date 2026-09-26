import type { SportCompetitionGroup, SportEvent, SportsEventMarket } from '@/api/interface/sport'
import type { SportsMatch } from '../shared/types'

/** 将单场详情合并进 getSportsV2 联赛列表，按 EventId 更新盘口并保持 tabs 完整。 */
export const mergeEventIntoGroups = (
  groups: readonly SportCompetitionGroup[],
  event: SportEvent
): SportCompetitionGroup[] => {
  const competitionId = event.Competition?.CompetitionId
  if (!Number.isSafeInteger(competitionId)) {
    return [...groups, eventToCompetitionGroup(event)]
  }

  let merged = false
  const next = groups.map(group => {
    if (group.CompetitionId !== competitionId) {
      return group
    }
    merged = true
    const hasEvent = group.Sports.some(item => item.EventId === event.EventId)
    const sports = hasEvent
      ? group.Sports.map(item => (item.EventId === event.EventId ? event : item))
      : [...group.Sports, event]
    return { ...group, Sports: sports }
  })

  if (!merged) {
    next.push(eventToCompetitionGroup(event))
  }
  return next
}

export const eventToCompetitionGroup = (event: SportEvent): SportCompetitionGroup => ({
  CompetitionId: event.Competition.CompetitionId,
  CompetitionName: event.Competition.CompetitionName,
  PMOrderNumber: event.Competition.PMOrderNumber,
  RBOrderNumber: event.Competition.RBOrderNumber,
  Sports: [event],
  competitionCount: 1
})

/** 列表页带入的 SportsMatch 转成详情页 groups，供首屏展示与投注单匹配。 */
export const sportsMatchToCompetitionGroups = (match: SportsMatch): SportCompetitionGroup[] => {
  const competitionId = Number(match.leagueId.split(':')[1])
  const market: SportsEventMarket = match.live ? 3 : 2
  const event: SportEvent = {
    EventId: match.EventId,
    OpenParlay: false,
    IsLive: match.live,
    Market: market,
    EventStatusId: 1,
    OrderNumber: 0,
    EventDate: match.kickoff,
    GroundTypeId: 1,
    EventGroupId: 0,
    EventGroupTypeId: 0,
    TotalMarketLineCount: match.totalMarkets ?? match.MarketLines.length,
    IsPopular: false,
    IsFavourite: match.IsFavourite,
    IsBetTradeOpen: false,
    BREventId: 0,
    HasVisualization: match.hasAnimation,
    HasStatistic: false,
    Season: 0,
    MatchDay: 0,
    LiveStreaming: match.hasVideo ? 1 : 0,
    LiveStreamingUrl: [],
    HomeTeamId: match.HomeTeamId,
    HomeTeam: match.HomeTeam,
    AwayTeamId: match.AwayTeamId,
    AwayTeam: match.AwayTeam,
    RBTime: match.phase,
    RBTimeStatus: match.live ? 2 : 0,
    HomeScore: match.HomeScore,
    AwayScore: match.AwayScore,
    HomeRedCard: match.home.redCards,
    AwayRedCard: match.away.redCards,
    ExtraInfo: '',
    Competition: {
      CompetitionId: Number.isSafeInteger(competitionId) ? competitionId : 0,
      CompetitionName: match.league,
      PMOrderNumber: 0,
      RBOrderNumber: 0
    },
    MarketLines: match.MarketLines
  }
  return [eventToCompetitionGroup(event)]
}
