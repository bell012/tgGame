import type {
  GetGameTaskConfigResponse,
  ObtainEntrantTaskAmountForm,
  ObtainEntrantTaskAmountResponse,
  ObtainTaskAmountForm,
  ObtainTaskAmountResponse,
  QueryMemberTasksForm,
  QueryMemberTasksResponse
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

/** 获取任务中心的游戏任务栏目配置。 */
export const getGameTaskConfig = (
  options?: ApiResponseToastOptions
): Promise<GetGameTaskConfigResponse> =>
  request({
    url: '/task/getGameTaskConfig',
    method: 'post',
    data: {},
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 按当前币种查询会员可参与的任务列表。 */
export const queryMemberTasks = (
  data: QueryMemberTasksForm,
  options?: ApiResponseToastOptions
): Promise<QueryMemberTasksResponse> =>
  request({
    url: '/task/queryMemberTasks',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })
