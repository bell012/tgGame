export type WithdrawTabType = 'Crypto' | 'Fiat'

export type WithdrawOrderStatus = 'processing' | 'completed'

export interface WithdrawSubmitPayload {
  tabType: WithdrawTabType
  amount: number
  channelId: string | number
  currencyCode?: string
  methodLabel: string
  paymentCode?: string | number
  accountRowId?: string | number
  phoneNumber?: string
  accountName?: string
  address?: string
  network?: string
}
