import { createGameFavoriteKey } from '@/utils/game-favorite-cache'
import { isGameLikedByKey, setGameLikedByKey } from '@/utils/game-like-cache'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'

type CurrentGameDetail = {
  rowId?: string | number
  itemCode?: string | number
  platformCode?: string
} | null

export const useGameLike = () => {
  const route = useRoute()
  const { requireLogin } = useRequireLoginAction()

  const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
    'game-detail-current-game',
    computed(() => null)
  )

  const likeKey = computed(() =>
    createGameFavoriteKey({
      rowId: route.params.rowId ?? currentGameDetail.value?.rowId,
      itemCode: currentGameDetail.value?.itemCode,
      platformCode: currentGameDetail.value?.platformCode
    })
  )

  const isLiked = ref(false)

  watch(
    likeKey,
    key => {
      isLiked.value = isGameLikedByKey(key)
    },
    { immediate: true }
  )

  const toggleLike = () => {
    if (!requireLogin()) {
      return false
    }

    const key = likeKey.value
    if (!key) {
      return false
    }

    const nextValue = !isLiked.value
    setGameLikedByKey(key, nextValue)
    isLiked.value = nextValue
    return nextValue
  }

  return {
    isLiked,
    toggleLike
  }
}
