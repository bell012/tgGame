import type { Component, Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameBrandItem, GameDataItem, GameTypeItem } from '@/api/interface/game'
import { useGameStore } from '@/stores/game'
import { casinoIcons } from '@/static/svg/casino'

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

interface UseCasinoTabButtonsOptions {
  isLoggedIn?: Ref<boolean>
}

export const useCasinoTabButtons = (options: UseCasinoTabButtonsOptions = {}) => {
  const { t, locale } = useI18n()
  const gameStore = useGameStore()
  const gameTypeList = ref<GameTypeItem[]>([])
  const lobbyGameMap = ref<Record<string, GameDataItem[]>>({})
  const lobbyBrandMap = ref<Record<string, GameBrandItem[]>>({})
  const hasLoaded = ref(false)

  const buildBaseTabButtons = (): CasinoTabButtonItem[] => [
    {
      sysGameTypeCode: '',
      sysGameTypeName: t('casino.lobby'),
      icon: casinoIcons.lobby,
      iconSelect: casinoIcons.lobby
    },
    {
      sysGameTypeCode: 'hot_games',
      sysGameTypeName: t('casino.hot_games'),
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
      sysGameTypeName: t('sidebar_menu.casino.children.game_providers'),
      icon: casinoIcons.game_provider,
      iconSelect: casinoIcons.game_provider
    })

    return buttons.map(button => ({
      ...button,
      items: lobbyGameMap.value[button.sysGameTypeCode] ?? [],
      brandItems: lobbyBrandMap.value[button.sysGameTypeCode] ?? []
    }))
  })

  const tabButtons = computed<CasinoTabButtonItem[]>(() => {
    const buttons = [...lobbyButtons.value]

    return buttons
  })

  const loadCasinoTabButtons = async (forceRefresh = false) => {
    gameTypeList.value = await gameStore.getGameTypeData(forceRefresh)

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
    hasLoaded.value = true
    console.log(lobbyGameMap.value)

    return tabButtons.value
  }

  watch(
    () => locale.value,
    async () => {
      if (!hasLoaded.value) return
      await loadCasinoTabButtons(true)
    }
  )

  if (options.isLoggedIn) {
    watch(
      () => options.isLoggedIn?.value,
      async () => {
        if (!hasLoaded.value) return
        await loadCasinoTabButtons()
      }
    )
  }

  return {
    tabButtons,
    lobbyButtons,
    hasLoaded,
    loadCasinoTabButtons
  }
}
