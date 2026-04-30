import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import i18n from '@/i18n'
import Api from '@/api'
import type { GameBrandItem, GameDataItem, GameTypeItem } from '@/api/interface/game'
import { useLocaleStore } from '@/stores/locale'
import { getStorageLanguageCode } from '@/utils/locale'

const SEARCH_HISTORY_STORAGE_KEY = 'casino_search_history'

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

export interface GameQueryOptions {
  /** 按关键字模糊匹配 */
  keyword?: string
  /** 按 gameTypeCode 查询，支持逗号分隔多个值 */
  gameTypeCode?: string
  /** 按 sysGameTypeCode 查询 */
  sysGameTypeCode?: string
  /** 按多个 sysGameTypeCode 查询 */
  sysGameTypeCodes?: string[]
  /** 按 brandCode 查询 */
  brandCode?: string
  /** 按多个 brandCode 查询 */
  brandCodes?: string[]
  /** 按 platformCode 查询 */
  platformCode?: string
  /** 按多个 platformCode 查询 */
  platformCodes?: string[]
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
  /** 是否按 platformName 排序 */
  sortByPlatformName?: boolean
  /** 是否按 itemName 排序 */
  sortByItemName?: boolean
  /** 是否按 hotOrderId 降序排序 */
  sortByHotOrderId?: boolean
  /** orderId 排序方向，默认 desc */
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
  /** 按关键字模糊匹配 */
  keyword?: string
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

export interface GamePlatformOption {
  platformCode: string
  platformName: string
  icon4: string
}

interface PendingLanguageRequest<T> {
  id: symbol
  languageCode: string
  promise: Promise<T[]>
}

export const useGameStore = defineStore('game', () => {
  const localeStore = useLocaleStore()
  /** 接口返回的原始游戏树数据 */
  const gameData = ref<GameDataItem[]>([])
  /** 接口返回的游戏品牌列表数据 */
  const brandData = ref<GameBrandItem[]>([])
  /** 接口返回的自定义游戏类型数据 */
  const gameTypeData = ref<GameTypeItem[]>([])
  /** /gc/queryGameItemPage 返回的热门游戏数据 */
  const hotGameData = ref<GameDataItem[]>([])
  /** 当前游戏数据对应的语言 */
  const gameDataLanguageCode = ref<string | null>(null)
  /** 当前品牌数据对应的语言 */
  const brandDataLanguageCode = ref<string | null>(null)
  /** 当前游戏类型数据对应的语言 */
  const gameTypeDataLanguageCode = ref<string | null>(null)
  /** 当前热门游戏数据对应的语言 */
  const hotGameDataLanguageCode = ref<string | null>(null)
  /** 当前是否处于请求中 */
  const isLoading = ref(false)
  /** 当前品牌列表是否处于请求中 */
  const isBrandLoading = ref(false)
  /** 当前游戏类型列表是否处于请求中 */
  const isGameTypeLoading = ref(false)
  /** 搜索历史 */
  const searchHistory = ref<string[]>([])

  /** 并发请求复用，避免同一时间重复请求同一个接口 */
  let pendingRequest: PendingLanguageRequest<GameDataItem> | null = null
  /** 并发请求复用，避免同一时间重复请求品牌列表接口 */
  let pendingBrandRequest: PendingLanguageRequest<GameBrandItem> | null = null
  /** 并发请求复用，避免同一时间重复请求游戏类型接口 */
  let pendingGameTypeRequest: PendingLanguageRequest<GameTypeItem> | null = null
  /** 并发请求复用，避免同一时间重复请求热门游戏分页接口 */
  let pendingHotGameRequest: PendingLanguageRequest<GameDataItem> | null = null
  /** 并发请求复用，避免同一时间重复触发热门游戏后台补齐 */
  let pendingHotGameHydrationRequest: PendingLanguageRequest<GameDataItem> | null = null

  /** 当前是否已经有游戏数据 */
  const hasGameData = computed(() => gameData.value.length > 0)
  /** 当前是否已经有游戏品牌数据 */
  const hasBrandData = computed(() => brandData.value.length > 0)
  /** 当前是否已经有游戏类型数据 */
  const hasGameTypeData = computed(() => gameTypeData.value.length > 0)
  /** 当前是否已经有热门游戏数据 */
  const hasHotGameData = computed(() => hotGameData.value.length > 0)
  /** 当前界面语言 */
  const currentLanguageCode = computed(() =>
    getStorageLanguageCode(String(i18n.global.locale.value))
  )
  /** 当前字符串排序使用的 locale */
  const currentCompareLocale = computed(() => {
    return localeStore.currentLanguage === 'zh' ? 'zh-Hans-CN' : 'en'
  })

  /** 持久化搜索历史 */
  const persistSearchHistory = () => {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(searchHistory.value))
  }

  /** 从本地恢复搜索历史 */
  const loadSearchHistory = () => {
    const storedSearchHistory = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY)

    if (!storedSearchHistory) {
      searchHistory.value = []
      return searchHistory.value
    }

    try {
      const parsedHistory = JSON.parse(storedSearchHistory)

      if (!Array.isArray(parsedHistory)) {
        searchHistory.value = []
        return searchHistory.value
      }

      searchHistory.value = parsedHistory
        .map(item => String(item ?? '').trim())
        .filter(Boolean)
        .slice(0, 10)
    } catch (error) {
      console.error('loadSearchHistory failed', error)
      searchHistory.value = []
    }

    return searchHistory.value
  }

  /** 新增一条搜索历史，自动去重并按最近时间排序 */
  const addSearchHistory = (keyword: string) => {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword) {
      return searchHistory.value
    }

    searchHistory.value = [
      normalizedKeyword,
      ...searchHistory.value.filter(
        item => item.trim().toLowerCase() !== normalizedKeyword.toLowerCase()
      )
    ].slice(0, 10)

    persistSearchHistory()
    return searchHistory.value
  }

  /** 删除单条搜索历史 */
  const removeSearchHistory = (keyword: string) => {
    searchHistory.value = searchHistory.value.filter(item => item !== keyword)
    persistSearchHistory()
    return searchHistory.value
  }

  /** 清空搜索历史 */
  const clearSearchHistory = () => {
    searchHistory.value = []
    persistSearchHistory()
    return searchHistory.value
  }

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

  /** 更新 store 中的游戏数据 */
  const toNumber = (value: unknown, fallback = 0) => {
    const nextValue = Number(value)
    return Number.isFinite(nextValue) ? nextValue : fallback
  }

  const setGameDataState = (
    nextGameData: GameDataItem[],
    languageCode = currentLanguageCode.value
  ) => {
    gameData.value = nextGameData
    gameDataLanguageCode.value = languageCode

    return gameData.value
  }

  /** 更新 store 中的品牌列表数据 */
  const normalizeGameBrandData = (nextBrandData: GameBrandItem[]) => {
    return [...nextBrandData]
      .filter(item => toNumber(item.enable) === 1)
      .sort((a, b) => {
        const sortNumA = toNumber(a.sortNum, Number.MAX_SAFE_INTEGER)
        const sortNumB = toNumber(b.sortNum, Number.MAX_SAFE_INTEGER)

        return sortNumA - sortNumB
      })
  }

  /** 更新 store 中的品牌列表数据 */
  const setGameBrandDataState = (
    nextBrandData: GameBrandItem[],
    languageCode = currentLanguageCode.value
  ) => {
    brandData.value = normalizeGameBrandData(nextBrandData)
    brandDataLanguageCode.value = languageCode

    return brandData.value
  }

  /** 更新 store 中的游戏类型数据 */
  const normalizeGameTypeData = (nextGameTypeData: GameTypeItem[]) => {
    return [...nextGameTypeData]
      .filter(item => toNumber(item.enable) === 1)
      .sort((a, b) => {
        const sortNumA = toNumber(a.sortNum, Number.MAX_SAFE_INTEGER)
        const sortNumB = toNumber(b.sortNum, Number.MAX_SAFE_INTEGER)

        return sortNumA - sortNumB
      })
  }

  /** 更新 store 中的游戏类型数据 */
  const setGameTypeDataState = (
    nextGameTypeData: GameTypeItem[],
    languageCode = currentLanguageCode.value
  ) => {
    gameTypeData.value = normalizeGameTypeData(nextGameTypeData)
    gameTypeDataLanguageCode.value = languageCode

    return gameTypeData.value
  }

  /** 更新 store 中的热门游戏数据 */
  const setHotGameDataState = (
    nextHotGameData: GameDataItem[],
    languageCode = currentLanguageCode.value
  ) => {
    hotGameData.value = nextHotGameData
    hotGameDataLanguageCode.value = languageCode

    return hotGameData.value
  }

  const HOT_GAME_PAGE_SIZE = 100
  /** 目的：统一热门页查询参数；策略：与 /casino/hot_games 场景保持一致 */
  const HOT_GAME_QUERY_PARAM = {
    rowType: 3,
    hot: 1,
    syncChildGames: 0,
    syncBrandChildGames: 0,
    homeRecommend: 0
  } as const

  const queryHotGameItemPage = async (currentPage: number, pageSize = HOT_GAME_PAGE_SIZE) => {
    return Api.game.queryGameItemPage({
      param: HOT_GAME_QUERY_PARAM,
      page: {
        records: [],
        total: 0,
        size: pageSize,
        current: currentPage
      }
    })
  }

  const resolveTotalPages = (pages: unknown, total: unknown, pageSize: number) => {
    const responsePages = Number(pages ?? 0)
    if (responsePages > 0) {
      return responsePages
    }

    const responseTotal = Number(total ?? 0)
    return Math.max(1, Math.ceil(responseTotal / Math.max(1, pageSize)))
  }

  /** 拉取最新游戏数据；默认命中有效缓存时不重复请求 */
  const refreshGameData = async (force = false) => {
    const requestLanguageCode = currentLanguageCode.value

    if (pendingRequest?.languageCode === requestLanguageCode) {
      return pendingRequest.promise
    }

    if (!force && hasGameData.value && gameDataLanguageCode.value === requestLanguageCode) {
      return gameData.value
    }

    isLoading.value = true

    const requestId = Symbol('game-data-request')
    const promise = (async () => {
      try {
        const response = await Api.game.getGameData({
          showSuccessToast: false
        })
        return setGameDataState(response?.result ?? [], requestLanguageCode)
      } catch (error) {
        console.error('refreshGameData failed', error)
        return gameData.value
      } finally {
        if (pendingRequest?.id === requestId) {
          isLoading.value = false
          pendingRequest = null
        }
      }
    })()

    const request: PendingLanguageRequest<GameDataItem> = {
      id: requestId,
      languageCode: requestLanguageCode,
      promise
    }

    pendingRequest = request
    return request.promise
  }

  /** 拉取最新品牌列表数据；默认命中有效缓存时不重复请求 */
  const refreshGameBrandData = async (force = false) => {
    const requestLanguageCode = currentLanguageCode.value

    if (pendingBrandRequest?.languageCode === requestLanguageCode) {
      return pendingBrandRequest.promise
    }

    if (!force && hasBrandData.value && brandDataLanguageCode.value === requestLanguageCode) {
      return brandData.value
    }

    isBrandLoading.value = true

    const requestId = Symbol('game-brand-request')
    const promise = (async () => {
      try {
        const response = await Api.game.getGameBrandData({
          showSuccessToast: false
        })
        return setGameBrandDataState(response?.result ?? [], requestLanguageCode)
      } catch (error) {
        console.error('refreshGameBrandData failed', error)
        return brandData.value
      } finally {
        if (pendingBrandRequest?.id === requestId) {
          isBrandLoading.value = false
          pendingBrandRequest = null
        }
      }
    })()

    const request: PendingLanguageRequest<GameBrandItem> = {
      id: requestId,
      languageCode: requestLanguageCode,
      promise
    }

    pendingBrandRequest = request
    return request.promise
  }

  /** 拉取最新自定义游戏类型数据；默认命中有效缓存时不重复请求 */
  const refreshGameTypeData = async (force = false) => {
    const requestLanguageCode = currentLanguageCode.value

    if (pendingGameTypeRequest?.languageCode === requestLanguageCode) {
      return pendingGameTypeRequest.promise
    }

    if (!force && hasGameTypeData.value && gameTypeDataLanguageCode.value === requestLanguageCode) {
      return gameTypeData.value
    }

    isGameTypeLoading.value = true

    const requestId = Symbol('game-type-request')
    const promise = (async () => {
      try {
        const response = await Api.game.getGameType({
          showSuccessToast: false
        })
        return setGameTypeDataState(response?.result ?? [], requestLanguageCode)
      } catch (error) {
        console.error('refreshGameTypeData failed', error)
        return gameTypeData.value
      } finally {
        if (pendingGameTypeRequest?.id === requestId) {
          isGameTypeLoading.value = false
          pendingGameTypeRequest = null
        }
      }
    })()

    const request: PendingLanguageRequest<GameTypeItem> = {
      id: requestId,
      languageCode: requestLanguageCode,
      promise
    }

    pendingGameTypeRequest = request
    return request.promise
  }

  const hydrateHotGameDataInBackground = (
    firstPageRecords: GameDataItem[],
    totalPages: number,
    pageSize: number,
    languageCode: string
  ) => {
    if (totalPages <= 1) {
      return
    }

    if (pendingHotGameHydrationRequest?.languageCode === languageCode) {
      return
    }

    const requestId = Symbol('hot-game-data-hydration-request')
    const promise = (async () => {
      const mergedRecords = [...firstPageRecords]
      try {
        // 策略：从第 2 页开始后台补齐；边界：不阻塞首屏返回
        for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
          const response = await queryHotGameItemPage(currentPage, pageSize)

          const pageRecords = Array.isArray(response?.result?.records)
            ? response.result.records
            : []
          mergedRecords.push(...pageRecords)
        }

        return setHotGameDataState(mergedRecords, languageCode)
      } catch (error) {
        console.error('hydrateHotGameDataInBackground failed', error)
        return hotGameData.value
      } finally {
        if (pendingHotGameHydrationRequest?.id === requestId) {
          pendingHotGameHydrationRequest = null
        }
      }
    })()

    pendingHotGameHydrationRequest = {
      id: requestId,
      languageCode,
      promise
    }

    void promise
  }

  /** 拉取热门游戏分页数据，首屏优先返回并在后台补齐其余分页 */
  const refreshHotGameData = async (force = false) => {
    const requestLanguageCode = currentLanguageCode.value

    if (pendingHotGameRequest?.languageCode === requestLanguageCode) {
      return pendingHotGameRequest.promise
    }

    if (!force && hasHotGameData.value && hotGameDataLanguageCode.value === requestLanguageCode) {
      return hotGameData.value
    }

    const requestId = Symbol('hot-game-data-request')
    const promise = (async () => {
      try {
        const pageSize = HOT_GAME_PAGE_SIZE
        // 策略：第一页优先返回；边界：剩余分页异步补齐
        const response = await queryHotGameItemPage(1, pageSize)
        const pageResult = response?.result
        const firstPageRecords = Array.isArray(pageResult?.records) ? pageResult.records : []
        const totalPages = resolveTotalPages(
          pageResult?.pages,
          pageResult?.total ?? firstPageRecords.length,
          pageSize
        )

        const firstPageData = setHotGameDataState(firstPageRecords, requestLanguageCode)
        hydrateHotGameDataInBackground(firstPageRecords, totalPages, pageSize, requestLanguageCode)
        return firstPageData
      } catch (error) {
        console.error('refreshHotGameData failed', error)
        return hotGameData.value
      } finally {
        if (pendingHotGameRequest?.id === requestId) {
          pendingHotGameRequest = null
        }
      }
    })()

    const request: PendingLanguageRequest<GameDataItem> = {
      id: requestId,
      languageCode: requestLanguageCode,
      promise
    }

    pendingHotGameRequest = request
    return request.promise
  }

  /** 优先使用内存数据，没有时再请求接口 */
  const ensureGameData = async () => {
    if (hasGameData.value && gameDataLanguageCode.value === currentLanguageCode.value) {
      return gameData.value
    }

    if (pendingRequest?.languageCode === currentLanguageCode.value) {
      return pendingRequest.promise
    }

    return refreshGameData(true)
  }

  /** 优先使用内存数据，没有时再请求品牌列表接口 */
  const ensureGameBrandData = async () => {
    if (hasBrandData.value && brandDataLanguageCode.value === currentLanguageCode.value) {
      return brandData.value
    }

    if (pendingBrandRequest?.languageCode === currentLanguageCode.value) {
      return pendingBrandRequest.promise
    }

    return refreshGameBrandData(true)
  }

  /** 优先使用内存数据，没有时再请求游戏类型接口 */
  const ensureGameTypeData = async () => {
    if (hasGameTypeData.value && gameTypeDataLanguageCode.value === currentLanguageCode.value) {
      return gameTypeData.value
    }

    if (pendingGameTypeRequest?.languageCode === currentLanguageCode.value) {
      return pendingGameTypeRequest.promise
    }

    return refreshGameTypeData(true)
  }

  /** 优先使用内存中的热门游戏数据，没有时再请求分页接口 */
  const ensureHotGameData = async () => {
    if (hasHotGameData.value && hotGameDataLanguageCode.value === currentLanguageCode.value) {
      return hotGameData.value
    }

    if (pendingHotGameRequest?.languageCode === currentLanguageCode.value) {
      return pendingHotGameRequest.promise
    }

    return refreshHotGameData(true)
  }

  /** 根据条件过滤扁平记录，像查询表一样使用 */
  const queryGameRecordsFromNodes = (nodes: GameDataItem[], options: GameQueryOptions = {}) => {
    const sourceRecords = flattenGameRecords(nodes)
    const childRecordsByParentRowId = sourceRecords.reduce<Record<number, FlattenedGameRecord[]>>(
      (acc, record) => {
        if (record.parentRowId === null) {
          return acc
        }

        if (!acc[record.parentRowId]) {
          acc[record.parentRowId] = []
        }

        acc[record.parentRowId].push(record)
        return acc
      },
      {}
    )

    const getSourceDescendantGameRecordsByRowId = (rowId: number): FlattenedGameRecord[] => {
      const children = childRecordsByParentRowId[rowId] ?? []

      return children.flatMap(child => [
        child,
        ...getSourceDescendantGameRecordsByRowId(child.rowId)
      ])
    }
    const normalizedGameTypeCodes = String(options.gameTypeCode ?? '')
      .split(',')
      .map(code => code.trim())
      .filter(Boolean)

    const sortRecords = (records: FlattenedGameRecord[]) => {
      if (
        !options.sortByHotOrderId &&
        !options.sortByPlatformName &&
        !options.sortByItemName &&
        !options.sortByOrderId
      ) {
        return records
      }

      const sortDirection = options.sortDirection ?? 'asc'

      return [...records].sort((a, b) => {
        if (options.sortByHotOrderId) {
          const hotOrderA =
            typeof a.node.hotOrderId === 'number' ? a.node.hotOrderId : Number.MIN_SAFE_INTEGER
          const hotOrderB =
            typeof b.node.hotOrderId === 'number' ? b.node.hotOrderId : Number.MIN_SAFE_INTEGER
          const hotOrderCompare =
            sortDirection === 'desc' ? hotOrderB - hotOrderA : hotOrderA - hotOrderB

          if (hotOrderCompare !== 0) {
            return hotOrderCompare
          }
        }

        if (options.sortByPlatformName) {
          const platformNameA = String(a.node.platformName ?? '').trim()
          const platformNameB = String(b.node.platformName ?? '').trim()
          const platformNameCompare = platformNameA.localeCompare(
            platformNameB,
            currentCompareLocale.value,
            {
              sensitivity: 'base'
            }
          )

          if (platformNameCompare !== 0) {
            return sortDirection === 'desc' ? -platformNameCompare : platformNameCompare
          }
        }

        if (options.sortByItemName) {
          const itemNameA = String(a.node.itemName ?? '').trim()
          const itemNameB = String(b.node.itemName ?? '').trim()
          const itemNameCompare = itemNameA.localeCompare(itemNameB, currentCompareLocale.value, {
            sensitivity: 'base'
          })

          if (itemNameCompare !== 0) {
            return sortDirection === 'desc' ? -itemNameCompare : itemNameCompare
          }
        }

        if (options.sortByOrderId) {
          const orderA = a.node.orderId ?? 0
          const orderB = b.node.orderId ?? 0
          const orderCompare = sortDirection === 'desc' ? orderB - orderA : orderA - orderB

          if (orderCompare !== 0) {
            return orderCompare
          }
        }

        return 0
      })
    }

    const filteredRecords = sourceRecords.filter(record => {
      const { node } = record
      const normalizedKeyword = options.keyword?.trim().toLowerCase()

      if (normalizedKeyword) {
        const searchableFields = [
          node.itemName,
          node.itemCode,
          node.platformName,
          node.brandCode,
          node.sysGameTypeName
        ]
          .map(field =>
            String(field ?? '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)

        const isKeywordMatched = searchableFields.some(field => field.includes(normalizedKeyword))

        if (!isKeywordMatched) {
          return false
        }
      }

      if (normalizedGameTypeCodes.length > 0) {
        const gameTypeCodes = String(node.gameTypeCode ?? '')
          .split(',')
          .map(code => code.trim())
          .filter(Boolean)

        if (
          gameTypeCodes.length === 0 ||
          !gameTypeCodes.some(code => normalizedGameTypeCodes.includes(code))
        ) {
          return false
        }
      }

      if (
        options.sysGameTypeCode &&
        node.sysGameTypeCode?.trim() !== options.sysGameTypeCode.trim()
      ) {
        return false
      }

      if (options.sysGameTypeCodes?.length) {
        const sysGameTypeCode = node.sysGameTypeCode?.trim() ?? ''
        const allowedSysGameTypeCodes = options.sysGameTypeCodes
          .map((code: string) => code.trim())
          .filter(Boolean)
        if (
          allowedSysGameTypeCodes.length > 0 &&
          !allowedSysGameTypeCodes.includes(sysGameTypeCode)
        ) {
          return false
        }
      }

      if (options.brandCode && node.brandCode?.trim() !== options.brandCode.trim()) {
        return false
      }

      if (options.brandCodes?.length) {
        const brandCode = node.brandCode?.trim() ?? ''
        const allowedBrandCodes = options.brandCodes.map(code => code.trim()).filter(Boolean)

        if (allowedBrandCodes.length > 0 && !allowedBrandCodes.includes(brandCode)) {
          return false
        }
      }

      if (options.platformCode && node.platformCode?.trim() !== options.platformCode.trim()) {
        return false
      }

      if (options.platformCodes?.length) {
        const platformCode = node.platformCode?.trim() ?? ''
        const allowedPlatformCodes = options.platformCodes.map(code => code.trim()).filter(Boolean)

        if (allowedPlatformCodes.length > 0 && !allowedPlatformCodes.includes(platformCode)) {
          return false
        }
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
      return sortRecords(filteredRecords)
    }

    const mergedRecordMap = new Map<number, FlattenedGameRecord>()

    filteredRecords.forEach(record => {
      mergedRecordMap.set(record.rowId, record)
      getSourceDescendantGameRecordsByRowId(record.rowId).forEach(descendant => {
        mergedRecordMap.set(descendant.rowId, descendant)
      })
    })

    const mergedRecords = [...mergedRecordMap.values()]

    return sortRecords(mergedRecords)
  }

  const isHotGamePageSourceQuery = (options: GameQueryOptions) => {
    return Number(options.rowType) === 3 && Number(options.hot) === 1
  }

  const resolveQuerySourceNodes = async (options: GameQueryOptions = {}) => {
    if (isHotGamePageSourceQuery(options)) {
      if (options.forceRefresh) {
        return refreshHotGameData(true)
      }

      return ensureHotGameData()
    }

    if (options.forceRefresh) {
      return refreshGameData(true)
    }

    return ensureGameData()
  }

  /** 根据条件查询游戏节点，只返回原始节点数据 */
  const queryGameData = async (options: GameQueryOptions = {}) => {
    const sourceNodes = await resolveQuerySourceNodes(options)

    return queryGameRecordsFromNodes(sourceNodes, options).map(record => record.node)
  }

  /** 根据 gameTypeCode 获取 rowType=2 的游戏平台，并按 platformCode 去重 */
  const queryGamePlatformsByGameTypeCode = async (
    gameTypeCode: string,
    options: Pick<GameQueryOptions, 'forceRefresh'> = {}
  ): Promise<GamePlatformOption[]> => {
    const normalizedGameTypeCode = gameTypeCode.trim()

    const list = await queryGameData({
      gameTypeCode: normalizedGameTypeCode,
      rowType: 2,
      forceRefresh: options.forceRefresh
    })
    const sortedList = [...list].sort((a, b) => {
      const orderIdA = Number(a.orderId ?? Number.MAX_SAFE_INTEGER)
      const orderIdB = Number(b.orderId ?? Number.MAX_SAFE_INTEGER)

      return orderIdA - orderIdB
    })
    const platformMap = new Map<string, GamePlatformOption>()

    sortedList.forEach(item => {
      const platformCode = String(item.platformCode ?? '').trim()

      if (!platformCode || platformMap.has(platformCode)) {
        return
      }

      platformMap.set(platformCode, {
        platformCode,
        platformName: String(item.platformName ?? '').trim(),
        icon4: String(item.icon4 ?? '').trim()
      })
    })

    return [...platformMap.values()]
  }

  /** 根据条件分页查询扁平记录 */
  const queryGameRecordsPage = (
    options: GameQueryOptions = {},
    sourceNodes: GameDataItem[] = gameData.value
  ): GameQueryPageResult<FlattenedGameRecord> => {
    const page = Math.max(1, options.page ?? 1)
    const pageSize = Math.max(1, options.pageSize ?? 20)
    const recordList = queryGameRecordsFromNodes(sourceNodes, options)
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
    const sourceNodes = await resolveQuerySourceNodes(options)
    const pageResult = queryGameRecordsPage(options, sourceNodes)

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
      const normalizedKeyword = options.keyword?.trim().toLowerCase()

      if (normalizedKeyword) {
        const searchableFields = [item.brandName, item.brandCode]
          .map(field =>
            String(field ?? '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)

        const isKeywordMatched = searchableFields.some(field => field.includes(normalizedKeyword))

        if (!isKeywordMatched) {
          return false
        }
      }

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

  /** 获取自定义游戏类型 */
  const getGameTypeData = async (forceRefresh = false) => {
    if (forceRefresh) {
      return normalizeGameTypeData(await refreshGameTypeData(true))
    }

    return normalizeGameTypeData(await ensureGameTypeData())
  }

  return {
    searchHistory,
    loadSearchHistory,
    addSearchHistory,
    removeSearchHistory,
    clearSearchHistory,
    refreshGameData,
    refreshGameBrandData,
    refreshGameTypeData,
    queryGameData,
    queryGamePlatformsByGameTypeCode,
    queryGameRecordsPage,
    queryGameDataPage,
    queryGameBrandData,
    queryGameBrandDataPage,
    getGameTypeData
  }
})
