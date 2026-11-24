import Api from '@/api'
import type { CollectionsSubjectForm } from '@/api/interface/game'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { useUserStore } from '@/stores/user'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
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
  const isUpdating = ref(false)
  const refreshFavorite = inject<(() => Promise<void>) | null>('game-detail-refresh-favorite', null)

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
    if (isUpdating.value) return isFavorite.value
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
    const session = userStore.userInfo?.tradeToken
    const payload: CollectionsSubjectForm = {
      memberRowId,
      status: nextValue ? 0 : 1,
      gameId
    }

    isUpdating.value = true
    try {
      const response = await Api.game.collectionsSubject(payload)
      if (!response || typeof response !== 'object') return isFavorite.value
      ensureApiBusinessSuccess({
        code:
          'code' in response &&
          (typeof response.code === 'string' || typeof response.code === 'number')
            ? response.code
            : undefined,
        success: 'success' in response && response.success === true
      })
      if (
        gameId !== resolveNumericGameId(route.params.rowId, currentGameDetail.value) ||
        session !== userStore.userInfo?.tradeToken ||
        memberRowId !== Number(userStore.acctInfo?.memberRowId)
      )
        return isFavorite.value
      isFavorite.value = nextValue
      if (subjectIsCollectionsRef) {
        subjectIsCollectionsRef.value = nextValue
      }
      await refreshFavorite?.()
      return nextValue
    } catch {
      return isFavorite.value
    } finally {
      isUpdating.value = false
    }
  }

  return {
    isFavorite,
    isUpdating,
    toggleFavorite
  }
}
