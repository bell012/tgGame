import guideImage from '@/static/img/referral/claim_popup_hero.png'
import type { QueryTaskRewardCommissionItem } from '@/api/interface/agent'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

export type ReferralRulesStepIcon = 'share' | 'reward' | 'unlock'

export interface ReferralRulesStep {
  step: string
  text: string
  icon: ReferralRulesStepIcon
}

export interface ReferralRulesRow {
  level: string
  activeFriends: string
  rate: string
}

/**
 * 返回规则页 Guide 封面图资源。
 */
export const getReferralRulesGuideImage = () => guideImage

/**
 * 生成规则页收益步骤数据。
 */
export const createReferralRulesSteps = (t: TranslateFn): ReferralRulesStep[] => [
  {
    step: t('referral.rulesPage.steps.shareTitle'),
    text: t('referral.rulesPage.steps.shareText'),
    icon: 'share'
  },
  {
    step: t('referral.rulesPage.steps.rewardTitle'),
    text: t('referral.rulesPage.steps.rewardText'),
    icon: 'reward'
  },
  {
    step: t('referral.rulesPage.steps.unlockTitle'),
    text: t('referral.rulesPage.steps.unlockText'),
    icon: 'unlock'
  }
]

/**
 * 生成规则页表头数据。
 */
export const createReferralRulesColumns = (t: TranslateFn) => [
  t('referral.rulesPage.table.level'),
  t('referral.rulesPage.table.activeFriends'),
  t('referral.rulesPage.table.rate')
]

/**
 * 根据后台佣金等级配置生成规则页表格数据。
 */
export const createReferralRulesRows = (
  commissionList: QueryTaskRewardCommissionItem[]
): ReferralRulesRow[] =>
  commissionList.map(row => ({
    level: String(row.level ?? ''),
    activeFriends: String(row.people ?? ''),
    rate: String(row.rate ?? '')
  }))
