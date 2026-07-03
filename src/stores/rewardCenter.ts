import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Api from '@/api'
import type { RewardCenterRecord } from '@/api/interface/reward-center'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import {
  buildRewardCenterClaimAllQuery,
  buildRewardCenterClaimedQuery,
  buildRewardCenterPendingQuery,
  createDefaultRewardCenterFilterValues,
  getRewardCenterRecordId,
  mapAcctHisBonusToRewardRecord,
  mapBonusItemsToPendingRecords,
  mapRewardCenterRecord,
  sumClaimedBonusAmount,
  type RewardCenterFilterValues,
  type RewardCenterListItem,
  type RewardCenterTab,
  REWARD_CENTER_CLAIMED_PAGE_SIZE
} from '@/views/reward-center/shared'
import {
  claimPendingBonusByActivityCode,
  parsePendingClaimRewardAmount
} from '@/views/reward-center/pendingClaim'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

const appendClaimedRecords = (
  current: RewardCenterRecord[],
  incoming: RewardCenterRecord[]
): RewardCenterRecord[] => {
  if (incoming.length === 0) {
    return current
  }

  const existingIds = new Set(current.map(record => getRewardCenterRecordId(record)))
  const nextRecords = [...current]

  for (const record of incoming) {
    const recordId = getRewardCenterRecordId(record)
    if (!recordId || existingIds.has(recordId)) {
      continue
    }

    existingIds.add(recordId)
    nextRecords.push(record)
  }

  return nextRecords
}

export const useRewardCenterStore = defineStore('rewardCenter', () => {
  const pendingRecords = ref<RewardCenterRecord[]>([])
  const claimedRecords = ref<RewardCenterRecord[]>([])
  const pendingTotalAmount = ref(0)
  const claimedTotalAmount = ref(0)
  const pendingLoading = ref(false)
  const claimedLoading = ref(false)
  const claimedLoadingMore = ref(false)
  const claimedPage = ref(0)
  const claimedHasMore = ref(false)
  const claiming = ref(false)
  const claimedFilterValues = ref<RewardCenterFilterValues>(createDefaultRewardCenterFilterValues())

  let pendingFetchGeneration = 0
  let claimedFetchGeneration = 0

  const hasPendingRewards = computed(() => pendingRecords.value.length > 0)
  const isClaimAllDisabled = computed(() => pendingTotalAmount.value <= 0 || claiming.value)

  const syncClaimedTotalAmount = () => {
    claimedTotalAmount.value = sumClaimedBonusAmount(claimedRecords.value)
  }

  const resetClaimedList = () => {
    claimedRecords.value = []
    claimedTotalAmount.value = 0
    claimedPage.value = 0
    claimedHasMore.value = false
  }

  const getPendingListItems = (t: TranslateFn): RewardCenterListItem[] =>
    pendingRecords.value.map(record => mapRewardCenterRecord(record, t, 'pending'))

  const getClaimedListItems = (t: TranslateFn): RewardCenterListItem[] =>
    claimedRecords.value.map(record => mapRewardCenterRecord(record, t, 'claimed'))

  const fetchPendingRewards = async () => {
    const generation = ++pendingFetchGeneration
    pendingLoading.value = true

    try {
      const response = ensureApiBusinessSuccess(
        await Api.rewardCenter.queryRewardCenterPending(buildRewardCenterPendingQuery())
      )

      if (generation !== pendingFetchGeneration) {
        return
      }

      pendingRecords.value = mapBonusItemsToPendingRecords(response.result?.bonus ?? [])
      pendingTotalAmount.value = Number(response.result?.sumAmount ?? 0)
    } catch (error) {
      if (generation !== pendingFetchGeneration) {
        return
      }

      console.error('[reward-center] fetch pending failed:', error)
      pendingRecords.value = []
      pendingTotalAmount.value = 0
    } finally {
      if (generation === pendingFetchGeneration) {
        pendingLoading.value = false
      }
    }
  }

  const loadClaimedPage = async (page: number, append: boolean, generation: number) => {
    if (generation !== claimedFetchGeneration) {
      return
    }

    const response = ensureApiBusinessSuccess(
      await Api.rewardCenter.queryRewardCenterClaimed(
        buildRewardCenterClaimedQuery({
          page,
          pageSize: REWARD_CENTER_CLAIMED_PAGE_SIZE,
          filterValues: claimedFilterValues.value
        })
      )
    )

    if (generation !== claimedFetchGeneration) {
      return
    }

    const result = response.result
    const records = (result?.records ?? []).map(mapAcctHisBonusToRewardRecord)
    claimedRecords.value = append ? appendClaimedRecords(claimedRecords.value, records) : records
    syncClaimedTotalAmount()

    const totalPages = Math.max(Number(result?.pages ?? 1), 1)
    claimedPage.value = page
    claimedHasMore.value = page < totalPages
  }

  const fetchClaimedRewards = async () => {
    const generation = ++claimedFetchGeneration
    resetClaimedList()
    claimedLoading.value = true

    try {
      await loadClaimedPage(1, false, generation)
    } catch (error) {
      if (generation !== claimedFetchGeneration) {
        return
      }

      console.error('[reward-center] fetch claimed failed:', error)
      resetClaimedList()
    } finally {
      if (generation === claimedFetchGeneration) {
        claimedLoading.value = false
      }
    }
  }

  const loadMoreClaimedRewards = async () => {
    if (
      !claimedHasMore.value ||
      claimedLoading.value ||
      claimedLoadingMore.value ||
      claimedPage.value <= 0
    ) {
      return
    }

    const generation = claimedFetchGeneration
    const nextPage = claimedPage.value + 1
    claimedLoadingMore.value = true

    try {
      await loadClaimedPage(nextPage, true, generation)
    } catch (error) {
      if (generation !== claimedFetchGeneration) {
        return
      }

      console.error('[reward-center] load more claimed failed:', error)
    } finally {
      if (generation === claimedFetchGeneration) {
        claimedLoadingMore.value = false
      }
    }
  }

  const findPendingRecord = (itemId: string) =>
    pendingRecords.value.find(record => getRewardCenterRecordId(record) === itemId)

  const claimRewardItem = async (itemId: string) => {
    if (claiming.value) {
      return null
    }

    const record = findPendingRecord(itemId)
    const activityCode = record?.activityCode

    if (!record || activityCode == null) {
      return null
    }

    claiming.value = true

    try {
      const response = ensureApiBusinessSuccess(await claimPendingBonusByActivityCode(activityCode))

      await fetchPendingRewards()
      return parsePendingClaimRewardAmount(response, Number(record.rewardAmount ?? 0))
    } finally {
      claiming.value = false
    }
  }

  const claimAllRewards = async () => {
    if (claiming.value || pendingTotalAmount.value <= 0) {
      return null
    }

    const totalBeforeClaim = pendingTotalAmount.value
    claiming.value = true

    try {
      const response = ensureApiBusinessSuccess(
        await Api.rewardCenter.claimRewardCenterAll(buildRewardCenterClaimAllQuery())
      )

      const responseAmount = Number(response.result?.rewardAmount ?? Number.NaN)
      const claimedAmount = Number.isFinite(responseAmount) ? responseAmount : totalBeforeClaim

      await fetchPendingRewards()

      return claimedAmount > 0 ? claimedAmount : null
    } finally {
      claiming.value = false
    }
  }

  const setClaimedFilterValues = async (values: RewardCenterFilterValues) => {
    claimedFilterValues.value = values
    await fetchClaimedRewards()
  }

  const loadTabData = async (tab: RewardCenterTab) => {
    if (tab === 'pending') {
      await fetchPendingRewards()
      return
    }

    await fetchClaimedRewards()
  }

  return {
    pendingRecords,
    claimedRecords,
    pendingTotalAmount,
    claimedTotalAmount,
    pendingLoading,
    claimedLoading,
    claimedLoadingMore,
    claimedPage,
    claimedHasMore,
    claiming,
    claimedFilterValues,
    hasPendingRewards,
    isClaimAllDisabled,
    getPendingListItems,
    getClaimedListItems,
    fetchPendingRewards,
    fetchClaimedRewards,
    loadMoreClaimedRewards,
    claimRewardItem,
    claimAllRewards,
    setClaimedFilterValues,
    loadTabData
  }
})
