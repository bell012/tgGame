export interface CreditLoanRuleItem {
  content: string
  highlight?: string
}

/** Loan Details 各条规则的高亮文案，接口返回后替换 */
export const CREDIT_LOAN_RULE_HIGHLIGHTS: Record<number, string> = {
  3: 'Maintain deposit and betting records to restore or increase your borrowing limit!',
  4: 'If you have winnings, transfer the profits to your account balance before the system clears them automatically.'
}
