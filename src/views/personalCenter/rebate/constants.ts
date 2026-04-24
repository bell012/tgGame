import type { RebateRuleSection } from './types'

export const rebateRuleSections: RebateRuleSection[] = [
  {
    title: 'Rebate Explanation :',
    content:
      'Rebates are calculated based on your valid bets and applicable rebate rate. The more you bet, the more rebate you can receive.'
  },
  {
    title: 'Calculation Period :',
    content:
      'Only valid bets placed within the recent period set by the system, such as the last 7 or 30 days, will be counted. Bets placed outside this period will be cleared automatically and will no longer be included in the rebate calculation.'
  },
  {
    title: 'Claim Rules :',
    content:
      'Once your rebate amount meets the claim requirement, you may claim it. The minimum claim amount must be greater than 0.01. The actual claim method is subject to what is shown on the page.'
  },
  {
    title: 'Payout Method :',
    content:
      'Rebate rewards will be credited to your account in cash. Please refer to the actual amount received.'
  },
  {
    title: 'Valid Bet Rules :',
    content:
      'Only bets that meet the platform rules will be counted as valid bets. The following are not eligible for rebate:',
    items: [
      'Invalid or cancelled orders;',
      'Hedge betting or other abnormal betting behavior;',
      'Certain promotional activities or selected games.'
    ]
  },
  {
    title: 'Calculation Formula :',
    content:
      'Rebate Amount = Valid Bets × Applicable Rebate Rate.\nRebate rates may vary by game. Please refer to the rate shown on the page.'
  }
]
