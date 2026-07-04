import type {
  ObtainEntrantTaskAmountForm,
  ObtainEntrantTaskAmountResponse
} from '@/api/interface/task'
import request, { type ApiResponseToastOptions } from '@/utils/request'

/** 领取新人福利任务奖金 */
export const obtainEntrantTaskAmount = (
  data: ObtainEntrantTaskAmountForm = {},
  options?: ApiResponseToastOptions
): Promise<ObtainEntrantTaskAmountResponse> =>
  request({
    url: '/task/obtainEntrantTaskAmount',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })
