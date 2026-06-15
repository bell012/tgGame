import type { MbTicketRecord, WheelConfigItem } from '@/api/interface/activity'
import { getCurrencySymbol } from '@/utils/locale'
import type { TicketActivitySession, VoucherGameItem } from '../types'
import { mapMbTicketRules, mapMbTicketTasks } from '../reminder/mapReminderTasks'

export type { TicketActivitySession }

export const computeMaxPrizeTextFromWheelConfig = (
  wheelConfig?: WheelConfigItem[] | null
): string => {
  if (!Array.isArray(wheelConfig) || wheelConfig.length === 0) {
    return ''
  }

  let maxAmount = 0

  for (const item of wheelConfig) {
    if (Number(item.rewardType) !== 0) {
      continue
    }

    maxAmount = Math.max(maxAmount, Number(item.amount ?? 0))
  }

  if (maxAmount <= 0) {
    return ''
  }

  return `${getCurrencySymbol()}${maxAmount}`
}

export const mapMbTicketToReminderContext = (
  record: MbTicketRecord | null | undefined
): Pick<TicketActivitySession, 'maxPrizeText' | 'tasks' | 'rules'> => ({
  maxPrizeText: computeMaxPrizeTextFromWheelConfig(record?.wheelConfig),
  tasks: mapMbTicketTasks(record),
  rules: mapMbTicketRules(record)
})

export const buildTicketActivitySession = (
  footer: { games: VoucherGameItem[]; totalVouchers: number },
  activeRecord: MbTicketRecord | null | undefined
): TicketActivitySession => ({
  voucherGames: footer.games,
  totalVouchers: footer.totalVouchers,
  ...mapMbTicketToReminderContext(activeRecord)
})
