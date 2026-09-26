import type { SportMarketLine } from '@/api/interface/sport'

export type EventDetailTabTeam = {
  name: string
  score: number | null
  teamId: number
}

export type EventDetailTabItem = {
  id: string
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
  /** ExtraInfo.c15mhs */
  homeCorners: number
  /** ExtraInfo.c15mas */
  awayCorners: number
  isFavourite: boolean
  /** LiveStreamingUrl 第一项的 m3u8 地址，没有则为空字符串。 */
  liveStreamUrl: string
}
