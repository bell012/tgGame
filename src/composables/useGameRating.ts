import { createGameFavoriteKey } from '@/utils/game-favorite-cache'
import { getGameRatingByKey, setGameRatingByKey } from '@/utils/game-rating-cache'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'

type CurrentGameDetail = {
  rowId?: string | number
  itemCode?: string | number
  platformCode?: string
} | null

const normalizeRating = (value: unknown) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || !value) {
    return 0
  }
  return Math.max(1, Math.min(5, Math.trunc(parsed)))
}

export const useGameRating = () => {
  const route = useRoute()
  const { requireLogin } = useRequireLoginAction()

  const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
    'game-detail-current-game',
    computed(() => null)
  )

  const ratingKey = computed(() =>
    createGameFavoriteKey({
      rowId: route.params.rowId ?? currentGameDetail.value?.rowId,
      itemCode: currentGameDetail.value?.itemCode,
      platformCode: currentGameDetail.value?.platformCode
    })
  )

  const rating = ref(0)

  watch(
    ratingKey,
    key => {
      rating.value = getGameRatingByKey(key)
    },
    { immediate: true }
  )

  const setRating = (nextRating: number) => {
    if (!requireLogin()) {
      return 0
    }

    const key = ratingKey.value
    if (!key) {
      return 0
    }

    const normalizedRating = normalizeRating(nextRating)
    if (normalizedRating < 1) {
      return 0
    }

    setGameRatingByKey(key, normalizedRating)
    rating.value = normalizedRating
    return normalizedRating
  }

  return {
    rating,
    setRating
  }
}
