import type {
  ObtainEntrantTaskAmountForm,
  ObtainEntrantTaskAmountResponse,
  ObtainTaskAmountForm,
  ObtainTaskAmountResponse
} from '@/api/interface/task'
import request, { type ApiResponseToastOptions } from '@/utils/request'

/** 领取任务奖金（activityCode 16） */
export const obtainTaskAmount = (
  data: ObtainTaskAmountForm,
  options?: ApiResponseToastOptions
): Promise<ObtainTaskAmountResponse> =>
  request({
    url: '/task/obtainTaskAmount',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 领取新人福利任务奖金（activityCode 17） */
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
