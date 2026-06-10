import type {
  MbTicketListForm,
  MbTicketListResponse,
  QueryActivityGroupPageForm,
  QueryActivityGroupPageResponse,
  QueryActivityListForm,
  QueryActivityListResponse,
  QueryCheckInStatusForm,
  QueryCheckInStatusResponse,
  TicketProgressForm,
  TicketProgressResponse,
  QueryTicketMarqueeResponse,
  ReceiveCheckInRewardForm,
  ReceiveCheckInRewardResponse,
  RecordForm,
  RecordResponse,
  TicketMarqueeForm,
  UseTicketForm,
  UseTicketResponse
} from '@/api/interface/activity'
import request, { type ApiResponseToastOptions } from '@/utils/request'

// 活动分组分页查询（新版活动 API §1）
export const queryActivityGroupPage = (
  data: QueryActivityGroupPageForm = {},
  options?: ApiResponseToastOptions
): Promise<QueryActivityGroupPageResponse> => {
  return request({
    url: '/admin/activity/group/page',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? false
  })
}

// 活动列表分页查询（新版活动 API §2）；不传 status 时默认查 1-未开始、2-进行中
export const queryActivityList = (
  data: QueryActivityListForm,
  options?: ApiResponseToastOptions
): Promise<QueryActivityListResponse> => {
  return request({
    url: '/activity/api/list',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? false
  })
}

// 查询当前签到状态。
export const queryCheckInStatus = (
  data: QueryCheckInStatusForm,
  options?: ApiResponseToastOptions
): Promise<QueryCheckInStatusResponse> => {
  return request({
    url: '/activity/checkin/mbSign',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? false
  })
}

// 领取签到奖励。
export const receiveCheckInReward = (
  data: ReceiveCheckInRewardForm
): Promise<ReceiveCheckInRewardResponse> => {
  return request({
    url: '/activity/checkin/receiveReward',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

// 我的票卷列表
export function mbTicketList(data: MbTicketListForm): Promise<MbTicketListResponse> {
  return request({
    url: '/ticket/api/mbTicketList',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

// 票券完成进度
export function ticketProgress(data: TicketProgressForm): Promise<TicketProgressResponse> {
  return request({
    url: '/ticket/api/progress',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

// 票卷记录
export function recordList(data: RecordForm): Promise<RecordResponse> {
  return request({
    url: '/ticket/api/record',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: true
  })
}

/** 使用票券（大转盘 GO 等） */
export const useTicket = (
  data: UseTicketForm,
  options?: ApiResponseToastOptions
): Promise<UseTicketResponse> =>
  request({
    url: '/ticket/api/use',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 查询票券跑马灯 */
export const queryTicketMarquee = (
  data: TicketMarqueeForm,
  options?: ApiResponseToastOptions
): Promise<QueryTicketMarqueeResponse> =>
  request({
    url: '/ticket/api/marquee',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? false
  })
