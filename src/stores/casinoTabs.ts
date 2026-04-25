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

interface PendingCasinoTabsRequest<T> {
  id: symbol
  languageCode: string
  promise: Promise<T[]>
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

        const nextLobbyGameMap: Record<string, GameDataItem[]> = {
          hot_games: []
        }

        const [hotGamesResult, providersResult] = await Promise.all([
          gameStore.queryGameDataPage({
            hot: 1,
            sortByHotOrderId: true,
            rowType: 3,
            page: 1
          }),
          gameStore.queryGameBrandDataPage()
        ])

        nextLobbyGameMap.hot_games = hotGamesResult.list

        await Promise.all(
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

        lobbyGameMap.value = nextLobbyGameMap
        lobbyBrandMap.value = {
          providers: providersResult.list
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
