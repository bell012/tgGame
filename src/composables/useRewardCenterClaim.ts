import { useI18n } from 'vue-i18n'
import { useRewardCenterStore } from '@/stores/rewardCenter'
import { formatRewardCenterTotal } from '@/views/reward-center/shared'
import { globalShowToast } from '@/utils/toast'

export const useRewardCenterClaim = (options?: { onSuccess?: (amountText: string) => void }) => {
  const { t } = useI18n()
  const rewardCenterStore = useRewardCenterStore()

  const claimItem = async (rowId: string) => {
    try {
      const amount = await rewardCenterStore.claimRewardItem(rowId)
      if (amount != null) {
        options?.onSuccess?.(formatRewardCenterTotal(amount))
      }
    } catch (error) {
      console.error('[reward-center] claim item failed:', error)
    }
  }

  const claimAll = async () => {
    if (rewardCenterStore.isClaimAllDisabled) {
      globalShowToast({
        message: t('rewardCenter.noClaimable'),
        type: 'fail'
      })
      return
    }

    try {
      const amount = await rewardCenterStore.claimAllRewards()
      if (amount != null) {
        options?.onSuccess?.(formatRewardCenterTotal(amount))
      }
    } catch (error) {
      console.error('[reward-center] claim all failed:', error)
    }
  }

  return { claimItem, claimAll }
}
