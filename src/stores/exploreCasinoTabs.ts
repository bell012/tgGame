import { computed, ref, type Component } from 'vue'
import { defineStore } from 'pinia'
import i18n from '@/i18n'
import type { GameTypeItem } from '@/api/interface/game'
import { useGameStore } from '@/stores/game'
import { casinoIcons } from '@/static/svg/casino'
import { getStorageLanguageCode } from '@/utils/locale'

export interface ExploreCasinoTabButtonItem {
  sysGameTypeCode: string
  sysGameTypeName: string
  icon: string | Component
  iconSelect: string | Component
}

interface PendingExploreCasinoTabsRequest<T> {
  id: symbol
  languageCode: string
  promise: Promise<T[]>
}

export const useExploreCasinoTabsStore = defineStore('exploreCasinoTabs', () => {
  const gameStore = useGameStore()
  const gameTypeList = ref<GameTypeItem[]>([])
  const hasTabButtonsLoaded = ref(false)
  const loadedTabLanguageCode = ref<string | null>(null)
  let pendingTabButtonsRequest: PendingExploreCasinoTabsRequest<ExploreCasinoTabButtonItem> | null =
    null

  const currentLanguageCode = computed(() =>
    getStorageLanguageCode(String(i18n.global.locale.value))
  )

  const buildBaseTabButtons = (): ExploreCasinoTabButtonItem[] => [
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

  const tabButtons = computed<ExploreCasinoTabButtonItem[]>(() => {
    const buttons = buildBaseTabButtons()
    const seenSysGameTypeCodes = new Set(buttons.map(item => item.sysGameTypeCode))

    gameTypeList.value.forEach(item => {
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

    return buttons
  })

  const loadExploreCasinoTabButtons = async (forceRefresh = false) => {
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

    const requestId = Symbol('explore-casino-tab-buttons-request')
    const promise = (async () => {
      const nextGameTypeList = await gameStore.getGameTypeData(forceRefresh)

      gameTypeList.value = nextGameTypeList
      hasTabButtonsLoaded.value = nextGameTypeList.length > 0
      loadedTabLanguageCode.value = nextGameTypeList.length > 0 ? requestLanguageCode : null

      return tabButtons.value
    })()

    const request: PendingExploreCasinoTabsRequest<ExploreCasinoTabButtonItem> = {
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

  return {
    tabButtons,
    hasTabButtonsLoaded,
    loadExploreCasinoTabButtons
  }
})
