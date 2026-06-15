import type { MbTicketRecord, MbTicketTriggerItem } from '@/api/interface/activity'
import type { TicketReminderTask } from './types'

const normalizeText = (value: unknown) => String(value ?? '').trim()

const mapTriggerTypeToAction = (triggerType: number): TicketReminderTask['actionType'] => {
  if (triggerType === 1) return 'deposit'
  if (triggerType === 2) return 'bet'
  return undefined
}

const mapTriggerItemToTask = (item: MbTicketTriggerItem, index: number): TicketReminderTask => {
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

export const mapMbTicketTasks = (
  record: MbTicketRecord | null | undefined
): TicketReminderTask[] => {
  if (!record || !Array.isArray(record.triggerList) || record.triggerList.length === 0) {
    return []
  }

  return record.triggerList.map(mapTriggerItemToTask)
}
