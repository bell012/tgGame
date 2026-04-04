export type WithdrawTabType = 'Crypto' | 'Fiat'

export type WithdrawOrderStatus = 'processing' | 'completed'

export interface WithdrawSubmitPayload {
  tabType: WithdrawTabType
  amount: number
  currencyCode?: string
  methodLabel: string
  phoneNumber?: string
  accountName?: string
  address?: string
  network?: string
}
