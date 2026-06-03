import Api from '@/api'
import type { MbTicketRecord } from '@/api/interface/activity'
import { getGameIcon } from './assets'
import type { TicketGameId, VoucherGameItem } from './types'

export interface MbTicketLanguageInfoItem {
  description?: string
  imageUrl?: string
  languageCode?: string
  name?: string
}

/**
 * 票券 type → 活动玩法 id
 * 1 现金兑换卷  2 幸运红包卷  3 砸金蛋票券  4 大转盘票券
 * 5 拼多多票券（预留，不映射）  6 盲盒票券
 */
export const TICKET_TYPE_TO_GAME_ID: Partial<Record<number, TicketGameId>> = {
  1: 'cash_voucher',
  2: 'lucky_red_envelope',
  3: 'golden_egg',
  4: 'lucky_spin',
  6: 'mystery_box'
}

/** @deprecated 使用 TICKET_TYPE_TO_GAME_ID */
export const VOUCHER_GAME_ID_MAP = TICKET_TYPE_TO_GAME_ID

/** 券种条排序：仅对接口返回的玩法类型按此顺序排列 */
export const TICKET_GAME_DISPLAY_ORDER: TicketGameId[] = [
  'golden_egg',
  'mystery_box',
  'lucky_spin',
  'lucky_red_envelope',
  'cash_voucher'
]

const normalizeText = (value: unknown) => String(value ?? '').trim()

export const normalizeLanguageCode = (value: unknown) => normalizeText(value).toLowerCase()

const isSameLanguageCode = (sourceLanguageCode: unknown, currentLanguageCode: string) => {
  const normalizedSourceLanguageCode = normalizeLanguageCode(sourceLanguageCode)

  if (!normalizedSourceLanguageCode) {
    return false
  }

  if (normalizedSourceLanguageCode === currentLanguageCode) {
    return true
  }

  if (currentLanguageCode === 'eng') {
    return normalizedSourceLanguageCode === 'en'
  }

  if (currentLanguageCode === 'zh') {
    return normalizedSourceLanguageCode === 'zh-cn' || normalizedSourceLanguageCode === 'zh_cn'
  }

  return normalizedSourceLanguageCode.startsWith(currentLanguageCode)
}

/** 兼容 result 为数组或分页包裹结构 */
export const normalizeMbTicketRecords = (result: unknown): MbTicketRecord[] => {
  if (Array.isArray(result)) {
    return result as MbTicketRecord[]
  }

  if (!result || typeof result !== 'object') {
    return []
  }

  const container = result as {
    records?: unknown
    list?: unknown
    data?: unknown
  }

  if (Array.isArray(container.records)) {
    return container.records as MbTicketRecord[]
  }

  if (Array.isArray(container.list)) {
    return container.list as MbTicketRecord[]
  }

  if (Array.isArray(container.data)) {
    return container.data as MbTicketRecord[]
  }

  return [result as MbTicketRecord]
}

/** 根据当前站点语言，从 languageInfo 中优先挑选匹配项 */
export const resolveLanguageInfo = (
  languageInfo: MbTicketLanguageInfoItem[] | undefined,
  currentLanguageCode: string
) => {
  if (!Array.isArray(languageInfo) || languageInfo.length === 0) {
    return undefined
  }

  return (
    languageInfo.find(item => isSameLanguageCode(item.languageCode, currentLanguageCode)) ??
    languageInfo[0]
  )
}

/** 当前语言下的票券文案（与我的票券卡片 title / description 一致） */
export const getMbTicketLanguageCopy = (
  record: MbTicketRecord | null | undefined,
  languageCode: string
) => {
  if (!record) {
    return { name: '', description: '' }
  }

  const languageInfo = resolveLanguageInfo(record.languageInfo, normalizeLanguageCode(languageCode))

  return {
    name: normalizeText(languageInfo?.name),
    description: normalizeText(languageInfo?.description)
  }
}

/** 按玩法筛选票券（保留 result 数组顺序） */
export const findMbTicketsByGameId = (
  records: MbTicketRecord[],
  gameId: TicketGameId
): MbTicketRecord[] =>
  records.filter(record => TICKET_TYPE_TO_GAME_ID[Number(record.type)] === gameId)

/** 拉取我的票券列表；失败或 success=false 时抛出 */
export const fetchMbTicketListRecords = async (languageCode: string): Promise<MbTicketRecord[]> => {
  const response = await Api.activity.mbTicketList({ languageCode })

  if (!response.success) {
    throw new Error(response.message || 'mbTicketList failed')
  }

  return normalizeMbTicketRecords(response.result)
}

/** 单条票券 → 券种条格子（不去重，顺序与接口 result 一致） */
export const mapMbTicketRecordToVoucherItem = (
  record: MbTicketRecord,
  index: number,
  languageCode: string
): VoucherGameItem => {
  const gameId = TICKET_TYPE_TO_GAME_ID[Number(record.type)]
  const languageInfo = resolveLanguageInfo(record.languageInfo, normalizeLanguageCode(languageCode))
  const iconFromApi = normalizeText(languageInfo?.imageUrl)

  return {
    id: `ticket-${record.rowId ?? record.ticketId ?? index}`,
    gameId,
    rowId: record.rowId,
    ticketId: record.ticketId,
    icon: iconFromApi || (gameId ? getGameIcon(gameId) : getGameIcon('mystery_box')),
    label: normalizeText(languageInfo?.name) || undefined
  }
}

/** 票券列表 → 活动弹窗券种条数据（接口几条展示几个） */
export const mapMbTicketListToFooter = (
  result: unknown,
  languageCode: string
): { games: VoucherGameItem[]; totalVouchers: number } => {
  const records = normalizeMbTicketRecords(result)
  const games = records.map((record, index) =>
    mapMbTicketRecordToVoucherItem(record, index, languageCode)
  )

  return {
    games,
    totalVouchers: records.length
  }
}
