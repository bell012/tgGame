import { useI18n } from 'vue-i18n'
import { useRewardCenterStore } from '@/stores/rewardCenter'
import { formatRewardCenterClaimAmount } from '@/views/reward-center/shared'
import {
  RewardCenterClaimMissingRowIdError,
  RewardCenterClaimNotSupportedError
} from '@/views/reward-center/pendingClaim'
import { globalShowToast } from '@/utils/toast'

export const useRewardCenterClaim = (options?: { onSuccess?: (amountText: string) => void }) => {
  const { t } = useI18n()
  const rewardCenterStore = useRewardCenterStore()

  const claimItem = async (itemId: string) => {
    try {
      const amount = await rewardCenterStore.claimRewardItem(itemId)
      if (amount != null) {
        options?.onSuccess?.(formatRewardCenterClaimAmount(amount))
      }
    } catch (error) {
      if (error instanceof RewardCenterClaimNotSupportedError) {
        globalShowToast({
          message: t('rewardCenter.claimNotSupported'),
          type: 'fail'
        })
        return
      }

      if (error instanceof RewardCenterClaimMissingRowIdError) {
        globalShowToast({
          message: t('rewardCenter.claimMissingRowId'),
          type: 'fail'
        })
        return
      }

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
        options?.onSuccess?.(formatRewardCenterClaimAmount(amount))
      }
    } catch (error) {
      console.error('[reward-center] claim all failed:', error)
    }
  }

  return { claimItem, claimAll }
}
