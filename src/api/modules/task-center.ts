import type {
  EntrantTaskItem,
  EntrantTaskScheduleItem,
  GameTaskConfigItem,
  MemberActiveValueResult,
  MemberDataOverviewResult,
  MemberTaskItem,
  ObtainEntrantTaskAmountForm,
  ObtainTaskAmountForm,
  QueryEntrantTasksForm,
  QueryMemberDataOverviewForm,
  QueryMemberTasksForm,
  ReceiveGiftBoxForm,
  TaskClaimAmount,
  TaskScheduleItem,
  TaskCenterApiResponse
} from '@/api/interface/task-center'
import { ensureApiBusinessSuccess } from '@/utils/apiBusiness'
import request, { type ApiResponseToastOptions } from '@/utils/request'

/** 校验任务中心业务响应成功后，统一返回其中的 result 数据。 */
const resolveTaskCenterApiResult = async <T>(
  requestPromise: Promise<TaskCenterApiResponse<T>>
): Promise<T> => {
  const response = await requestPromise

  return ensureApiBusinessSuccess(response).result
}

/** 获取任务中心的游戏任务栏目配置。 */
export const getGameTaskConfig = (
  options?: ApiResponseToastOptions
): Promise<GameTaskConfigItem[]> =>
  resolveTaskCenterApiResult(
    request({
      url: '/task/getGameTaskConfig',
      method: 'post',
      data: {},
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 查询任务页展示所需的会员当日充值与有效投注概览。 */
export const queryMemberDataOverview = (
  data: QueryMemberDataOverviewForm,
  options?: ApiResponseToastOptions
): Promise<MemberDataOverviewResult> =>
  resolveTaskCenterApiResult(
    request({
      url: '/rp/queryMemberDataOverview',
      method: 'post',
      data,
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 查询会员当前活动度和活动度宝箱配置。 */
export const queryMemberActiveValue = (
  options?: ApiResponseToastOptions
): Promise<MemberActiveValueResult> =>
  resolveTaskCenterApiResult(
    request({
      url: '/activityGiftBox/queryMemberActiveValue',
      method: 'post',
      data: {},
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 按当前币种查询会员可参与的新人固定任务列表。 */
export const queryEntrantTasks = (
  data: QueryEntrantTasksForm,
  options?: ApiResponseToastOptions
): Promise<EntrantTaskItem[]> =>
  resolveTaskCenterApiResult(
    request({
      url: '/task/queryEntrantTasks',
      method: 'post',
      data,
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 查询当前会员新人固定任务的完成状态。 */
export const queryEntrantTaskSchedule = (
  options?: ApiResponseToastOptions
): Promise<EntrantTaskScheduleItem[]> =>
  resolveTaskCenterApiResult(
    request({
      url: '/task/queryEntrantTaskSchedule',
      method: 'post',
      data: {},
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 按当前币种查询会员可参与的任务列表。 */
export const queryMemberTasks = (
  data: QueryMemberTasksForm,
  options?: ApiResponseToastOptions
): Promise<MemberTaskItem[]> =>
  resolveTaskCenterApiResult(
    request({
      url: '/task/queryMemberTasks',
      method: 'post',
      data,
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 查询当前会员普通任务的条件完成进度。 */
export const queryTaskSchedule = (options?: ApiResponseToastOptions): Promise<TaskScheduleItem[]> =>
  resolveTaskCenterApiResult(
    request({
      url: '/task/queryTaskSchedule',
      method: 'post',
      data: {},
      showSuccessToast: false,
      showErrorToast: options?.showErrorToast ?? true
    })
  )

/** 领取新人固定任务奖励，调用方必须根据 code === C2 判断业务成功。 */
export const obtainEntrantTaskAmount = (
  data: ObtainEntrantTaskAmountForm,
  options?: ApiResponseToastOptions
): Promise<TaskCenterApiResponse<TaskClaimAmount>> =>
  request({
    url: '/task/obtainEntrantTaskAmount',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 领取普通会员任务奖励，调用方必须根据 code === C2 判断业务成功。 */
export const obtainTaskAmount = (
  data: ObtainTaskAmountForm,
  options?: ApiResponseToastOptions
): Promise<TaskCenterApiResponse<TaskClaimAmount>> =>
  request({
    url: '/task/obtainTaskAmount',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 一键领取当前会员全部可领取的任务奖励。 */
export const obtainAllBonus = (
  options?: ApiResponseToastOptions
): Promise<TaskCenterApiResponse<TaskClaimAmount>> =>
  request({
    url: '/task/obtainAllBonus',
    method: 'post',
    data: {},
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 领取指定活动度宝箱，调用方必须根据 code === C2 判断业务成功。 */
export const receiveGiftBox = (
  data: ReceiveGiftBoxForm,
  options?: ApiResponseToastOptions
): Promise<TaskCenterApiResponse<unknown>> =>
  request({
    url: '/activityGiftBox/receiveGiftBox',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })
