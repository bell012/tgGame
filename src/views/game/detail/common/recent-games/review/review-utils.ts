import type { GameCommentListItem } from '@/api/interface/game'

export type ScoreTemplateKey = 'five' | 'fourHalf' | 'four'

export type CommentLikeCacheItem = {
  isLiked: boolean
  isDisliked: boolean
  likeCount: number
}

export type CommentLikeCacheMap = Record<string, CommentLikeCacheItem>

export const RANDOM_FLOAT_RATIO = 0.1

export const RATING_DISTRIBUTION_BASE: Record<
  ScoreTemplateKey,
  [number, number, number, number, number]
> = {
  // 5.0: P5 > P4 > P3 > 2P2 > 4P1
  // 对应顺序为 [P5, P4, P3, P2, P1]
  five: [0.46, 0.25, 0.16, 0.07, 0.03],
  // 4.5: P5 >= P4 >= P3 > 2P2 > 3P1
  fourHalf: [0.37, 0.33, 0.19, 0.07, 0.04],
  // 4.0: P4 > P5 > P3 > 2P2 > 3P1
  four: [0.27, 0.4, 0.2, 0.08, 0.05]
}

export const normalizeQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }
  return String(value ?? '').trim()
}

export const normalizePositiveInt = (value: unknown) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0
  }
  return Math.trunc(parsed)
}

export const normalizeLikeCount = (value: unknown) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }
  return Math.trunc(parsed)
}

export const normalizeIsLiked = (value: unknown) =>
  value === true || value === 1 || value === '1' || value === 'true'

export const parseCommentLikeCacheItem = (value: unknown): CommentLikeCacheItem | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const parsedValue = value as Record<string, unknown>
  return {
    isLiked: normalizeIsLiked(parsedValue.isLiked ?? parsedValue.liked),
    isDisliked: normalizeIsLiked(parsedValue.isDisliked ?? parsedValue.disliked),
    likeCount: normalizeLikeCount(parsedValue.likeCount)
  }
}

export const parseCommentLikeCacheMap = (rawValue: string | null): CommentLikeCacheMap => {
  const result: CommentLikeCacheMap = {}
  if (!rawValue) {
    return result
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return result
    }

    Object.entries(parsedValue as Record<string, unknown>).forEach(([key, value]) => {
      const normalizedKey = normalizeQueryValue(key)
      const normalizedValue = parseCommentLikeCacheItem(value)
      if (!normalizedKey || !normalizedValue) {
        return
      }
      result[normalizedKey] = normalizedValue
    })
  } catch (error) {
    console.error('parse comment like cache failed', error)
  }

  return result
}

export const createCommentLikeCacheKey = (subjectId: string, commentId: string) => {
  const normalizedCommentId = normalizeQueryValue(commentId)
  if (!normalizedCommentId) {
    return ''
  }

  const normalizedSubjectId = normalizeQueryValue(subjectId)
  return normalizedSubjectId ? `${normalizedSubjectId}_${normalizedCommentId}` : normalizedCommentId
}

export const toSafeNumber = (value: unknown) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 0
  }
  return parsed
}

export const formatElapsedTime = (timestamp: number) => {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return '--'
  }

  const diffMs = Date.now() - timestamp
  if (diffMs <= 0) {
    return '0m'
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  if (diffMinutes < 60) {
    return `${Math.max(diffMinutes, 1)}m`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

export const normalizeDistribution = (values: number[]) => {
  const total = values.reduce((sum, current) => sum + Math.max(0, current), 0)

  if (total <= 0) {
    return [0, 0, 0, 0, 0]
  }

  return values.map(value => Math.max(0, value) / total)
}

export const getScoreTemplateKey = (score: number): ScoreTemplateKey => {
  if (score >= 4.75) return 'five'
  if (score >= 4.25) return 'fourHalf'
  return 'four'
}

export const buildDistributionWithRandomFactor = (
  baseDistribution: [number, number, number, number, number]
) => {
  const withFactor = baseDistribution.map((value, index) => {
    void index
    // 每条进度条在基准上做 ±10% 浮动
    const randomFactor = (Math.random() * 2 - 1) * RANDOM_FLOAT_RATIO
    return Math.max(value * (1 + randomFactor), 0.0001)
  })

  // 归一化后保证 5 条占比和为 1（最终再映射到 200%）
  return normalizeDistribution(withFactor)
}

export const parseCommentRecords = (result: unknown): GameCommentListItem[] => {
  const records = (result as { records?: unknown } | undefined)?.records
  if (Array.isArray(result)) {
    return result as GameCommentListItem[]
  }
  if (Array.isArray(records)) {
    return records as GameCommentListItem[]
  }
  return []
}

export const buildRatingPreviewAvatarUrls = (options: {
  count: number
  fallbackAvatarUrls: string[]
  hasUserRating: boolean
  userAvatarUrl: string
}) => {
  const { count, fallbackAvatarUrls, hasUserRating, userAvatarUrl } = options
  if (count <= 0) {
    return []
  }

  const avatarUrls = fallbackAvatarUrls.slice(0, count)
  if (hasUserRating) {
    avatarUrls[0] = userAvatarUrl
  }

  return avatarUrls
}
