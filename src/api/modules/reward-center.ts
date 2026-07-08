import type {
  ClaimRewardCenterAllForm,
  ClaimRewardCenterAllResponse,
  QueryRewardCenterClaimedForm,
  QueryRewardCenterPendingForm,
  QueryRewardCenterPendingResponse,
  RewardCenterClaimResponse,
  RewardCenterRowClaimForm
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

const postRewardCenterRowClaim = (
  url: string,
  data: RewardCenterRowClaimForm,
  options?: ApiResponseToastOptions
): Promise<RewardCenterClaimResponse> =>
  request({
    url,
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 领取活动奖励（activityCode 4） */
export const obtainActivityReward = (
  data: RewardCenterRowClaimForm,
  options?: ApiResponseToastOptions
) => postRewardCenterRowClaim('/act/obtainActivityReward', data, options)

/** 领取充值活动奖励（activityCode 5） */
export const obtainRechargeActivityReward = (
  data: RewardCenterRowClaimForm,
  options?: ApiResponseToastOptions
) => postRewardCenterRowClaim('/act/obtainRechargeActivityReward', data, options)

/** 领取签到活动奖励（activityCode 6） */
export const signActivity = (data: RewardCenterRowClaimForm, options?: ApiResponseToastOptions) =>
  postRewardCenterRowClaim('/act/signActivity', data, options)

/** 领取救援金（activityCode 8） */
export const receiveReliefFunds = (
  data: RewardCenterRowClaimForm,
  options?: ApiResponseToastOptions
) => postRewardCenterRowClaim('/relief/receiveReliefFunds', data, options)

/** 领取代理返佣活动奖励（activityCode 9） */
export const obtainAgentRebateActivityReward = (
  data: RewardCenterRowClaimForm,
  options?: ApiResponseToastOptions
) => postRewardCenterRowClaim('/ac/obtainAgentRebateActivityReward', data, options)

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
