export interface GameDetailHotItem {
  rowId?: string | number
  itemCode?: string | number
  platformCode?: string
  gameTypeCode?: string
  sysGameTypeCode?: string
  hot?: number | string
  subGame?: GameDetailHotItem[]
  gameItemHotVo?: {
    hot?: number | string
  }
  [key: string]: unknown
}

export const normalizeGameDetailValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim()
  }

  return String(value ?? '').trim()
}

export const splitGameTypeCodes = (value: unknown) => {
  return String(value ?? '')
    .split(',')
    .map(code => code.trim())
    .filter(Boolean)
}

export const isGameDetailHotItem = (game: GameDetailHotItem) => {
  const hotValue = game.gameItemHotVo?.hot ?? game.hot
  return Number(hotValue) === 1
}

export const flattenGameDetailLeafItems = (
  nodes: GameDetailHotItem[] = []
): GameDetailHotItem[] => {
  return nodes.flatMap(node => {
    const subGameList = Array.isArray(node?.subGame) ? node.subGame : []

    if (subGameList.length === 0) {
      return [node]
    }

    return flattenGameDetailLeafItems(subGameList)
  })
}

export const findGameDetailItemByIdentity = (
  nodes: GameDetailHotItem[],
  options: {
    rowId?: string
    itemCode?: string
    platformCode?: string
  }
) => {
  const targetRowId = normalizeGameDetailValue(options.rowId)
  const targetItemCode = normalizeGameDetailValue(options.itemCode)
  const targetPlatformCode = normalizeGameDetailValue(options.platformCode)
  const leafItems = flattenGameDetailLeafItems(nodes)

  if (targetRowId) {
    const matchedByRowId = leafItems.find(
      item => normalizeGameDetailValue(item.rowId) === targetRowId
    )

    if (matchedByRowId) {
      return matchedByRowId
    }
  }

  if (!targetItemCode || !targetPlatformCode) {
    return null
  }

  return (
    leafItems.find(item => {
      return (
        normalizeGameDetailValue(item.itemCode) === targetItemCode &&
        normalizeGameDetailValue(item.platformCode) === targetPlatformCode
      )
    }) ?? null
  )
}

export const resolveGameDetailHotList = (
  nodes: GameDetailHotItem[],
  options: {
    gameTypeCode?: string
    sysGameTypeCode?: string
    excludeRowId?: string
  }
) => {
  const targetGameTypeCode = normalizeGameDetailValue(options.gameTypeCode)
  const targetSysGameTypeCode = normalizeGameDetailValue(options.sysGameTypeCode)
  const excludeRowId = normalizeGameDetailValue(options.excludeRowId)
  const leafItems = flattenGameDetailLeafItems(nodes)

  const buildResult = (matcher: (item: GameDetailHotItem) => boolean) => {
    return leafItems.filter(item => {
      if (!isGameDetailHotItem(item)) {
        return false
      }

      if (excludeRowId && normalizeGameDetailValue(item.rowId) === excludeRowId) {
        return false
      }

      return matcher(item)
    })
  }

  if (targetGameTypeCode) {
    const matchedByGameType = buildResult(item =>
      splitGameTypeCodes(item.gameTypeCode).includes(targetGameTypeCode)
    )

    if (matchedByGameType.length > 0) {
      return matchedByGameType
    }
  }

  if (targetSysGameTypeCode) {
    return buildResult(
      item => normalizeGameDetailValue(item.sysGameTypeCode) === targetSysGameTypeCode
    )
  }

  return []
}
