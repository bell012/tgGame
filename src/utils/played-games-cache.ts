const PLAYED_GAMES_STORAGE_KEY_PREFIX = 'PlayedGamesMaxLength50:member_'
const PLAYED_GAMES_MAX_LENGTH = 50
const ACCT_INFO_STORAGE_KEY = 'acctInfo'

/** 登出时保留各账号分桶的最近玩过 rowId 列表 */
export const PLAYED_GAMES_CACHE_STORAGE_PREFIXES = [PLAYED_GAMES_STORAGE_KEY_PREFIX] as const

const parsePositiveRowId = (value: unknown): number | null => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null
}

const parseMemberRowIdFromStorage = (): number | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(ACCT_INFO_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as { memberRowId?: unknown }
    return parsePositiveRowId(parsed?.memberRowId)
  } catch (error) {
    console.error('parse played games memberRowId failed', error)
    return null
  }
}

const resolvePlayedGamesStorageKey = (memberRowId: number) => {
  return `${PLAYED_GAMES_STORAGE_KEY_PREFIX}${memberRowId}`
}

const parseRowIdArray = (rawValue: string | null): number[] => {
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    const ids: number[] = []
    for (const item of parsed) {
      const id = parsePositiveRowId(item)
      if (id != null) {
        ids.push(id)
      }
    }
    return ids
  } catch (error) {
    console.error('parse played games rowId list failed', error)
    return []
  }
}

/** 成功进入游戏前写入；未登录（无 memberRowId）不写入 */
export const savePlayedGameRowId = (rowId: unknown) => {
  if (typeof window === 'undefined') {
    return
  }

  const memberRowId = parseMemberRowIdFromStorage()
  const gameRowId = parsePositiveRowId(rowId)
  if (memberRowId == null || gameRowId == null) {
    return
  }

  const storageKey = resolvePlayedGamesStorageKey(memberRowId)
  const storedRowIds = parseRowIdArray(window.localStorage.getItem(storageKey))
  const dedupedRowIds = storedRowIds.filter(id => id !== gameRowId)
  const nextRowIds = [gameRowId, ...dedupedRowIds].slice(0, PLAYED_GAMES_MAX_LENGTH)

  window.localStorage.setItem(storageKey, JSON.stringify(nextRowIds))
}

/** 读取当前登录账号的最近玩过 rowId（新→旧） */
export const readPlayedRowIdsFromStorage = (): number[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const memberRowId = parseMemberRowIdFromStorage()
  if (memberRowId == null) {
    return []
  }

  return parseRowIdArray(window.localStorage.getItem(resolvePlayedGamesStorageKey(memberRowId)))
}
