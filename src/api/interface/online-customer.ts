export interface OnlineCustomerConfig {
  rowId: number
  name: string
  site: string
  url: string
  imageUrl: string
  status: number
  type: number
  subType: number
  languageCode: string[]
  operator: string
  createTime: number
  updateTime: number
}

export interface OnlineCustomerResponse {
  code: string
  message: string
  success: boolean
  result?: OnlineCustomerConfig | null
}
