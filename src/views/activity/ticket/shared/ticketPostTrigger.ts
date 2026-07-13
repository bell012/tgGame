import type { MbTicketRecord } from '@/api/interface/activity'
import { getLanguageCode } from '@/utils/locale'

import {
  enrichMbTicketRecords,
  fetchMbTicketListRecords,
  normalizeMbTicketRecords,
  normalizePartialMbTicketRecord
} from './mappers/mbTicketMapper'
import { setUserTicketInventoryRecords } from './userTicketInventory'
import { getTicketActivityEndUseTime } from './utils/ticketActivityCountdown'
import { globalTicketToastState } from '../shell/ticketToast'

export const hasTicketIdentity = (record: MbTicketRecord) =>
  record.rowId != null ||
  record.ticketId != null ||
  record.type != null ||
  Array.isArray(record.languageInfo)

/** 将 triggerConfig 规范化为可展示的票券记录列表 */
export const normalizeTriggerConfigTickets = (value: unknown) =>
  normalizeMbTicketRecords(value).filter(hasTicketIdentity).map(normalizePartialMbTicketRecord)

/** enableTrigger=1 时，关闭结果弹窗应打开领取浮窗 */
export const shouldOpenTriggerReceiveOnClose = (record: MbTicketRecord | null | undefined) =>
  Number(record?.enableTrigger) === 1

/** 读取 triggerConfig 中的下一轮指定票券 */
export const getTriggerReceiveTickets = (record: MbTicketRecord | null | undefined) =>
  record ? normalizeTriggerConfigTickets(record.triggerConfig) : []

const resolveRawNextRoundTickets = (
  nextTickets: MbTicketRecord[] | null | undefined,
  consumedRecord: MbTicketRecord | null | undefined
): MbTicketRecord[] => {
  if (Array.isArray(nextTickets)) {
    return normalizeMbTicketRecords(nextTickets)
      .filter(hasTicketIdentity)
      .map(normalizePartialMbTicketRecord)
  }

  return getTriggerReceiveTickets(consumedRecord)
}

/**
 * 结果弹窗关闭时应展示的下一轮票券：
 * - 仅当已消耗票券 enableTrigger=1 时才有下一轮；
 * - use 接口返回 nextTickets 数组时以其为准（含空数组，表示无下一轮）；
 * - 仅当 nextTickets 未返回（undefined/null）时回退 triggerConfig；
 * - 用 mbTicketList 缓存补全过期时间等缺失字段。
 */
export const resolveNextRoundTickets = (
  nextTickets: MbTicketRecord[] | null | undefined,
  consumedRecord: MbTicketRecord | null | undefined,
  sourceRecords: MbTicketRecord[] = globalTicketToastState.mbTicketRecords
): MbTicketRecord[] => {
  if (!shouldOpenTriggerReceiveOnClose(consumedRecord)) return []

  const resolved = resolveRawNextRoundTickets(nextTickets, consumedRecord)
  return enrichMbTicketRecords(resolved, sourceRecords)
}

const needsExpireEnrichment = (records: MbTicketRecord[]) =>
  records.some(record => getTicketActivityEndUseTime(record) <= 0)

/** 打开领取浮窗前补全票券数据；若缓存仍缺过期时间则刷新 mbTicketList */
export const prepareReceiveTickets = async (
  partialTickets: MbTicketRecord[]
): Promise<MbTicketRecord[]> => {
  let tickets = enrichMbTicketRecords(
    partialTickets.filter(hasTicketIdentity).map(normalizePartialMbTicketRecord),
    globalTicketToastState.mbTicketRecords
  )

  if (tickets.length === 0 || !needsExpireEnrichment(tickets)) {
    return tickets
  }

  try {
    const languageCode = getLanguageCode()
    const records = await fetchMbTicketListRecords(languageCode)
    globalTicketToastState.mbTicketRecords = records
    setUserTicketInventoryRecords(records)
    tickets = enrichMbTicketRecords(tickets, records)
  } catch {
    // 拉取失败时保留缓存补全结果
  }

  return tickets
}
