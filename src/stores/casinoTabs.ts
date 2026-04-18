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
  let pendingTabButtonsRequest: Promise<CasinoTabButtonItem[]> | null = null
  let pendingLobbyButtonsRequest: Promise<CasinoLobbyButtonItem[]> | null = null

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
    if (pendingTabButtonsRequest) {
      return pendingTabButtonsRequest
    }

    if (
      !forceRefresh &&
      hasTabButtonsLoaded.value &&
      loadedTabLanguageCode.value === currentLanguageCode.value
    ) {
      return tabButtons.value
    }

    pendingTabButtonsRequest = (async () => {
      gameTypeList.value = await gameStore.getGameTypeData(forceRefresh)
      hasTabButtonsLoaded.value = true
      loadedTabLanguageCode.value = currentLanguageCode.value

      return tabButtons.value
    })()

    try {
      return await pendingTabButtonsRequest
    } finally {
      pendingTabButtonsRequest = null
    }
  }

  const loadCasinoLobbyButtons = async (forceRefresh = false) => {
    if (pendingLobbyButtonsRequest) {
      return pendingLobbyButtonsRequest
    }

    if (
      !forceRefresh &&
      hasLobbyButtonsLoaded.value &&
      loadedLobbyLanguageCode.value === currentLanguageCode.value
    ) {
      return lobbyButtons.value
    }

    pendingLobbyButtonsRequest = (async () => {
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
        hasLobbyButtonsLoaded.value = true
        loadedLobbyLanguageCode.value = currentLanguageCode.value

        return lobbyButtons.value
      } finally {
        isLobbyButtonsLoading.value = false
      }
    })()

    try {
      return await pendingLobbyButtonsRequest
    } finally {
      pendingLobbyButtonsRequest = null
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
