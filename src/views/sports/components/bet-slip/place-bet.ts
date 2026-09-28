import type {
  PlaceBetResponse,
  SportsBetInfoQuote,
  SportsPlaceBetSelectionParams
} from '@/api/interface/sport'
import { SportsBetNotSentError } from '@/stores/sports'

export type BetSubmissionState = 'confirmed' | 'failed' | 'pending' | 'unknown'

const statusCode = (value: unknown): number | undefined => {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined
  if (typeof value === 'string' && !value.trim()) return undefined
  const code = Number(value)
  return Number.isInteger(code) && code >= 0 ? code : undefined
}

const rejectedBetCodes = new Set([
  380, 411, 439, 464, 1000, 1001, 1102, 1103, 1105, 1106, 1107, 1108, 1126, 1132, 1135, 1136, 1141,
  1200
])

// 明确拒绝的状态码；系统错误和维护仍按结果未知处理。
const rejectedRequestCodes = new Set([
  101, 102, 202, 305, 335, 336, 337, 338, 340, 342, 343, 344, 345, 346, 347, 348, 351, 352, 353,
  355, 395, 431, 710, 1000, 1554, 1556, 1557
])

export const toPlaceBetSelection = (quote: SportsBetInfoQuote): SportsPlaceBetSelectionParams => ({
  HomeScore: quote.hs,
  AwayScore: quote.as,
  WagerSelectionId: quote.wsid,
  MarketlineId: quote.mlid,
  BetTypeId: quote.btid,
  BetTypeSelectionId: quote.btsid,
  OutrightTeamId: quote.otid,
  OddsType: quote.ot,
  Handicap: quote.h,
  Odds: quote.o,
  EventId: quote.eid,
  SportId: quote.sid,
  Market: quote.m,
  ComboSelection: 0,
  Specifiers: quote.sp,
  RefId: quote.rid,
  Status: quote.st,
  ...(quote.rsid === undefined ? {} : { RSportId: quote.rsid })
})

// stc=100 只代表至少一笔成功，组合结果逐项判断。
export const getPlaceBetResult = (
  response: PlaceBetResponse,
  combo: number
): BetSubmissionState => {
  if (!response || typeof response !== 'object') return 'unknown'
  if (response.wsis !== undefined && !Array.isArray(response.wsis)) return 'unknown'
  if (response.wsis?.some(item => !item || typeof item !== 'object')) return 'unknown'
  const results = response.wsis?.filter(item => item && statusCode(item.csid) === combo) ?? []
  if (!results.length) {
    const code = statusCode(response.stc)
    return code !== undefined && rejectedRequestCodes.has(code) ? 'failed' : 'unknown'
  }
  if (results.some(item => Number(item.bcs) === 1)) return 'pending'
  if (results.every(item => Number(item.bcs) === 2 && Number(item.bsm) === 100 && item.wid))
    return 'confirmed'
  if (
    results.every(item => Number(item.bcs) === 3 || rejectedBetCodes.has(statusCode(item.bsm) ?? 0))
  )
    return 'failed'
  // 同一组合有成功也有拒绝时，不能整组重投。
  return 'unknown'
}

export const getPlaceBetFailure = (error: unknown): BetSubmissionState =>
  error instanceof SportsBetNotSentError ? 'failed' : 'unknown'
