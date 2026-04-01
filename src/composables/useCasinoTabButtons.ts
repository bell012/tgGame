import type { Component, Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameDataItem } from '@/api/interface/game'
import { useGameStore } from '@/stores/game'
import { casinoIcons } from '@/static/svg/casino'

export interface CasinoTabButtonItem {
  sysGameTypeCode: string
  sysGameTypeName: string
  icon: string | Component
}

export interface CasinoLobbyButtonItem extends CasinoTabButtonItem {
  items?: GameDataItem[]
}

interface UseCasinoTabButtonsOptions {
  isLoggedIn?: Ref<boolean>
}

export const useCasinoTabButtons = (options: UseCasinoTabButtonsOptions = {}) => {
  const { t, locale } = useI18n()
  const gameStore = useGameStore()
  const gameTypeList = ref<GameDataItem[]>([])
  const lobbyGameMap = ref<Record<string, GameDataItem[]>>({})
  const hasLoaded = ref(false)

  const buildBaseTabButtons = (): CasinoTabButtonItem[] => [
    {
      sysGameTypeCode: '',
      sysGameTypeName: t('casino.lobby'),
      icon: casinoIcons.lobby
    },
    {
      sysGameTypeCode: 'originals',
      sysGameTypeName: t('casino.tg_originals'),
      icon: casinoIcons.tg_originals
    },
    {
      sysGameTypeCode: 'hot_games',
      sysGameTypeName: t('casino.hot_games'),
      icon: casinoIcons.hot_games
    }
  ]

  const buildEndTabButtons = (): CasinoTabButtonItem[] => [
    {
      sysGameTypeCode: 'favorites',
      sysGameTypeName: t('casino.favorites'),
      icon: casinoIcons.favorites
    },
    {
      sysGameTypeCode: 'recent',
      sysGameTypeName: t('casino.recent'),
      icon: casinoIcons.recent
    }
  ]

  const lobbyButtons = computed<CasinoLobbyButtonItem[]>(() => {
    const buttons: CasinoTabButtonItem[] = buildBaseTabButtons()
    const seenSysGameTypeCodes = new Set(buttons.map(item => item.sysGameTypeCode))

    gameTypeList.value.forEach((item: GameDataItem) => {
      const sysGameTypeCode = item.sysGameTypeCode?.trim()
      const sysGameTypeName = item.sysGameTypeName?.trim()

      if (!sysGameTypeCode || !sysGameTypeName || seenSysGameTypeCodes.has(sysGameTypeCode)) {
        return
      }

      seenSysGameTypeCodes.add(sysGameTypeCode)
      buttons.push({
        sysGameTypeCode,
        sysGameTypeName,
        icon: casinoIcons.game_provider
      })
    })

    buttons.push({
      sysGameTypeCode: 'providers',
      sysGameTypeName: t('sidebar_menu.casino.children.game_providers'),
      icon: casinoIcons.game_provider
    })

    return buttons.map(button => ({
      ...button,
      items: lobbyGameMap.value[button.sysGameTypeCode] ?? []
    }))
  })

  const tabButtons = computed<CasinoTabButtonItem[]>(() => {
    const buttons = [...lobbyButtons.value]

    if (options.isLoggedIn?.value) {
      buttons.push(...buildEndTabButtons())
    }

    return buttons
  })

  const loadCasinoTabButtons = async (forceRefresh = false) => {
    gameTypeList.value = await gameStore.queryGameData({
      rowType: 1,
      forceRefresh
    })

    const nextLobbyGameMap: Record<string, GameDataItem[]> = {}

    await Promise.all(
      gameTypeList.value.map(async item => {
        const sysGameTypeCode = item.sysGameTypeCode?.trim()

        if (!sysGameTypeCode || nextLobbyGameMap[sysGameTypeCode]) {
          return
        }

        const { list } = await gameStore.queryGameDataPage({
          sysGameTypeCode,
          rowType: 3,
          page: 1
        })

        nextLobbyGameMap[sysGameTypeCode] = list
      })
    )

    lobbyGameMap.value = nextLobbyGameMap
    hasLoaded.value = true

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
    loadCasinoTabButtons
  }
}
