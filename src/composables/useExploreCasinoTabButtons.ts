import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import {
  useExploreCasinoTabsStore,
  type ExploreCasinoTabButtonItem
} from '@/stores/exploreCasinoTabs'

export type { ExploreCasinoTabButtonItem }

export const useExploreCasinoTabButtons = () => {
  const { locale } = useI18n()
  const exploreCasinoTabsStore = useExploreCasinoTabsStore()
  const { tabButtons, hasTabButtonsLoaded } = storeToRefs(exploreCasinoTabsStore)

  watch(
    () => locale.value,
    async () => {
      if (hasTabButtonsLoaded.value) {
        await exploreCasinoTabsStore.loadExploreCasinoTabButtons(true)
      }
    }
  )

  return {
    tabButtons,
    hasTabButtonsLoaded,
    loadExploreCasinoTabButtons: exploreCasinoTabsStore.loadExploreCasinoTabButtons
  }
}
