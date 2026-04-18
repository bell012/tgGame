import {
  createGameFavoriteKey,
  isGameFavoritedByKey,
  setGameFavoritedByKey
} from '@/utils/game-favorite-cache'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'

type CurrentGameDetail = {
  rowId?: string | number
  itemCode?: string | number
  platformCode?: string
} | null

export const useGameFavorite = () => {
  const route = useRoute()
  const { requireLogin } = useRequireLoginAction()

  const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
    'game-detail-current-game',
    computed(() => null)
  )

  const favoriteKey = computed(() =>
    createGameFavoriteKey({
      rowId: route.params.rowId ?? currentGameDetail.value?.rowId,
      itemCode: currentGameDetail.value?.itemCode,
      platformCode: currentGameDetail.value?.platformCode
    })
  )

  const isFavorite = ref(false)

  watch(
    favoriteKey,
    key => {
      isFavorite.value = isGameFavoritedByKey(key)
    },
    { immediate: true }
  )

  const toggleFavorite = () => {
    if (!requireLogin()) {
      return false
    }

    const key = favoriteKey.value
    if (!key) {
      return false
    }

    const nextValue = !isFavorite.value
    setGameFavoritedByKey(key, nextValue)
    isFavorite.value = nextValue
    return nextValue
  }

  return {
    isFavorite,
    toggleFavorite
  }
}
