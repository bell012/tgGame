import guideImage from '@/static/img/referral/claim_popup_hero.png'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

export type ReferralRulesStepIcon = 'share' | 'reward' | 'unlock'

export interface ReferralRulesStep {
  step: string
  text: string
  icon: ReferralRulesStepIcon
}

export interface ReferralRulesRow {
  level: number
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
 * 生成规则页佣金表格数据。
 */
export const createReferralRulesRows = (t: TranslateFn): ReferralRulesRow[] => [
  {
    level: 1,
    activeFriends: t('referral.rulesPage.friendCount', { count: 1 }),
    rate: '0.10%'
  },
  {
    level: 2,
    activeFriends: t('referral.rulesPage.friendCount', { count: 2 }),
    rate: '0.15%'
  },
  {
    level: 3,
    activeFriends: t('referral.rulesPage.friendCount', { count: 3 }),
    rate: '0.25%'
  },
  {
    level: 4,
    activeFriends: t('referral.rulesPage.friendCount', { count: 4 }),
    rate: '0.30%'
  },
  {
    level: 5,
    activeFriends: t('referral.rulesPage.friendCount', { count: 5 }),
    rate: '0.35%'
  },
  {
    level: 6,
    activeFriends: t('referral.rulesPage.friendCount', { count: 6 }),
    rate: '0.40%'
  }
]
