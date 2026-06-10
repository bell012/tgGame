import type { MbTicketRecord, MbTicketTriggerItem, WheelConfigItem } from '@/api/interface/activity'
import { getCurrencySymbol } from '@/utils/locale'
import type { LuckySpinTask, TicketActivitySession, VoucherGameItem } from './types'

const normalizeText = (value: unknown) => String(value ?? '').trim()

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

const mapTriggerTypeToAction = (triggerType: number): LuckySpinTask['actionType'] => {
  if (triggerType === 1) return 'deposit'
  if (triggerType === 2) return 'bet'
  return undefined
}

const mapTriggerItemToTask = (item: MbTicketTriggerItem, index: number): LuckySpinTask => {
  const target = Number(item.triggerValue ?? 0)
  const current = Number(item.currentValue ?? 0)
  const finished = Number(item.finishStatus) === 1 || (target > 0 && current >= target)
  const progress =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : finished ? 100 : 0

  return {
    id: String(item.rowId ?? `trigger-${index}`),
    title: normalizeText(item.title ?? item.name) || `Task ${index + 1}`,
    progress,
    finished,
    actionType: mapTriggerTypeToAction(Number(item.triggerType))
  }
}

export const mapMbTicketRules = (record: MbTicketRecord | null | undefined): string[] => {
  if (!record) {
    return []
  }

  if (Array.isArray(record.ruleList) && record.ruleList.length > 0) {
    return record.ruleList.map(normalizeText).filter(Boolean)
  }

  const ruleDesc = normalizeText(record.ruleDesc)

  if (ruleDesc) {
    return ruleDesc
      .split(/\n+/)
      .map(line => line.trim())
      .filter(Boolean)
  }

  return []
}

export const mapMbTicketTasks = (record: MbTicketRecord | null | undefined): LuckySpinTask[] => {
  if (!record || !Array.isArray(record.triggerList) || record.triggerList.length === 0) {
    return []
  }

  return record.triggerList.map(mapTriggerItemToTask)
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
