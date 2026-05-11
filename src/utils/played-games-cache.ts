export const PLAYED_GAMES_STORAGE_KEY = 'PlayedGamesMaxLength50'
const PLAYED_GAMES_MAX_LENGTH = 50

type PlayedGameDetail = Record<string, unknown>

const normalizeValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }
  return String(value ?? '').trim()
}

const isRecord = (value: unknown): value is PlayedGameDetail => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const parsePlayedGames = (rawValue: string | null): PlayedGameDetail[] => {
  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isRecord)
  } catch (error) {
    console.error('parse played games cache failed', error)
    return []
  }
}

const createPlayedGameKey = (gameDetail: PlayedGameDetail) => {
  const rowId = normalizeValue(gameDetail.rowId)
  if (rowId) {
    return `rowId:${rowId}`
  }

  const itemCode = normalizeValue(gameDetail.itemCode)
  const platformCode = normalizeValue(gameDetail.platformCode)
  if (itemCode && platformCode) {
    return `itemCode:${itemCode}|platformCode:${platformCode}`
  }

  return ''
}

const cloneGameDetail = (gameDetail: PlayedGameDetail) => {
  return JSON.parse(JSON.stringify(gameDetail)) as PlayedGameDetail
}

export const savePlayedGameDetail = (gameDetail: unknown) => {
  if (typeof window === 'undefined' || !isRecord(gameDetail)) {
    return
  }

  const nextGameDetail = cloneGameDetail(gameDetail)
  const nextGameKey = createPlayedGameKey(nextGameDetail)
  const storedGames = parsePlayedGames(window.localStorage.getItem(PLAYED_GAMES_STORAGE_KEY))
  const dedupedGames = nextGameKey
    ? storedGames.filter(game => createPlayedGameKey(game) !== nextGameKey)
    : storedGames
  const nextGames = [nextGameDetail, ...dedupedGames].slice(0, PLAYED_GAMES_MAX_LENGTH)

  window.localStorage.setItem(PLAYED_GAMES_STORAGE_KEY, JSON.stringify(nextGames))
}
