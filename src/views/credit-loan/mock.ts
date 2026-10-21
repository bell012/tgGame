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
