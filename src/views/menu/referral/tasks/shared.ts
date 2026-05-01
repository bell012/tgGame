import commissionCoinIcon from '@/static/img/referral/金币.png'
import taskRulesPlaceholderImage from '@/static/img/referral/claim_popup_hero.png'

type TranslateFn = (key: string) => string

export type ReferralTaskTabKey =
  | 'invite-register'
  | 'cumulative-deposit'
  | 'commission-boost'
  | 'recommended-wallet'

export interface ReferralTaskTab {
  key: ReferralTaskTabKey
  label: string
}

export interface ReferralTaskRewardRow {
  invitedFriends: string
  reward: string
  status: string
}

/**
 * 生成任务页顶部标签数据。
 */
export const createReferralTaskTabs = (t: TranslateFn): ReferralTaskTab[] => [
  {
    key: 'invite-register',
    label: t('referral.taskPage.tabs.inviteRegister')
  },
  {
    key: 'cumulative-deposit',
    label: t('referral.taskPage.tabs.cumulativeDeposit')
  },
  {
    key: 'commission-boost',
    label: t('referral.taskPage.tabs.commissionBoost')
  },
  {
    key: 'recommended-wallet',
    label: t('referral.taskPage.tabs.recommendedWallet')
  }
]

/**
 * 生成任务页奖励表格数据。
 */
export const createReferralTaskRewardRows = (t: TranslateFn): ReferralTaskRewardRow[] => [
  {
    invitedFriends: `1 ${t('referral.taskPage.friendUnit')}`,
    reward: '36',
    status: t('referral.taskPage.notAchieved')
  },
  {
    invitedFriends: `3 ${t('referral.taskPage.friendsUnit')}`,
    reward: '66',
    status: t('referral.taskPage.notAchieved')
  },
  {
    invitedFriends: `5 ${t('referral.taskPage.friendsUnit')}`,
    reward: '128',
    status: t('referral.taskPage.notAchieved')
  },
  {
    invitedFriends: `10 ${t('referral.taskPage.friendsUnit')}`,
    reward: '308',
    status: t('referral.taskPage.notAchieved')
  },
  {
    invitedFriends: `30 ${t('referral.taskPage.friendsUnit')}`,
    reward: '888',
    status: t('referral.taskPage.notAchieved')
  },
  {
    invitedFriends: `100 ${t('referral.taskPage.friendsUnit')}`,
    reward: '2828',
    status: t('referral.taskPage.notAchieved')
  }
]

/**
 * 返回任务页佣金币图片资源。
 */
export const getReferralTaskCoinImage = () => commissionCoinIcon

/**
 * 返回任务规则占位图片资源。
 */
export const getReferralTaskRulesPlaceholderImage = () => taskRulesPlaceholderImage
