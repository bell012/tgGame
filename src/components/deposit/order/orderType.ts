type OrderKind = 'Crypto' | 'Fiat'
// 公共字段
export interface BaseOrderType {
  order_no: string
  created_at: string
  amount: number
  method: string
  method_icon: string
  type: OrderKind
  status: string
}

// 法币订单
export interface FiatOrderType extends BaseOrderType {
  bonus: string
  currency: string
}

// 加密订单
export interface CryptOrderType extends BaseOrderType {
  rate: string
  network: string
  address_token: string
}

// 合并类型（推荐用这个）
export type OrderType = FiatOrderType | CryptOrderType

// 默认 FiatOrder
export const defaultFiatOrder: FiatOrderType = {
  order_no: '',
  created_at: '',
  amount: 0,
  method: '',
  method_icon: '',
  type: 'Fiat',
  bonus: '',
  currency: '',
  status: 'no'
}

// 默认 CryptoOrder
export const defaultCryptOrder: CryptOrderType = {
  order_no: '',
  created_at: '',
  amount: 0,
  method: '',
  method_icon: '',
  type: 'Crypto',
  rate: '',
  network: '',
  address_token: '',
  status: 'no'
}
