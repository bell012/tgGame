import type {
  QueryActivityGroupPageForm,
  QueryActivityGroupPageResponse,
  QueryActivityListForm,
  QueryActivityListResponse,
  QueryCheckInStatusForm,
  QueryCheckInStatusResponse,
  MbTicketListForm,
  MbTicketListResponse,
  RecordForm,
  RecordResponse,
  QueryLuckySpinInfoForm,
  QueryLuckySpinInfoResponse,
  DoLuckySpinForm,
  DoLuckySpinResponse,
  TicketMarqueeForm,
  QueryTicketMarqueeResponse
} from '@/api/interface/activity'
import request, { type ApiResponseToastOptions } from '@/utils/request'
import {
  createMockLuckySpinInfo,
  getMockRemainingSpins,
  mockDoLuckySpin
} from '@/api/mock/luckySpin'

const USE_MOCK = true

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

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

/** 查询大转盘活动信息 */
export const queryLuckySpinInfo = async (
  _data?: QueryLuckySpinInfoForm,
  _options?: ApiResponseToastOptions
): Promise<QueryLuckySpinInfoResponse> => {
  if (USE_MOCK) {
    await mockDelay()
    const info = createMockLuckySpinInfo()
    return {
      code: '0',
      message: 'success',
      success: true,
      result: { ...info, remainingSpins: getMockRemainingSpins() }
    }
  }

  return request({
    url: '/ticket/api/luckySpinInfo',
    method: 'post',
    data: _data,
    showSuccessToast: false,
    showErrorToast: _options?.showErrorToast ?? false
  })
}

/** 执行一次大转盘抽奖 */
export const doLuckySpin = async (
  _data?: DoLuckySpinForm,
  _options?: ApiResponseToastOptions
): Promise<DoLuckySpinResponse> => {
  if (USE_MOCK) {
    await mockDelay(500)
    return {
      code: '0',
      message: 'success',
      success: true,
      result: mockDoLuckySpin()
    }
  }

  return request({
    url: '/ticket/api/luckySpin',
    method: 'post',
    data: _data,
    showSuccessToast: false,
    showErrorToast: _options?.showErrorToast ?? false
  })
}

/** 查询票券跑马灯（始终走真实接口，不走 USE_MOCK） */
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
