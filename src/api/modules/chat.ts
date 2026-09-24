import type {
  AutoReplyItem,
  AutoReplyType,
  ChatApiResponse,
  OnlineChatCustomer,
  QueryAutoReplyForm,
  QueryOnlineCustomerForm
} from '@/api/interface/chat'
import request, { type ApiResponseToastOptions } from '@/utils/request'

/** 查询当前会员可联系的在线客服列表。 */
export const queryOnlineCustomer = (
  data: QueryOnlineCustomerForm,
  options?: ApiResponseToastOptions
): Promise<ChatApiResponse<OnlineChatCustomer[]>> =>
  request({
    url: '/customer/onlineCustomer',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 查询快捷自动回复分类。 */
export const queryAutoReplyTypes = (
  options?: ApiResponseToastOptions
): Promise<ChatApiResponse<AutoReplyType[]>> =>
  request({
    url: '/autoReply/listAutoReplyType',
    method: 'post',
    data: {},
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 按自动回复分类查询可发送的问题。 */
export const queryAutoReplies = (
  data: QueryAutoReplyForm,
  options?: ApiResponseToastOptions
): Promise<ChatApiResponse<AutoReplyItem[]>> =>
  request({
    url: '/autoReply/listAutoReply',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })
