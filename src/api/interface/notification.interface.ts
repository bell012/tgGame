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
  /** 终端渠道 */
  channelId?: string[]
  /** 创建时间 */
  createTime: number
  /** 展示时间 */
  displayTime?: number
  /** 状态 */
  enable: number
  /** 内容类型：0 HTML、1 图片、2 文本 */
  isImage: number
  /**
   * 跳转类型：
   * 1 URL 跳转
   * 2 跳转内部页面
   * 3 跳转游戏
   */
  jumpType?: number
  /** 语言编码 */
  languageCode: string
  /** 跳转地址 */
  linkUrl: string
  /**
   * 跳转子类型：
   * jumpType = 1 时：
   * 0 不跳转
   * 1 内部 URL 跳转
   * 2 外部 URL 跳转
   *
   * jumpType = 2 时：
   * 0 不跳转
   * 1 活动
   * 2 充值栏目
   * 3 分享转盘
   * 4 充值页面
   * 5 积分转盘
   * 6 邀请好友
   * 7 登录注册页
   */
  linkType?: number
  loginAfterPopWay: number
  loginBeforePopWay: number
  memberIds?: string[]
  msgType: string
  msgVersion?: number
  noticeText: string
  noticeTitle: string
  noticeType: string
  operator?: string
  pushChannel: string
  readStatus?: number
  readTime?: number
  recipientObj: number
  rowId: number
  scene?: number
  showTimeEnd?: number
  showTimeStart?: number
  site: string
  sort: number
  sysLevelIds?: string[]
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
