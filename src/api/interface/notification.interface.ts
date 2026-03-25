/**
 * 通知消息相关接口类型定义
 */

/**
 * 查询通知消息请求参数
 */
export interface QueryNoticeMsgForm {
  channelId: number | string
  msgType: number
  languageCode?: string
  sysLevelId?: number | string
  page: {
    current: number
    size: number
  }
}

/**
 * 通知记录
 */
export interface NoticeRecord {
  channelId: string[]
  createTime: number
  displayTime: number
  enable: number
  isImage: number
  jumpType: number
  languageCode: string
  linkUrl: string
  linkType: number
  loginAfterPopWay: number
  loginBeforePopWay: number
  memberIds: string[]
  msgType: string
  noticeText: string
  noticeTitle: string
  noticeType: string
  operator: string
  pushChannel: string
  recipientObj: number
  rowId: number
  scene: number
  showTimeEnd: number
  showTimeStart: number
  site: string
  sort: number
  sysLevelIds: string[]
}

/**
 * 查询通知消息响应结果
 */
export interface QueryNoticeMsgResult {
  current: number
  countId?: string
  maxLimit?: number
  optimizeCountSql?: boolean
  optimizeJoinOfCountSql?: boolean
  orders?: Array<{
    column: string
    asc: boolean
  }>
  pages: number
  records: NoticeRecord[]
  searchCount?: boolean
  size: number
  total: number
}

/**
 * 查询通知消息响应
 */
export interface QueryNoticeMsgResponse {
  code?: string
  message?: string
  result?: QueryNoticeMsgResult
  success?: boolean
  current?: number
  records?: NoticeRecord[]
  size?: number
  total?: number
}
