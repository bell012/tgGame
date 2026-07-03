import type {
  ClaimRewardCenterAllForm,
  ClaimRewardCenterAllResponse,
  QueryRewardCenterClaimedForm,
  QueryRewardCenterPendingForm,
  QueryRewardCenterPendingResponse
} from '@/api/interface/reward-center'
import type { QueryAcctHisBonusPageResponse } from '@/api/interface/record.interface'
import request, { type ApiResponseToastOptions } from '@/utils/request'

/** 查询待领取奖励列表 */
export const queryRewardCenterPending = (
  data: QueryRewardCenterPendingForm,
  options?: ApiResponseToastOptions
): Promise<QueryRewardCenterPendingResponse> =>
  request({
    url: '/ac/queryBonusAppMultipleCurrencies',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? false
  })

/** 查询已领取奖励列表 */
export const queryRewardCenterClaimed = (
  data: QueryRewardCenterClaimedForm,
  options?: ApiResponseToastOptions
): Promise<QueryAcctHisBonusPageResponse> =>
  request({
    url: '/acct/queryAcctHisBonusPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? false
  })

/** 一键领取全部待领取奖励 */
export const claimRewardCenterAll = (
  data: ClaimRewardCenterAllForm,
  options?: ApiResponseToastOptions
): Promise<ClaimRewardCenterAllResponse> =>
  request({
    url: '/act/obtainAllBonus',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })
