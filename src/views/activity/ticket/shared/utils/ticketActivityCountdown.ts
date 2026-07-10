import type { MbTicketRecord } from '@/api/interface/activity'

const padTimeUnit = (value: number) =>
  String(Math.min(99, Math.max(0, Math.floor(value)))).padStart(2, '0')

/** 秒级 Unix 时间戳归一为毫秒，避免接口/mock 混用单位 */
const normalizeActivityEndTime = (endUseTime: number): number => {
  if (!Number.isFinite(endUseTime) || endUseTime <= 0) {
    return 0
  }

  return endUseTime < 1e12 ? endUseTime * 1000 : endUseTime
}

/** 活动弹窗：当前票结束时间，优先 endUseTime，否则 expireTime */
export const getTicketActivityEndUseTime = (record: MbTicketRecord | null | undefined): number => {
  if (!record) return 0

  const endUseTime = Number(record.endUseTime)
  if (Number.isFinite(endUseTime) && endUseTime > 0) {
    return endUseTime
  }

  const expireTime = Number(record.expireTime)
  return Number.isFinite(expireTime) && expireTime > 0 ? expireTime : 0
}

/** 活动弹窗头部倒计时 HH:MM:SS；已过期或非法时 99:99:99 */
export const formatTicketActivityCountdown = (
  endUseTime: number | undefined,
  nowTimestamp: number
): string => {
  const targetTime = normalizeActivityEndTime(Number(endUseTime))

  if (!Number.isFinite(targetTime) || targetTime <= 0) {
    return '99:99:99'
  }

  const remaining = targetTime - nowTimestamp

  if (remaining <= 0) {
    return '99:99:99'
  }

  const totalSeconds = Math.floor(remaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${padTimeUnit(hours)}:${padTimeUnit(minutes)}:${padTimeUnit(seconds)}`
}
