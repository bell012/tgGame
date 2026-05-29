import Api from '@/api'
import type { QueryGameItemPageParams } from '@/api/interface/game'
import { getLanguageCode } from '@/utils/request'

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

export const resolveGameTypeDisplayNames = (
  gameTypeCode: unknown,
  gameTypeItems: Array<{ gameTypeCode?: string; gameTypeName?: string }> = [],
  fallbackName = ''
) => {
  const codes = splitGameTypeCodes(gameTypeCode)

  if (codes.length === 0) {
    return fallbackName ? [fallbackName] : []
  }

  const nameByCode = new Map<string, string>()
  gameTypeItems.forEach(item => {
    const code = normalizeGameDetailValue(item.gameTypeCode)
    const name = normalizeGameDetailValue(item.gameTypeName)

    if (code && name) {
      nameByCode.set(code.toLowerCase(), name)
    }
  })

  return codes.map(code => nameByCode.get(code.toLowerCase()) || code)
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

const GAME_DETAIL_RECOMMEND_REQUEST_OPTIONS = {
  showSuccessToast: false,
  showErrorToast: true
} as const

export const parseGameDetailJson = (raw: unknown): Record<string, unknown> => {
  if (!raw || typeof raw !== 'string') {
    return {}
  }

  const text = raw.trim()
  if (!text) {
    return {}
  }

  try {
    const parsed = JSON.parse(text) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

const hasDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return false
  }

  return String(value).trim().length > 0
}

export const resolveGameMaxWinValue = (detail: Record<string, unknown> | null | undefined) => {
  if (!detail) {
    return null
  }

  const candidates = [detail.maxWin, detail.maxWinMax, detail.maxWinMin]
  return candidates.find(hasDisplayValue) ?? null
}

export const isValidGameDetailResult = (result: unknown): result is Record<string, unknown> => {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return false
  }

  if ('status' in result && 'error' in result) {
    return false
  }

  return 'rowId' in result || 'itemCode' in result || 'itemName' in result
}

/** 合并 gameDetailJson、列表缓存与详情接口，统一 maxWin 等统计字段 */
export const normalizeGameDetailRecord = (
  ...sources: Array<Record<string, unknown> | null | undefined>
) => {
  const merged = sources.reduce<Record<string, unknown>>((acc, source) => {
    if (!source) {
      return acc
    }

    return {
      ...acc,
      ...parseGameDetailJson(source.gameDetailJson),
      ...source
    }
  }, {})

  const maxWinValue = resolveGameMaxWinValue(merged)
  if (hasDisplayValue(maxWinValue)) {
    merged.maxWin = maxWinValue
    if (!hasDisplayValue(merged.maxWinMax)) {
      merged.maxWinMax = maxWinValue
    }
  }

  return merged
}

export const queryGameDetailRecommendedItems = async () => {
  const params: QueryGameItemPageParams = {
    languageCode: getLanguageCode(),
    site: 'gifphcb9',
    param: { recommend: 1, syncChildGames: 0, syncBrandChildGames: 0, homeRecommend: 0 },
    page: { records: [], total: 0, size: 1000, current: 1 }
  }

  const res = await Api.game.queryGameItemPage(params, GAME_DETAIL_RECOMMEND_REQUEST_OPTIONS)
  return Array.isArray(res?.result?.records) ? res.result.records : []
}
