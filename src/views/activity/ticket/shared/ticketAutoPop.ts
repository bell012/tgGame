import type { MbTicketRecord } from '@/api/interface/activity'
import {
  markPopupShown,
  shouldShowPopup,
  resolvePopupMode,
  popupKey,
  type PopupFrequencyContext
} from '@/utils/popupFrequency'
import { TICKET_TYPE_TO_GAME_ID } from './mappers/mbTicketMapper'
import type { TicketGameId } from './types'

/**
 * unusedTicketPopWay：未使用票券自动弹窗方式
 * 0 不弹窗、1 每日一次、2 每次登录、3 只弹一次、4 高频（每次进入/刷新首页）
 */
export const TICKET_POP_WAY = {
  NONE: 0,
  DAILY: 1,
  EACH_LOGIN: 2,
  ONCE: 3,
  FREQUENT: 4
} as const

/** 弹窗优先级权重（越大越优先）：高频 > 每次登录 > 每日一次 > 仅一次 > 不弹 */
const POP_WAY_PRIORITY: Record<number, number> = {
  [TICKET_POP_WAY.FREQUENT]: 4,
  [TICKET_POP_WAY.EACH_LOGIN]: 3,
  [TICKET_POP_WAY.DAILY]: 2,
  [TICKET_POP_WAY.ONCE]: 1,
  [TICKET_POP_WAY.NONE]: 0
}

const getPopWay = (record: MbTicketRecord) => Number(record.unusedTicketPopWay ?? 0)

const getPriority = (record: MbTicketRecord) => POP_WAY_PRIORITY[getPopWay(record)] ?? 0

/** 票券本地去重标识：rowId 优先，回退 ticketId */
const getAutoPopId = (record: MbTicketRecord) => String(record.rowId ?? record.ticketId ?? '')

const getGameId = (record: MbTicketRecord): TicketGameId | undefined =>
  TICKET_TYPE_TO_GAME_ID[Number(record.type)]

const optionsFor = (record: MbTicketRecord, context: PopupFrequencyContext) => ({
  ...context,
  key: popupKey('ticket', getAutoPopId(record)),
  mode: resolvePopupMode(getPopWay(record), 'authenticated')
})

export const shouldAutoPopByRule = (record: MbTicketRecord, context: PopupFrequencyContext) =>
  Boolean(context.memberId) && shouldShowPopup(optionsFor(record, context))

export const markAutoPopShown = (record: MbTicketRecord, context: PopupFrequencyContext) => {
  if (context.memberId) markPopupShown(optionsFor(record, context))
}

/** 按优先级稳定降序排序（同权重保持接口原始顺序） */
export const sortRecordsByPopPriority = (records: MbTicketRecord[]): MbTicketRecord[] =>
  records
    .map((record, index) => ({ record, index }))
    .sort((a, b) => getPriority(b.record) - getPriority(a.record) || a.index - b.index)
    .map(item => item.record)

export interface TicketAutoPopResolution {
  /** 按优先级排序后的整表（与活动页券种条索引对齐） */
  sortedRecords: MbTicketRecord[]
  /** 优先级最高且可映射玩法的票券（默认选中项） */
  topRecord: MbTicketRecord | null
  /** topRecord 对应玩法 id */
  gameId: TicketGameId | null
  /** 是否应自动弹窗：仅当 topRecord 满足其频率规则时为 true */
  shouldAutoPop: boolean
}

/** 解析自动弹窗结果：排序整表 + 选中项 + 是否触发 */
export const resolveTicketAutoPop = (
  records: MbTicketRecord[],
  context: PopupFrequencyContext
): TicketAutoPopResolution => {
  const sortedRecords = sortRecordsByPopPriority(records)
  const topRecord = sortedRecords[0] ?? null
  const gameId = topRecord ? (getGameId(topRecord) ?? null) : null

  const shouldAutoPop = Boolean(
    topRecord &&
    gameId &&
    getPopWay(topRecord) !== TICKET_POP_WAY.NONE &&
    shouldAutoPopByRule(topRecord, context)
  )

  return { sortedRecords, topRecord, gameId, shouldAutoPop }
}
