import type {
  ClaimRewardCenterAllForm,
  ClaimRewardCenterAllResponse,
  ClaimRewardCenterItemForm,
  ClaimRewardCenterItemResponse,
  QueryRewardCenterClaimedForm,
  QueryRewardCenterClaimedResponse,
  QueryRewardCenterPendingForm,
  QueryRewardCenterPendingResponse
} from '@/api/interface/reward-center'
import request, { type ApiResponseToastOptions } from '@/utils/request'

/** 查询待领取奖励列表 */
export const queryRewardCenterPending = (
  data: QueryRewardCenterPendingForm = {},
  options?: ApiResponseToastOptions
): Promise<QueryRewardCenterPendingResponse> =>
  request({
    url: '/reward-center/pendingPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? false
  })

/** 查询已领取奖励列表 */
export const queryRewardCenterClaimed = (
  data: QueryRewardCenterClaimedForm,
  options?: ApiResponseToastOptions
): Promise<QueryRewardCenterClaimedResponse> =>
  request({
    url: '/reward-center/claimedPage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? false
  })

/** 领取单条奖励 */
export const claimRewardCenterItem = (
  data: ClaimRewardCenterItemForm,
  options?: ApiResponseToastOptions
): Promise<ClaimRewardCenterItemResponse> =>
  request({
    url: '/reward-center/receive',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 一键领取全部待领取奖励 */
export const claimRewardCenterAll = (
  data: ClaimRewardCenterAllForm = {},
  options?: ApiResponseToastOptions
): Promise<ClaimRewardCenterAllResponse> =>
  request({
    url: '/reward-center/receiveAll',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })
