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

export const useExploreCasinoTabsStore = defineStore('exploreCasinoTabs', () => {
  const gameStore = useGameStore()
  const gameTypeList = ref<GameTypeItem[]>([])
  const hasTabButtonsLoaded = ref(false)
  const loadedTabLanguageCode = ref<string | null>(null)
  let pendingTabButtonsRequest: Promise<ExploreCasinoTabButtonItem[]> | null = null

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

  return {
    tabButtons,
    hasTabButtonsLoaded,
    loadExploreCasinoTabButtons
  }
})
