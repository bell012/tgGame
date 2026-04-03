const GAME_RATING_STORAGE_KEY = 'gameRatingMap'

const normalizeValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }
  return String(value ?? '').trim()
}

const normalizeRating = (value: unknown) => {
  const parsed = Number(normalizeValue(value))
  if (!Number.isFinite(parsed) || !value) {
    return 0
  }
  return Math.max(1, Math.min(5, Math.trunc(parsed)))
}

const parseRatingMap = (rawValue: string | null) => {
  const result: Record<string, number> = {}
  if (!rawValue) {
    return result
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return result
    }

    Object.entries(parsedValue as Record<string, unknown>).forEach(([key, value]) => {
      const normalizedKey = normalizeValue(key)
      const normalizedRating = normalizeRating(value)
      if (normalizedKey && normalizedRating >= 1) {
        result[normalizedKey] = normalizedRating
      }
    })

    return result
  } catch (error) {
    console.error('parse game rating cache failed', error)
    return result
  }
}

const getRatingMap = () => {
  if (typeof window === 'undefined') {
    return {}
  }
  return parseRatingMap(window.localStorage.getItem(GAME_RATING_STORAGE_KEY))
}

const saveRatingMap = (ratingMap: Record<string, number>) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(GAME_RATING_STORAGE_KEY, JSON.stringify(ratingMap))
}

export const getGameRatingByKey = (key: string) => {
  const normalizedKey = normalizeValue(key)
  if (!normalizedKey) {
    return 0
  }

  const ratingMap = getRatingMap()
  return normalizeRating(ratingMap[normalizedKey])
}

export const setGameRatingByKey = (key: string, rating: number) => {
  const normalizedKey = normalizeValue(key)
  const normalizedRating = normalizeRating(rating)
  if (!normalizedKey || normalizedRating < 1) {
    return
  }

  const ratingMap = getRatingMap()
  ratingMap[normalizedKey] = normalizedRating
  saveRatingMap(ratingMap)
}
