import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Api from '@/api'
import type { RewardCenterRecord } from '@/api/interface/reward-center'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import {
  buildRewardCenterClaimedQuery,
  createDefaultRewardCenterFilterValues,
  mapRewardCenterRecord,
  type RewardCenterFilterValues,
  type RewardCenterListItem,
  type RewardCenterTab,
  REWARD_CENTER_FETCH_SIZE
} from '@/views/reward-center/shared'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

export const useRewardCenterStore = defineStore('rewardCenter', () => {
  const pendingRecords = ref<RewardCenterRecord[]>([])
  const claimedRecords = ref<RewardCenterRecord[]>([])
  const pendingTotalAmount = ref(0)
  const claimedTotalAmount = ref(0)
  const pendingLoading = ref(false)
  const claimedLoading = ref(false)
  const claiming = ref(false)
  const claimedFilterValues = ref<RewardCenterFilterValues>(createDefaultRewardCenterFilterValues())

  const hasPendingRewards = computed(() => pendingRecords.value.length > 0)
  const isClaimAllDisabled = computed(() => pendingTotalAmount.value <= 0 || claiming.value)

  const getPendingListItems = (t: TranslateFn): RewardCenterListItem[] =>
    pendingRecords.value.map(record => mapRewardCenterRecord(record, t, 'pending'))

  const getClaimedListItems = (t: TranslateFn): RewardCenterListItem[] =>
    claimedRecords.value.map(record => mapRewardCenterRecord(record, t, 'claimed'))

  const fetchPendingRewards = async () => {
    pendingLoading.value = true

    try {
      const response = ensureApiBusinessSuccess(
        await Api.rewardCenter.queryRewardCenterPending({
          page: {
            current: 1,
            size: REWARD_CENTER_FETCH_SIZE
          }
        })
      )

      pendingRecords.value = response.result?.records ?? []
      pendingTotalAmount.value = Number(response.result?.totalAmount ?? 0)
    } catch (error) {
      console.error('[reward-center] fetch pending failed:', error)
      pendingRecords.value = []
      pendingTotalAmount.value = 0
    } finally {
      pendingLoading.value = false
    }
  }

  const fetchClaimedRewards = async () => {
    if (claimedLoading.value) {
      return
    }

    claimedLoading.value = true

    try {
      const response = ensureApiBusinessSuccess(
        await Api.rewardCenter.queryRewardCenterClaimed(
          buildRewardCenterClaimedQuery({
            page: 1,
            pageSize: REWARD_CENTER_FETCH_SIZE,
            filterValues: claimedFilterValues.value
          })
        )
      )

      claimedRecords.value = response.result?.records ?? []
      claimedTotalAmount.value = Number(response.result?.totalAmount ?? 0)
    } catch (error) {
      console.error('[reward-center] fetch claimed failed:', error)
      claimedRecords.value = []
      claimedTotalAmount.value = 0
    } finally {
      claimedLoading.value = false
    }
  }

  const claimRewardItem = async (rowId: string | number) => {
    if (claiming.value) {
      return null
    }

    claiming.value = true

    try {
      const response = ensureApiBusinessSuccess(
        await Api.rewardCenter.claimRewardCenterItem({ rowId })
      )

      await fetchPendingRewards()
      return Number(response.result?.rewardAmount ?? 0)
    } finally {
      claiming.value = false
    }
  }

  const claimAllRewards = async () => {
    if (claiming.value || pendingTotalAmount.value <= 0) {
      return null
    }

    claiming.value = true

    try {
      const response = ensureApiBusinessSuccess(await Api.rewardCenter.claimRewardCenterAll())
      await fetchPendingRewards()
      return Number(response.result?.rewardAmount ?? pendingTotalAmount.value)
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
    claiming,
    claimedFilterValues,
    hasPendingRewards,
    isClaimAllDisabled,
    getPendingListItems,
    getClaimedListItems,
    fetchPendingRewards,
    fetchClaimedRewards,
    claimRewardItem,
    claimAllRewards,
    setClaimedFilterValues,
    loadTabData
  }
})
