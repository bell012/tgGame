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
