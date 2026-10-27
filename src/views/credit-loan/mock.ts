export interface CreditLoanRuleItem {
  content: string
  highlight?: string
}

export type LoanRecordType = 'loan' | 'transfer'
export type LoanRecordFilter = 'all' | LoanRecordType
