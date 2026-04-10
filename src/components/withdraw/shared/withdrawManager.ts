import type { WithdrawManagerItem } from '@/api/interface/withdraw'

export const isVisibleWithdrawManagerItem = (item: WithdrawManagerItem) => {
  return Number(item.status ?? 0) === 1
}

export const isCryptoWithdrawManagerItem = (item: WithdrawManagerItem) => {
  return Number(item.channelType ?? 0) === 5
}

export const normalizeWithdrawManagerItem = (item: WithdrawManagerItem): WithdrawManagerItem => ({
  ...item,
  columnCode: item.columnCode ?? item.paymentCode,
  cardType: item.cardType ?? item.channelType
})

export const splitWithdrawManagerMethods = (items: WithdrawManagerItem[]) => {
  const visibleItems = items.filter(isVisibleWithdrawManagerItem).map(normalizeWithdrawManagerItem)

  return {
    fiatMethods: visibleItems.filter(item => Number(item.channelType ?? 0) === 6),
    cryptoMethods: visibleItems.filter(isCryptoWithdrawManagerItem)
  }
}
