import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import i18n from '@/i18n'
import Api from '@/api'
import type { GameBrandItem, GameDataItem } from '@/api/interface/game'
import { getStorageLanguageCode } from '@/utils/locale'

interface FlattenedGameRecord {
  /** 当前节点原始数据 */
  node: GameDataItem
  /** 当前节点 rowId */
  rowId: number
  /** 父节点 rowId，顶层为 null */
  parentRowId: number | null
  /** 当前层级，顶层为 0 */
  depth: number
}

interface GameQueryOptions {
  /** 按 sysGameTypeCode 查询 */
  sysGameTypeCode?: string
  /** 按 brandCode 查询 */
  brandCode?: string
  /** 按 platformCode 查询 */
  platformCode?: string
  /** 按 hot 查询 */
  hot?: number
  /** 按 recommend 查询 */
  recommend?: number
  /** 按 rowType 查询 */
  rowType?: number
  /** 是否只返回叶子节点 */
  onlyLeaf?: boolean
  /** 是否包含命中节点的所有后代 */
  includeDescendants?: boolean
  /** 查询前是否强制刷新接口数据 */
  forceRefresh?: boolean
  /** 是否按 orderId 排序 */
  sortByOrderId?: boolean
  /** orderId 排序方向 */
  sortDirection?: 'asc' | 'desc'
  /** 页码，从 1 开始 */
  page?: number
  /** 每页条数 */
  pageSize?: number
}

interface GameQueryPageResult<T> {
  /** 当前页数据 */
  list: T[]
  /** 总条数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 总页数 */
  totalPages: number
}

interface GameBrandQueryOptions {
  /** 按 brandCode 查询 */
  brandCode?: string
  /** 按 enable 查询 */
  enable?: number
  /** 按语言查询 */
  languageCode?: string
  /** 查询前是否强制刷新接口数据 */
  forceRefresh?: boolean
  /** 页码，从 1 开始 */
  page?: number
  /** 每页条数 */
  pageSize?: number
}

export const useGameStore = defineStore('game', () => {
  /** 接口返回的原始游戏树数据 */
  const gameData = ref<GameDataItem[]>([])
  /** 接口返回的游戏品牌列表数据 */
  const brandData = ref<GameBrandItem[]>([])
  /** 当前游戏数据对应的语言 */
  const gameDataLanguageCode = ref<string | null>(null)
  /** 当前品牌数据对应的语言 */
  const brandDataLanguageCode = ref<string | null>(null)
  /** 当前是否处于请求中 */
  const isLoading = ref(false)
  /** 当前品牌列表是否处于请求中 */
  const isBrandLoading = ref(false)

  /** 并发请求复用，避免同一时间重复请求同一个接口 */
  let pendingRequest: Promise<GameDataItem[]> | null = null
  /** 并发请求复用，避免同一时间重复请求品牌列表接口 */
  let pendingBrandRequest: Promise<GameBrandItem[]> | null = null

  /** 当前是否已经有游戏数据 */
  const hasGameData = computed(() => gameData.value.length > 0)
  /** 当前是否已经有游戏品牌数据 */
  const hasBrandData = computed(() => brandData.value.length > 0)
  /** 当前界面语言 */
  const currentLanguageCode = computed(() =>
    getStorageLanguageCode(String(i18n.global.locale.value))
  )

  /** 将整棵游戏树拍平成带父子关系和层级信息的记录，便于像查表一样查询 */
  const flattenGameRecords = (
    nodes: GameDataItem[],
    parentRowId: number | null = null,
    depth = 0
  ): FlattenedGameRecord[] => {
    return nodes.flatMap(node => {
      const currentRecord: FlattenedGameRecord = {
        node,
        rowId: node.rowId,
        parentRowId,
        depth
      }

      const children = Array.isArray(node.subGame)
        ? flattenGameRecords(node.subGame, node.rowId, depth + 1)
        : []

      return [currentRecord, ...children]
    })
  }

  /** 扁平化后的全部游戏记录，附带层级和父节点信息 */
  const allGameRecords = computed(() => flattenGameRecords(gameData.value))

  /** 按 parentRowId 建立子节点索引 */
  const childGameRecordsByParentRowId = computed<Record<number, FlattenedGameRecord[]>>(() => {
    return allGameRecords.value.reduce<Record<number, FlattenedGameRecord[]>>((acc, record) => {
      if (record.parentRowId === null) {
        return acc
      }

      if (!acc[record.parentRowId]) {
        acc[record.parentRowId] = []
      }

      acc[record.parentRowId].push(record)
      return acc
    }, {})
  })

  /** 更新 store 中的游戏数据 */
  const setGameDataState = (nextGameData: GameDataItem[]) => {
    gameData.value = nextGameData
    gameDataLanguageCode.value = currentLanguageCode.value

    return gameData.value
  }

  /** 更新 store 中的品牌列表数据 */
  const setGameBrandDataState = (nextBrandData: GameBrandItem[]) => {
    brandData.value = nextBrandData
    brandDataLanguageCode.value = currentLanguageCode.value

    return brandData.value
  }

  /** 拉取最新游戏数据；默认命中有效缓存时不重复请求 */
  const refreshGameData = async (force = false) => {
    if (!force && pendingRequest) {
      return pendingRequest
    }

    if (!force && hasGameData.value) {
      return gameData.value
    }

    isLoading.value = true

    pendingRequest = (async () => {
      try {
        const response = await Api.game.getGameData()
        return setGameDataState(response?.result ?? [])
      } catch (error) {
        console.error('refreshGameData failed', error)
        return gameData.value
      } finally {
        isLoading.value = false
        pendingRequest = null
      }
    })()

    return pendingRequest
  }

  /** 拉取最新品牌列表数据；默认命中有效缓存时不重复请求 */
  const refreshGameBrandData = async (force = false) => {
    if (!force && pendingBrandRequest) {
      return pendingBrandRequest
    }

    if (!force && hasBrandData.value) {
      return brandData.value
    }

    isBrandLoading.value = true

    pendingBrandRequest = (async () => {
      try {
        const response = await Api.game.getGameBrandData()
        return setGameBrandDataState(response?.result ?? [])
      } catch (error) {
        console.error('refreshGameBrandData failed', error)
        return brandData.value
      } finally {
        isBrandLoading.value = false
        pendingBrandRequest = null
      }
    })()

    return pendingBrandRequest
  }

  /** 优先使用内存数据，没有时再请求接口 */
  const ensureGameData = async () => {
    if (hasGameData.value && gameDataLanguageCode.value === currentLanguageCode.value) {
      return gameData.value
    }

    return refreshGameData(true)
  }

  /** 优先使用内存数据，没有时再请求品牌列表接口 */
  const ensureGameBrandData = async () => {
    if (hasBrandData.value && brandDataLanguageCode.value === currentLanguageCode.value) {
      return brandData.value
    }

    return refreshGameBrandData(true)
  }

  /** 递归获取指定 rowId 节点下的所有后代记录 */
  const getDescendantGameRecordsByRowId = (rowId: number): FlattenedGameRecord[] => {
    const children = childGameRecordsByParentRowId.value[rowId] ?? []

    return children.flatMap(child => [child, ...getDescendantGameRecordsByRowId(child.rowId)])
  }

  /** 根据条件过滤扁平记录，像查询表一样使用 */
  const queryGameRecords = (options: GameQueryOptions = {}) => {
    const filteredRecords = allGameRecords.value.filter(record => {
      const { node } = record

      if (
        options.sysGameTypeCode &&
        node.sysGameTypeCode?.trim() !== options.sysGameTypeCode.trim()
      ) {
        return false
      }

      if (options.brandCode && node.brandCode?.trim() !== options.brandCode.trim()) {
        return false
      }

      if (options.platformCode && node.platformCode?.trim() !== options.platformCode.trim()) {
        return false
      }

      if (options.hot !== undefined && (node.hot ?? 0) !== options.hot) {
        return false
      }

      if (options.recommend !== undefined && (node.recommend ?? 0) !== options.recommend) {
        return false
      }

      if (options.rowType !== undefined && (node.rowType ?? 0) !== options.rowType) {
        return false
      }

      if (options.onlyLeaf && Array.isArray(node.subGame) && node.subGame.length > 0) {
        return false
      }

      return true
    })

    if (!options.includeDescendants) {
      if (!options.sortByOrderId) {
        return filteredRecords
      }

      const sortDirection = options.sortDirection ?? 'asc'

      return [...filteredRecords].sort((a, b) => {
        const orderA = a.node.orderId ?? 0
        const orderB = b.node.orderId ?? 0

        return sortDirection === 'desc' ? orderB - orderA : orderA - orderB
      })
    }

    const mergedRecordMap = new Map<number, FlattenedGameRecord>()

    filteredRecords.forEach(record => {
      mergedRecordMap.set(record.rowId, record)
      getDescendantGameRecordsByRowId(record.rowId).forEach(descendant => {
        mergedRecordMap.set(descendant.rowId, descendant)
      })
    })

    const mergedRecords = [...mergedRecordMap.values()]

    if (!options.sortByOrderId) {
      return mergedRecords
    }

    const sortDirection = options.sortDirection ?? 'asc'

    return mergedRecords.sort((a, b) => {
      const orderA = a.node.orderId ?? 0
      const orderB = b.node.orderId ?? 0

      return sortDirection === 'desc' ? orderB - orderA : orderA - orderB
    })
  }

  /** 根据条件查询游戏节点，只返回原始节点数据 */
  const queryGameData = async (options: GameQueryOptions = {}) => {
    if (options.forceRefresh) {
      await refreshGameData(true)
    } else {
      await ensureGameData()
    }

    return queryGameRecords(options).map(record => record.node)
  }

  /** 根据条件分页查询扁平记录 */
  const queryGameRecordsPage = (
    options: GameQueryOptions = {}
  ): GameQueryPageResult<FlattenedGameRecord> => {
    const page = Math.max(1, options.page ?? 1)
    const pageSize = Math.max(1, options.pageSize ?? 20)
    const recordList = queryGameRecords(options)
    const total = recordList.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const startIndex = (page - 1) * pageSize
    const list = recordList.slice(startIndex, startIndex + pageSize)

    return {
      list,
      total,
      page,
      pageSize,
      totalPages
    }
  }

  /** 根据条件分页查询游戏节点，只返回原始节点数据 */
  const queryGameDataPage = async (
    options: GameQueryOptions = {}
  ): Promise<GameQueryPageResult<GameDataItem>> => {
    await ensureGameData()
    const pageResult = queryGameRecordsPage(options)

    return {
      ...pageResult,
      list: pageResult.list.map(record => record.node)
    }
  }

  /** 根据条件查询品牌数据 */
  const queryGameBrandData = async (options: GameBrandQueryOptions = {}) => {
    if (options.forceRefresh) {
      await refreshGameBrandData(true)
    } else {
      await ensureGameBrandData()
    }

    return brandData.value.filter(item => {
      if (options.brandCode && item.brandCode?.trim() !== options.brandCode.trim()) {
        return false
      }

      if (options.enable !== undefined && item.enable !== options.enable) {
        return false
      }

      if (options.languageCode && item.languageCode?.trim() !== options.languageCode.trim()) {
        return false
      }

      return true
    })
  }

  /** 根据条件分页查询品牌数据 */
  const queryGameBrandDataPage = async (
    options: GameBrandQueryOptions = {}
  ): Promise<GameQueryPageResult<GameBrandItem>> => {
    const page = Math.max(1, options.page ?? 1)
    const pageSize = Math.max(1, options.pageSize ?? 20)
    const list = await queryGameBrandData(options)
    const total = list.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const startIndex = (page - 1) * pageSize

    return {
      list: list.slice(startIndex, startIndex + pageSize),
      total,
      page,
      pageSize,
      totalPages
    }
  }

  return {
    queryGameData,
    queryGameRecordsPage,
    queryGameDataPage,
    queryGameBrandData,
    queryGameBrandDataPage
  }
})
