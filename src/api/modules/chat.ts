import type {
  AutoReplyItem,
  AutoReplyType,
  ChatApiResponse,
  ChatConfig,
  ChatHistoryPage,
  OnlineChatCustomer,
  QueryAutoReplyForm,
  QueryChatHistoryForm,
  QueryChatConfigParams,
  QueryOnlineCustomerForm,
  ReceiveRedPackageForm
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

/** 查询已登录会员与指定客服的服务端历史消息。 */
export const queryChatHistory = (
  data: QueryChatHistoryForm,
  options?: ApiResponseToastOptions
): Promise<ChatApiResponse<ChatHistoryPage>> =>
  request({
    url: '/user/hisMsg',
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

/** 查询客服欢迎语及相关展示配置。 */
export const queryChatConfig = (
  params: QueryChatConfigParams,
  options?: ApiResponseToastOptions
): Promise<ChatApiResponse<ChatConfig>> =>
  request({
    url: '/queryConfig',
    method: 'get',
    params,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })

/** 领取客服通过 WebSocket 下发的红包。 */
export const receiveRedPackage = (
  data: ReceiveRedPackageForm,
  options?: ApiResponseToastOptions
): Promise<ChatApiResponse<unknown>> =>
  request({
    url: '/member/receiveRedPackage',
    method: 'post',
    data,
    showSuccessToast: false,
    showErrorToast: options?.showErrorToast ?? true
  })
