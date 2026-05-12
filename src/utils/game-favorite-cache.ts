const normalizeValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }
  return String(value ?? '').trim()
}

type GameFavoriteKeyPayload = {
  rowId?: unknown
  itemCode?: unknown
  platformCode?: unknown
}

/**
 * 详情页点赞/评分等本地缓存用的稳定键（与收藏无关）。
 * 优先 rowId；否则 itemCode + platformCode。
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
