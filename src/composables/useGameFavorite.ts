import Api from '@/api'
import type { CollectionsSubjectForm } from '@/api/interface/game'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { useUserStore } from '@/stores/user'
import { computed, inject, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useRoute } from 'vue-router'

type CurrentGameDetail = {
  rowId?: string | number
  itemCode?: string | number
  platformCode?: string
} | null

const resolveNumericGameId = (routeRowId: unknown, detail: CurrentGameDetail): number | null => {
  const fromRoute = Number(routeRowId)
  if (Number.isFinite(fromRoute) && fromRoute > 0) {
    return Math.trunc(fromRoute)
  }

  const fromDetail = Number(detail?.rowId)
  if (Number.isFinite(fromDetail) && fromDetail > 0) {
    return Math.trunc(fromDetail)
  }

  return null
}

export const useGameFavorite = () => {
  const route = useRoute()
  const userStore = useUserStore()
  const { requireLogin } = useRequireLoginAction()

  const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
    'game-detail-current-game',
    computed(() => null)
  )

  const isFavorite = ref(false)

  const subjectIsCollectionsRef = inject<Ref<boolean | null> | null>(
    'game-detail-subject-is-collections',
    null
  )

  watch(
    () => subjectIsCollectionsRef?.value,
    server => {
      if (!subjectIsCollectionsRef) {
        isFavorite.value = false
        return
      }
      if (server === null) {
        isFavorite.value = false
        return
      }
      isFavorite.value = Boolean(server)
    },
    { immediate: true }
  )

  const toggleFavorite = async () => {
    if (!requireLogin()) {
      return false
    }

    userStore.syncStoredUserData()

    const memberRowId = Number(userStore.acctInfo?.memberRowId)
    if (!Number.isFinite(memberRowId) || memberRowId <= 0) {
      return false
    }

    const gameId = resolveNumericGameId(route.params.rowId, currentGameDetail.value)
    if (gameId === null) {
      return false
    }

    const nextValue = !isFavorite.value
    const payload: CollectionsSubjectForm = {
      memberRowId,
      status: nextValue ? 0 : 1,
      gameId
    }

    try {
      await Api.game.collectionsSubject(payload)
      isFavorite.value = nextValue
      if (subjectIsCollectionsRef) {
        subjectIsCollectionsRef.value = nextValue
      }
      return nextValue
    } catch {
      return isFavorite.value
    }
  }

  return {
    isFavorite,
    toggleFavorite
  }
}
