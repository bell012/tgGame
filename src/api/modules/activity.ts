import type {
  QueryActivityListForm,
  QueryActivityListResponse,
  QueryCheckInStatusForm,
  QueryCheckInStatusResponse,
  MbTicketListForm,
  MbTicketListResponse,
  RecordForm,
  RecordResponse
} from '@/api/interface/activity'
import request, { type ApiResponseToastOptions } from '@/utils/request'

// 查询活动列表，用于筛选签到活动。
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
