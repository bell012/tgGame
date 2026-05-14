// 游戏数据列表 单项
export interface GameDataItem {
  brandCode: string
  conUrl: string
  enableDemo: number
  gameDesc: string
  gameDetailJson: string
  gameItemDetailVo: {
    backColorDown: string
    backColorUp: string
    imageDetail: string
  }
  gameItemHotVo: {
    company2Image: string
    defaultImage: string
    hotImage: string
  }
  gameItemViewVo: {
    imageStyle: number
    imageViewList: Array<{}>
  }
  gameTypeCode: string
  homeRecommend: number
  hot: number
  hotJson: string
  hotOrderId: number
  icon1: string
  icon2: string
  icon3: string
  icon4: string
  icon5: string
  initScoreNum: number
  initScoreStar: number
  orderId: number
  recommend: number
  recommendOrderId: number
  rowId: number
  rowType: number
  serviceStatus: number
  subGame: SubGameItem[]
  sysGameTypeCode: string
  sysGameTypeName: string
  viewJson: string
}

// 游戏数据列表 响应
export interface GameDataResponse {
  code: string
  message: string
  success: boolean
  result?: GameDataItem[]
}

export interface GetRecentBigWinsParams {
  currency: string
  type: 1 | 2
}

export interface RecentBigWinsItem {
  coverImg?: string
  currency?: string
  gameName?: string
  gameType?: string
  multiple?: number | string
  nickName?: string
  rowId?: number | string
  vipId?: number
  winAmount?: number | string
  betAmount?: number | string
  gameAmount?: number | string
  betTime?: string
  createTime?: string
  gameTime?: string
  [key: string]: unknown
}

export interface RecentBigWinsResponse {
  code: string | number
  message: string
  success: boolean
  result?: RecentBigWinsItem[]
}

export interface QuerySlideshowPageRequest {
  current: number
  size: number
}

export interface QuerySlideshowParam {
  ColumnCode?: string
}

export interface QuerySlideshowRequest {
  languageCode?: string
  param?: QuerySlideshowParam
  channelId: string // 1：竖版 2：横版  3：PC   4：H5
  page: QuerySlideshowPageRequest
  /** 应用场景 1:首页 2:个人中心 3:好友分享 4:邀请好友 5:登录与注册 6:首页（未登录） */
  deploymentPath?: number
  /** 登录状态 0:未登录 1:已登录 */
  requireLogin?: number
}

/** 轮播图跳转类型：1 url 跳转，2 跳转内部项面，3 跳转游戏 */
export type QuerySlideshowJumpType = 1 | 2 | 3

/** jumpType=1 时：0 不跳转,1 内部跳转，2 外部跳转 */
export type QuerySlideshowUrlLinkType = 0 | 1 | 2

/** jumpType=2 时：0 不跳转，1 活动ID，2 充值栏目，3 分享转盘，4 充值页面，5 积分转盘，6 邀请好友，7 登录注册页面 */
export type QuerySlideshowInnerLinkType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

/** jumpType=3 时：0 不跳转，1 自定义类型游戏，2 厂商游戏，3 游戏类型 */
export type QuerySlideshowPlatformType = 0 | 1 | 2 | 3

/** 应用场景：1 首页，2 个人中心，3 好友分享，4 邀请好友，5 登录与注册，6 首页未登录 */
export type QuerySlideshowDeploymentPath = 1 | 2 | 3 | 4 | 5 | 6

export interface QuerySlideshowItem {
  channelId: string[]
  deploymentPath: QuerySlideshowDeploymentPath
  enable: number
  jumpType: QuerySlideshowJumpType
  languageCode: string
  linkId: string
  linkType: QuerySlideshowUrlLinkType | QuerySlideshowInnerLinkType
  linkUrl: string
  platformType?: QuerySlideshowPlatformType
  rowId: number
  site: string
  slideshowName: string
  sortNum: number
  skinUrl?: string
  type: number
  url: string
  [key: string]: unknown
}

export interface QuerySlideshowPageResult {
  current: number
  pages: number
  records: QuerySlideshowItem[]
  size: number
  total: number
}

export interface QuerySlideshowResponse {
  code: string | number
  message: string
  success: boolean
  result?: QuerySlideshowPageResult
}

export interface QueryNoticeMsgPageRequest {
  current: number
  size: number
}

export interface QueryNoticeMsgRequest {
  languageCode?: string
  msgType?: string
  noticeType?: string
  noticeTitle?: string
  startTime?: number
  endTime?: number
  channelId?: string
  enable?: number
  param?: {
    scene?: number
    operator?: string
  }
  page: QueryNoticeMsgPageRequest
}

export interface QueryNoticeMsgItem {
  rowId: number
  noticeTitle?: string
  isImage?: number
  noticeText?: string
  noticeType?: string
  msgType?: string
  jumpType?: number
  linkUrl?: string
  linkType?: number
  createTime?: number
  enable?: number
  scene?: number
  [key: string]: unknown
}

export interface QueryNoticeMsgPageResult {
  records: QueryNoticeMsgItem[]
  total: number
  size: number
  current: number
  pages: number
}

export interface QueryNoticeMsgResponse {
  code: string | number
  message: string
  success: boolean
  result?: QueryNoticeMsgPageResult
}

export interface SubGameItem {
  brandCode: string
  conUrl: string
  enableDemo: number
  gameDesc: string
  gameDetailJson: string
  gameItemDetailVo: {
    backColorDown: string
    backColorUp: string
    imageDetail: string
  }
  gameItemHotVo: {
    company2Image: string
    defaultImage: string
    hotImage: string
  }
  gameItemViewVo: {
    imageStyle: number
    imageViewList: Array<{}>
  }
  gameTypeCode: string
  homeRecommend: number
  hot: number
  hotJson: string
  hotOrderId: number
  icon1: string
  icon2: string
  icon3: string
  icon4: string
  icon5: string
  initScoreNum: number
  initScoreStar: number
  orderId: number
  platformCode: string
  platformName: string
  recommend: number
  recommendOrderId: number
  rowId: number
  rowType: number
  serviceStatus: number
  subGame: SubGameItem2[]
  sysGameTypeCode: string
  sysGameTypeName: string
  viewJson: string
}

export interface SubGameItem2 {
  brandCode: string
  conUrl: string
  enableDemo: number
  gameDetailJson: string
  gameItemDetailVo: {
    backColorDown: string
    backColorUp: string
    imageDetail: string
  }
  gameItemHotVo: {
    company2Image: string
    defaultImage: string
    hotImage: string
  }
  gameTypeCode: string
  homeRecommend: number
  hot: number
  hotJson: string
  hotOrderId: number
  hotPicInfo: string
  icon1: string
  icon2: string
  icon3: string
  icon4: string
  initScoreNum: number
  initScoreStar: number
  itemCode: string
  itemName: string
  orderId: number
  platformCode: string
  platformName: string
  recommend: number
  recommendOrderId: number
  recommendPicInfo: string
  rowId: number
  rowType: number
  serviceStatus: number
  stylePicInfo: string
  subGame: []
  sysGameTypeCode: string
  sysGameTypeName: string
}
