const GAME_LIKE_STORAGE_KEY = 'gameLikeKeys'

const normalizeValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }
  return String(value ?? '').trim()
}

const parseLikeKeys = (rawValue: string | null) => {
  if (!rawValue) {
    return new Set<string>()
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!Array.isArray(parsedValue)) {
      return new Set<string>()
    }

    return new Set(parsedValue.map(value => normalizeValue(value)).filter(Boolean))
  } catch (error) {
    console.error('parse game like cache failed', error)
    return new Set<string>()
  }
}

const getLikeKeys = () => {
  if (typeof window === 'undefined') {
    return new Set<string>()
  }
  return parseLikeKeys(window.localStorage.getItem(GAME_LIKE_STORAGE_KEY))
}

const saveLikeKeys = (likeKeys: Set<string>) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(GAME_LIKE_STORAGE_KEY, JSON.stringify([...likeKeys]))
}

export const isGameLikedByKey = (key: string) => {
  const normalizedKey = normalizeValue(key)
  if (!normalizedKey) {
    return false
  }

  const likeKeys = getLikeKeys()
  return likeKeys.has(normalizedKey)
}

export const setGameLikedByKey = (key: string, isLiked: boolean) => {
  const normalizedKey = normalizeValue(key)
  if (!normalizedKey) {
    return
  }

  const likeKeys = getLikeKeys()
  if (isLiked) {
    likeKeys.add(normalizedKey)
  } else {
    likeKeys.delete(normalizedKey)
  }

  saveLikeKeys(likeKeys)
}
