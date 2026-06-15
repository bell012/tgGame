import type { TicketMarqueeRecord } from '@/api/interface/activity'
import RatingAvatarP1 from '@/static/svg/game/detail/comment/p1.svg?url'
import RatingAvatarP2 from '@/static/svg/game/detail/comment/p2.webp?url'
import RatingAvatarP3 from '@/static/svg/game/detail/comment/p3.svg?url'
import RatingAvatarP4 from '@/static/svg/game/detail/comment/p4.svg?url'
import RatingAvatarP5 from '@/static/svg/game/detail/comment/p5.svg?url'
import type { WinnerTickerItem } from '../types'

const MARQUEE_FALLBACK_AVATARS = [
  RatingAvatarP1,
  RatingAvatarP2,
  RatingAvatarP3,
  RatingAvatarP4,
  RatingAvatarP5
]

const ABSOLUTE_AVATAR_URL_PATTERN = /^(data:|blob:|https?:\/\/|\/)/i

const normalizeText = (value: unknown) => String(value ?? '').trim()

const hashSeed = (seed: string) => {
  let hash = 0

  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }

  return Math.abs(hash)
}

/** 无 avatar 时按 seed 稳定随机一张占位头像（同用户同条记录头像不变） */
export const getMarqueeFallbackAvatar = (seed: string) => {
  const index = hashSeed(seed) % MARQUEE_FALLBACK_AVATARS.length
  return MARQUEE_FALLBACK_AVATARS[index]!
}

const buildMarqueeAvatarSeed = (record: TicketMarqueeRecord, index: number) =>
  `${record.memberAccount ?? ''}-${record.winTime ?? 0}-${index}`

/** 优先接口 avatar；无效或缺失时用 seed 随机占位图 */
export const resolveMarqueeAvatarUrl = (rawAvatar: unknown, seed: string): string => {
  const path = normalizeText(rawAvatar)

  if (path) {
    if (ABSOLUTE_AVATAR_URL_PATTERN.test(path)) {
      return path
    }

    const baseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
    return baseUrl ? `${baseUrl}/${path.replace(/^\/+/, '')}` : path
  }

  return getMarqueeFallbackAvatar(seed)
}

export const mapMarqueeRecords = (records: TicketMarqueeRecord[]): WinnerTickerItem[] =>
  records.map((record, index) => {
    const seed = buildMarqueeAvatarSeed(record, index)

    return {
      id: `marquee-${record.winTime}-${index}`,
      avatar: resolveMarqueeAvatarUrl(record.avatar, seed),
      username: record.memberAccount ?? '',
      prizeText: record.amountDisplay ?? ''
    }
  })
