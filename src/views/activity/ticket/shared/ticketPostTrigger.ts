import type { MbTicketRecord } from '@/api/interface/activity'

import { normalizeMbTicketRecords } from './mappers/mbTicketMapper'

export const hasTicketIdentity = (record: MbTicketRecord) =>
  record.rowId != null ||
  record.ticketId != null ||
  record.type != null ||
  Array.isArray(record.languageInfo)

/** 将 triggerConfig 规范化为可展示的票券记录列表 */
export const normalizeTriggerConfigTickets = (value: unknown) =>
  normalizeMbTicketRecords(value).filter(hasTicketIdentity)

/** enableTrigger=1 时，关闭结果弹窗应打开领取浮窗 */
export const shouldOpenTriggerReceiveOnClose = (record: MbTicketRecord | null | undefined) =>
  Number(record?.enableTrigger) === 1

/** 读取 triggerConfig 中的下一轮指定票券 */
export const getTriggerReceiveTickets = (record: MbTicketRecord | null | undefined) =>
  record ? normalizeTriggerConfigTickets(record.triggerConfig) : []
