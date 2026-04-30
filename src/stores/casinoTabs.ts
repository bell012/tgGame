import { computed, ref, type Component } from 'vue'
import { defineStore } from 'pinia'
import i18n from '@/i18n'
import type { GameBrandItem, GameDataItem, GameTypeItem } from '@/api/interface/game'
import { useGameStore } from '@/stores/game'
import { casinoIcons } from '@/static/svg/casino'
import { getStorageLanguageCode } from '@/utils/locale'

export interface CasinoTabButtonItem {
  sysGameTypeCode: string
  sysGameTypeName: string
  icon: string | Component
  iconSelect: string | Component
}

export interface CasinoLobbyButtonItem extends CasinoTabButtonItem {
  items?: GameDataItem[]
  brandItems?: GameBrandItem[]
}

interface GameDataPageFallback {
  list: GameDataItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface GameBrandPageFallback {
  list: GameBrandItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface PendingCasinoTabsRequest<T> {
  id: symbol
  languageCode: string
  promise: Promise<T[]>
}

const readSettledValue = <T>(
  settled: PromiseSettledResult<T>,
  errorMessage: string,
  fallback: T
) => {
  if (settled.status === 'fulfilled') {
    return settled.value
  }

  console.error(errorMessage, settled.reason)
  return fallback
}

const GAME_DATA_PAGE_FALLBACK: GameDataPageFallback = {
  list: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 1
}

const GAME_BRAND_PAGE_FALLBACK: GameBrandPageFallback = {
  list: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 1
}

export const useCasinoTabsStore = defineStore('casinoTabs', () => {
  const gameStore = useGameStore()
  const gameTypeList = ref<GameTypeItem[]>([])
  const lobbyGameMap = ref<Record<string, GameDataItem[]>>({})
  const lobbyBrandMap = ref<Record<string, GameBrandItem[]>>({})
  const hasTabButtonsLoaded = ref(false)
  const hasLobbyButtonsLoaded = ref(false)
  const isLobbyButtonsLoading = ref(false)
  const loadedTabLanguageCode = ref<string | null>(null)
  const loadedLobbyLanguageCode = ref<string | null>(null)
  let pendingTabButtonsRequest: PendingCasinoTabsRequest<CasinoTabButtonItem> | null = null
  let pendingLobbyButtonsRequest: PendingCasinoTabsRequest<CasinoLobbyButtonItem> | null = null

  const currentLanguageCode = computed(() =>
    getStorageLanguageCode(String(i18n.global.locale.value))
  )

  const buildBaseTabButtons = (): CasinoTabButtonItem[] => [
    {
      sysGameTypeCode: '',
      sysGameTypeName: i18n.global.t('casino.lobby'),
      icon: casinoIcons.lobby,
      iconSelect: casinoIcons.lobby
    },
    {
      sysGameTypeCode: 'hot_games',
      sysGameTypeName: i18n.global.t('casino.hot_games'),
      icon: casinoIcons.hot_games,
      iconSelect: casinoIcons.hot_games
    }
  ]

  const lobbyButtons = computed<CasinoLobbyButtonItem[]>(() => {
    const buttons: CasinoTabButtonItem[] = buildBaseTabButtons()
    const seenSysGameTypeCodes = new Set(buttons.map(item => item.sysGameTypeCode))

    gameTypeList.value.forEach((item: GameTypeItem) => {
      const sysGameTypeCode = item.gameTypeCode?.trim()
      const sysGameTypeName = item.gameTypeName?.trim()

      if (!sysGameTypeCode || !sysGameTypeName || seenSysGameTypeCodes.has(sysGameTypeCode)) {
        return
      }

      seenSysGameTypeCodes.add(sysGameTypeCode)

      buttons.push({
        sysGameTypeCode,
        sysGameTypeName,
        icon: `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${item.icon}`,
        iconSelect: `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${item.iconSelect}`
      })
    })

    buttons.push({
      sysGameTypeCode: 'providers',
      sysGameTypeName: i18n.global.t('sidebar_menu.casino.children.game_providers'),
      icon: casinoIcons.game_provider,
      iconSelect: casinoIcons.game_provider
    })

    return buttons.map(button => ({
      ...button,
      items: lobbyGameMap.value[button.sysGameTypeCode] ?? [],
      brandItems: lobbyBrandMap.value[button.sysGameTypeCode] ?? []
    }))
  })

  const tabButtons = computed<CasinoTabButtonItem[]>(() => [...lobbyButtons.value])

  const loadCasinoTabButtons = async (forceRefresh = false) => {
    const requestLanguageCode = currentLanguageCode.value

    if (pendingTabButtonsRequest?.languageCode === requestLanguageCode) {
      return pendingTabButtonsRequest.promise
    }

    if (
      !forceRefresh &&
      hasTabButtonsLoaded.value &&
      loadedTabLanguageCode.value === requestLanguageCode
    ) {
      return tabButtons.value
    }

    const requestId = Symbol('casino-tab-buttons-request')
    const promise = (async () => {
      const nextGameTypeList = await gameStore.getGameTypeData(forceRefresh)

      gameTypeList.value = nextGameTypeList
      hasTabButtonsLoaded.value = nextGameTypeList.length > 0
      loadedTabLanguageCode.value = nextGameTypeList.length > 0 ? requestLanguageCode : null

      return tabButtons.value
    })()

    const request: PendingCasinoTabsRequest<CasinoTabButtonItem> = {
      id: requestId,
      languageCode: requestLanguageCode,
      promise
    }
    pendingTabButtonsRequest = request

    try {
      return await promise
    } finally {
      if (pendingTabButtonsRequest?.id === requestId) {
        pendingTabButtonsRequest = null
      }
    }
  }

  const loadCasinoLobbyButtons = async (forceRefresh = false) => {
    const requestLanguageCode = currentLanguageCode.value

    if (pendingLobbyButtonsRequest?.languageCode === requestLanguageCode) {
      return pendingLobbyButtonsRequest.promise
    }

    if (
      !forceRefresh &&
      hasLobbyButtonsLoaded.value &&
      loadedLobbyLanguageCode.value === requestLanguageCode
    ) {
      return lobbyButtons.value
    }

    const requestId = Symbol('casino-lobby-buttons-request')
    const promise = (async () => {
      isLobbyButtonsLoading.value = true

      try {
        await loadCasinoTabButtons(forceRefresh)

        if (forceRefresh) {
          await Promise.all([gameStore.refreshGameData(true), gameStore.refreshGameBrandData(true)])
        }

        // 目的：主流程线性可读；策略：先组装游戏，再组装 providers
        const nextLobbyGameMap = await buildLobbyGameMap()
        const nextProviderList = await loadProvidersForLobby()

        lobbyGameMap.value = nextLobbyGameMap
        lobbyBrandMap.value = {
          providers: nextProviderList
        }
        hasLobbyButtonsLoaded.value = gameTypeList.value.length > 0
        loadedLobbyLanguageCode.value = gameTypeList.value.length > 0 ? requestLanguageCode : null

        return lobbyButtons.value
      } finally {
        if (pendingLobbyButtonsRequest?.id === requestId) {
          isLobbyButtonsLoading.value = false
        }
      }
    })()

    const request: PendingCasinoTabsRequest<CasinoLobbyButtonItem> = {
      id: requestId,
      languageCode: requestLanguageCode,
      promise
    }
    pendingLobbyButtonsRequest = request

    try {
      return await promise
    } finally {
      if (pendingLobbyButtonsRequest?.id === requestId) {
        pendingLobbyButtonsRequest = null
      }
    }
  }

  const loadHotGamesForLobby = async () => {
    const [hotGamesSettled] = await Promise.allSettled([
      gameStore.queryGameDataPage({
        hot: 1,
        sortByHotOrderId: true,
        rowType: 3,
        page: 1
      })
    ])
    const hotGamesResult = readSettledValue(
      hotGamesSettled,
      'loadCasinoLobbyButtons hot games failed',
      {
        ...GAME_DATA_PAGE_FALLBACK,
        list: lobbyGameMap.value.hot_games ?? []
      }
    )

    return hotGamesResult.list
  }

  const loadGameTypeGamesForLobby = async (nextLobbyGameMap: Record<string, GameDataItem[]>) => {
    const settledResults = await Promise.allSettled(
      gameTypeList.value.map(async item => {
        const sysGameTypeCode = item.gameTypeCode?.trim()

        if (!sysGameTypeCode || nextLobbyGameMap[sysGameTypeCode]) {
          return
        }

        const { list } = await gameStore.queryGameDataPage({
          gameTypeCode: sysGameTypeCode,
          sortByOrderId: true,
          rowType: 3,
          page: 1
        })

        nextLobbyGameMap[sysGameTypeCode] = list
      })
    )

    settledResults.forEach(result => {
      if (result.status === 'rejected') {
        // 边界：单个类型失败不阻断整个大厅渲染
        console.error('loadCasinoLobbyButtons game type list failed', result.reason)
      }
    })
  }

  const loadProvidersForLobby = async () => {
    const [providersSettled] = await Promise.allSettled([gameStore.queryGameBrandDataPage()])
    const providersResult = readSettledValue(
      providersSettled,
      'loadCasinoLobbyButtons providers failed',
      {
        ...GAME_BRAND_PAGE_FALLBACK,
        list: lobbyBrandMap.value.providers ?? []
      }
    )

    return providersResult.list
  }

  const buildLobbyGameMap = async () => {
    // 策略：先放热门，再补各游戏类型，便于定位数据来源
    const nextLobbyGameMap: Record<string, GameDataItem[]> = {
      hot_games: await loadHotGamesForLobby()
    }

    await loadGameTypeGamesForLobby(nextLobbyGameMap)
    return nextLobbyGameMap
  }

  return {
    tabButtons,
    lobbyButtons,
    hasTabButtonsLoaded,
    hasLobbyButtonsLoaded,
    isLobbyButtonsLoading,
    loadCasinoTabButtons,
    loadCasinoLobbyButtons
  }
})
