const GAME_FAVORITE_STORAGE_KEY = 'gameFavoriteKeys'

const normalizeValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }
  return String(value ?? '').trim()
}

const parseFavoriteKeys = (rawValue: string | null) => {
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
    console.error('parse game favorite cache failed', error)
    return new Set<string>()
  }
}

const getFavoriteKeys = () => {
  if (typeof window === 'undefined') {
    return new Set<string>()
  }
  return parseFavoriteKeys(window.localStorage.getItem(GAME_FAVORITE_STORAGE_KEY))
}

const saveFavoriteKeys = (favoriteKeys: Set<string>) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(GAME_FAVORITE_STORAGE_KEY, JSON.stringify([...favoriteKeys]))
}

type GameFavoriteKeyPayload = {
  rowId?: unknown
  itemCode?: unknown
  platformCode?: unknown
}

/**
 * 优先使用 rowId 作为收藏键；若不存在则回退到 itemCode+platformCode。
 */
export const createGameFavoriteKey = ({
  rowId,
  itemCode,
  platformCode
}: GameFavoriteKeyPayload) => {
  const normalizedRowId = normalizeValue(rowId)
  if (normalizedRowId) {
    return `rowId:${normalizedRowId}`
  }

  const normalizedItemCode = normalizeValue(itemCode)
  const normalizedPlatformCode = normalizeValue(platformCode)
  if (normalizedItemCode && normalizedPlatformCode) {
    return `itemCode:${normalizedItemCode}|platformCode:${normalizedPlatformCode}`
  }

  return ''
}

export const isGameFavoritedByKey = (key: string) => {
  const normalizedKey = normalizeValue(key)
  if (!normalizedKey) {
    return false
  }
  const favoriteKeys = getFavoriteKeys()
  return favoriteKeys.has(normalizedKey)
}

export const setGameFavoritedByKey = (key: string, isFavorited: boolean) => {
  const normalizedKey = normalizeValue(key)
  if (!normalizedKey) {
    return
  }

  const favoriteKeys = getFavoriteKeys()
  if (isFavorited) {
    favoriteKeys.add(normalizedKey)
  } else {
    favoriteKeys.delete(normalizedKey)
  }

  saveFavoriteKeys(favoriteKeys)
}
