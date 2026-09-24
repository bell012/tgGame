/** 客服模块通用业务响应结构。 */
export interface ChatApiResponse<TResult> {
  code: string
  message: string
  success?: boolean
  result?: TResult
}

/** 在线客服列表查询参数。 */
export interface QueryOnlineCustomerForm {
  userId: string
}

/** 在线客服记录。 */
export interface OnlineChatCustomer {
  id: string | number
  account?: string
  avatar?: string
  dealerCode?: string
  nickName?: string
  onlineStatus?: number
  unreadCount?: number
  lastMessageTime?: number
  sort?: number
}

/** 自动回复类型。 */
export interface AutoReplyType {
  id: string | number
  created?: number
  typeName?: string
}

/** 自动回复问题查询参数。 */
export interface QueryAutoReplyForm {
  param: {
    questionType: string | number
  }
}

/** 客服欢迎语配置查询参数。 */
export interface QueryChatConfigParams {
  t: number
}

/** 客服欢迎语配置。 */
export interface ChatQaConfig {
  reminderText?: string
  reminderColor?: string
  fontColor?: string
  isEnabled?: boolean
  autotime?: number
  manualtime?: number
}

/** 客服配置接口返回内容。 */
export interface ChatConfig {
  qaConfig?: ChatQaConfig | string
  styleConfig?: Record<string, unknown>
}

/** 自动回复附带图片信息。 */
export interface AutoReplyImage {
  imgUrl?: string
  fileName?: string
  fileFormat?: string
  imgSize?: string | number
  imageWidth?: number
  imageHeight?: number
}

/** 自动回复问题与内容。 */
export interface AutoReplyItem {
  id: string | number
  questionTitle?: string
  replyType?: 'text' | 'textImg' | string
  questionType?: string | number
  content?: string
  imageList?: AutoReplyImage[]
}
