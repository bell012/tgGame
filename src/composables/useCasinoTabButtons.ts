import type { Ref } from 'vue'
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import {
  useCasinoTabsStore,
  type CasinoLobbyButtonItem,
  type CasinoTabButtonItem
} from '@/stores/casinoTabs'

interface UseCasinoTabButtonsOptions {
  isLoggedIn?: Ref<boolean>
}

export type { CasinoTabButtonItem, CasinoLobbyButtonItem }

export const useCasinoTabButtons = (options: UseCasinoTabButtonsOptions = {}) => {
  const { locale } = useI18n()
  const casinoTabsStore = useCasinoTabsStore()
  const {
    tabButtons,
    lobbyButtons,
    hasTabButtonsLoaded,
    hasLobbyButtonsLoaded,
    isLobbyButtonsLoading
  } = storeToRefs(casinoTabsStore)

  watch(
    () => locale.value,
    async () => {
      if (hasLobbyButtonsLoaded.value) {
        await casinoTabsStore.loadCasinoLobbyButtons(true)
        return
      }

      if (hasTabButtonsLoaded.value) {
        await casinoTabsStore.loadCasinoTabButtons(true)
      }
    }
  )

  if (options.isLoggedIn) {
    watch(
      () => options.isLoggedIn?.value,
      async () => {
        if (hasLobbyButtonsLoaded.value) {
          await casinoTabsStore.loadCasinoLobbyButtons()
          return
        }

        if (hasTabButtonsLoaded.value) {
          await casinoTabsStore.loadCasinoTabButtons()
        }
      }
    )
  }

  return {
    tabButtons,
    lobbyButtons,
    hasLoaded: hasLobbyButtonsLoaded,
    hasTabButtonsLoaded,
    hasLobbyButtonsLoaded,
    isLobbyButtonsLoading,
    loadCasinoTabButtons: casinoTabsStore.loadCasinoTabButtons,
    loadCasinoLobbyButtons: casinoTabsStore.loadCasinoLobbyButtons
  }
}
