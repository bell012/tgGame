export interface GameItemDetailVo {
  backColorDown: string
  backColorUp: string
  imageDetail: string
}

export interface GameItemHotVo {
  company2Image: string
  defaultImage: string
  hotImage: string
}

export interface GameItemViewVo {
  imageStyle: number
  imageViewList: string[]
}

export interface GamePicInfo {
  conUrl?: string
  icon1?: string
  icon2?: string
  icon3?: string
  icon4?: string
  icon5?: string
  [key: string]: unknown
}

export interface GameDataItem {
  brandCode: string
  conUrl: string
  demoSort?: number
  enableDemo: number
  gameDesc?: string
  gameDetailJson?: string
  gameItemDetailVo?: GameItemDetailVo
  gameItemHotVo?: GameItemHotVo
  gameItemViewVo?: GameItemViewVo
  gameTypeCode?: string
  homeRecommend?: number
  hot?: number
  hotJson?: string
  hotOrderId?: number
  hotPicInfo?: string
  icon1?: string
  icon2?: string
  icon3?: string
  icon4?: string
  icon5?: string
  initScoreNum?: number
  initScoreStar?: number
  itemCode?: string
  itemName?: string
  orderId?: number
  platformCode?: string
  platformName?: string
  recommend?: number
  recommendOrderId?: number
  recommendPicInfo?: string
  rowId: number
  rowType: number
  serviceStatus: number
  stylePicInfo?: string
  subGame: GameDataItem[]
  sysGameTypeCode?: string
  sysGameTypeName?: string
  viewJson?: string
  [key: string]: unknown
}

export interface GameDataResponse {
  code: string | number
  message: string
  result: GameDataItem[]
  [key: string]: unknown
}

export interface QueryGameDetailsParams {
  rowId: string | number
}

export interface GameDetailResponse {
  code: string | number
  message: string
  result: GameDataItem | null
  [key: string]: unknown
}

export interface GetGameRanListParams {
  itemCode: string
  platformCode: string
  type: 1 | 2
  currency: string
}

export interface GameRanListItem {
  payOut?: string | number
  wager?: string | number
  mult?: string | number
  memberId?: string
  memberName?: string
  userName?: string
  [key: string]: unknown
}

export interface GameRanListResponse {
  code: string | number
  message: string
  result?: GameRanListItem[]
  [key: string]: unknown
}

export interface GetGameBetRecordListParams {
  page: {
    current: number
    size: number
  }
  platformCode: string
  gameCode: string
  currency: string
  betType: 1 | 2
}

export interface GameBetRecordItem {
  betId?: string
  profit?: string | number
  bet?: string | number
  payout?: string | number
  [key: string]: unknown
}

export interface GameBetRecordListResponse {
  code: string | number
  message: string
  result?: GameBetRecordItem[] | { records?: GameBetRecordItem[]; [key: string]: unknown } | null
  [key: string]: unknown
}

export interface GetGameStatisticsParams {
  itemCode: string
  platformCode: string
}

export interface GameStatisticsResult {
  profit?: string | number
  wagered?: string | number
  win?: string | number
  lose?: string | number
  [key: string]: unknown
}

export interface GameStatisticsResponse {
  code: string | number
  message: string
  result?: GameStatisticsResult | null
  [key: string]: unknown
}

/**
 * 游戏品牌节点数据
 * 对应 /gc/gameBrandList 接口返回项
 */
export interface GameBrandItem {
  /** 品牌横幅图 */
  banner: string
  /** 品牌代码 */
  brandCode: string
  /** 品牌名称 */
  brandName: string
  /** 是否启用 */
  enable: number
  /** 默认图标 */
  icon: string
  /** 备用图标 */
  icon2?: string
  /** 选中态图标 */
  iconSelect?: string
  /** 语言代码 */
  languageCode: string
  /** 主键 ID */
  rowId: number
  /** 站点标识 */
  site: string
  /** 排序值 */
  sortNum: number
  /** 样式类型 */
  styleType?: string
  [key: string]: unknown
}

/**
 * 获取游戏品牌列表接口返回结构
 */
export interface GameBrandResponse {
  /** 返回码 */
  code: string | number
  /** 返回消息 */
  message: string
  /** 品牌列表结果 */
  result: GameBrandItem[]
  /** 是否成功 */
  success?: boolean
  [key: string]: unknown
}
