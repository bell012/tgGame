import type { QueryOrderInfoPageForm, QueryOrderInfoResult } from '@/api/interface/record.interface'

export interface CreditLoanRuleItem {
  content: string
  highlight?: string
}

/** Loan Details 各条规则的高亮文案，接口返回后替换 */
export const CREDIT_LOAN_RULE_HIGHLIGHTS: Record<number, string> = {
  3: 'Maintain deposit and betting records to restore or increase your borrowing limit!',
  4: 'If you have winnings, transfer the profits to your account balance before the system clears them automatically.'
}

export type LoanRecordType = 'loan' | 'transfer'
export type LoanRecordFilter = 'all' | LoanRecordType

export interface LoanRecordItem {
  id: string
  type: LoanRecordType
  amount: number
  createTime: number
}

const LOAN_RECORDS_MOCK: LoanRecordItem[] = Array.from({ length: 23 }, (_, index) => ({
  id: String(index + 1),
  type: index % 3 === 0 ? 'loan' : 'transfer',
  amount: 1000,
  createTime: Date.UTC(2026, 11, 18, 4, 14, 15) - index * 3600 * 1000
}))

/** 借款记录分页查询，接口返回后替换 */
export const fetchLoanRecordsMock = async (params: {
  type: LoanRecordFilter
  page: number
  pageSize: number
}): Promise<{ list: LoanRecordItem[]; total: number }> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const filtered =
    params.type === 'all'
      ? LOAN_RECORDS_MOCK
      : LOAN_RECORDS_MOCK.filter(item => item.type === params.type)
  const start = (params.page - 1) * params.pageSize

  return {
    list: filtered.slice(start, start + params.pageSize),
    total: filtered.length
  }
}

export type LoanBetRecord = QueryOrderInfoResult['records'][number] & { gameName?: string }

const LOAN_BET_RECORDS_MOCK: LoanBetRecord[] = Array.from({ length: 56 }, (_, index) => {
  const status = index % 3 === 0 ? 0 : 1
  const createTime = Date.UTC(2026, 11, 18, 4, 14, 15) - index * 3600 * 1000

  return {
    rowId: index + 1,
    memberId: '',
    memberRowId: 0,
    currency: 'USD',
    issueId: '',
    betId: `LOAN${String(index + 1).padStart(8, '0')}`,
    sysGameTypeCode: 'DZ',
    platformCode: 'PG',
    gameCode: 'dragon-hatch',
    gameName: 'Dragon Hatch',
    betAmount: 1000,
    gameAmount: status === 0 ? 0 : index % 2 === 0 ? 1000 : -1000,
    betTime: createTime,
    createTime,
    score: 0,
    balanceAfterBetting: 0,
    validBet: 1000,
    remark: '',
    batchNo: 0,
    betContent1: '',
    betContent2: '',
    betContent3: '',
    betContent4: '',
    betContent6: '',
    site: '',
    downloadSite: '',
    channelId: '',
    status
  }
})

/** 借呗投注记录分页查询，接口返回后替换 */
export const fetchLoanBetRecordsMock = async (
  form: QueryOrderInfoPageForm
): Promise<{ list: LoanBetRecord[]; total: number; pages: number }> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const { secondStartTime, secondEndTime, winlost, page, param } = form
  const filtered = LOAN_BET_RECORDS_MOCK.filter(item => {
    if (param.status !== null && item.status !== param.status) return false
    if (winlost !== null && (item.status === 0 || Number(item.gameAmount >= 0) !== winlost)) {
      return false
    }
    if (param.sysGameTypeCode && item.sysGameTypeCode !== param.sysGameTypeCode) return false
    if (param.platformCode && item.platformCode !== param.platformCode) return false
    if (secondStartTime !== null && item.createTime < secondStartTime) return false
    if (secondEndTime !== null && item.createTime > secondEndTime) return false
    return true
  })
  const start = (page.current - 1) * page.size

  return {
    list: filtered.slice(start, start + page.size),
    total: filtered.length,
    pages: Math.max(1, Math.ceil(filtered.length / page.size))
  }
}
