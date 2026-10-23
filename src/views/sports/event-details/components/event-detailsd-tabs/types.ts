import type { SportMarketLine } from '@/api/interface/sport'

export type EventDetailTabTeam = {
  name: string
  score: number | null
  teamId: number
}

export type EventDetailTabItem = {
  id: string
  /** 联赛 ID，与 PC 联赛 tabs 的 key 对应。 */
  competitionId: number
  league: string
  marketLines: SportMarketLine[]
  home: EventDetailTabTeam
  away: EventDetailTabTeam
  /** 滚球时间，对应接口 RBTime。 */
  rbTime: string
  isLive: boolean
  homeRedCard: number
  awayRedCard: number
  /** ExtraInfo.htycs */
  homeYellowCard: number
  /** ExtraInfo.atycs */
  awayYellowCard: number
  /** RelatedScores 中 EventGroupTypeId=2 的主队角球数。 */
  homeCorners: number
  /** RelatedScores 中 EventGroupTypeId=2 的客队角球数。 */
  awayCorners: number
  /** RelatedScores 中 EventGroupTypeId=22 的上半场比分，如 `1-0`；没有则为空字符串。 */
  halfTimeScore: string
  isFavourite: boolean
  /** LiveStreamingUrl 第一项的 m3u8 地址，没有则为空字符串。 */
  liveStreamUrl: string
  /** 动画页 matchId，对应接口 BREventId；没有动画时为 0。 */
  brEventId: number
}
