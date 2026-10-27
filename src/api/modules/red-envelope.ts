import type {
  MemberRecordParams,
  MemberRecordResult,
  RedEnvelopeApiResponse,
  RedEnvelopeItem,
  RedEnvelopePage,
  RedEnvelopeSchedule
} from '@/api/interface/red-envelope'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import request, { type ApiResponseToastOptions } from '@/utils/request'

/** 校验红包业务响应成功后，统一返回其中的 result 数据。 */
const resolveRedEnvelopeApiResult = async <T>(
  requestPromise: Promise<RedEnvelopeApiResponse<T>>
): Promise<T> => {
  const response = await requestPromise

  return ensureApiBusinessSuccess(response).result
}

/** 分页查询会员红包列表。 */
export const getMemberList = (
  current: number,
  size: number,
  options?: ApiResponseToastOptions
): Promise<RedEnvelopePage<RedEnvelopeItem>> =>
  resolveRedEnvelopeApiResult(
    request({
      url: '/rea/getMemberList',
      method: 'post',
      data: { page: { records: [], total: 0, size, current } },
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 分页查询会员红包领取记录。 */
export const getMemberRecord = (
  query: {
    current: number
    size: number
    param: MemberRecordParams
    startTime?: number
    endTime?: number
  },
  options?: ApiResponseToastOptions
): Promise<MemberRecordResult> =>
  resolveRedEnvelopeApiResult(
    request({
      url: '/rea/getMemberRecord',
      method: 'post',
      data: {
        startTime: query.startTime,
        endTime: query.endTime,
        param: query.param,
        page: { records: [], total: 0, size: query.size, current: query.current }
      },
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 查询红包活动进度。 */
export const getActivitySchedule = (
  redEnvelopeId: number,
  options?: ApiResponseToastOptions
): Promise<RedEnvelopeSchedule> =>
  resolveRedEnvelopeApiResult(
    request({
      url: '/rea/getActivitySchedule',
      method: 'post',
      data: { redEnvelopeId },
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 领取红包奖励。 */
export const claimRewards = (
  redEnvelopeId: number,
  options?: ApiResponseToastOptions
): Promise<RedEnvelopeSchedule> =>
  resolveRedEnvelopeApiResult(
    request({
      url: '/rea/claimRewards',
      method: 'post',
      data: { redEnvelopeId },
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )
