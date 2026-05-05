import commissionCoinIcon from '@/static/img/referral/referral-coin.png'
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
  condition: string
  conditionUnit?: string
  reward: string
  status: string
  achieved: boolean
}

export interface ReferralTaskRewardTable {
  columns: string[]
  rows: ReferralTaskRewardRow[]
}

export interface ReferralTaskFriendReward {
  id?: string
  min?: number | string
  max?: number | string
  reward?: number | string
  achieved?: boolean
  status?: number | string
}

export interface ReferralTaskRechargeReward {
  id?: string
  amount?: number | string
  reward?: number | string
  achieved?: boolean
  status?: number | string
}

export interface ReferralTaskIncreaseReward {
  id?: string
  rebate?: number | string
  amount?: number | string
  achieved?: boolean
  status?: number | string
}

export interface ReferralTaskWalletReward {
  id?: string
  people?: number | string
  amount?: number | string
  achieved?: boolean
  status?: number | string
}

export interface ReferralTaskRewardConfig {
  friendList?: ReferralTaskFriendReward[]
  rechargeList?: ReferralTaskRechargeReward[]
  increaseList?: ReferralTaskIncreaseReward[]
  recommendedWallet?: ReferralTaskWalletReward[]
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

const toText = (value: number | string | undefined) => String(value ?? '').trim()

const toNumber = (value: number | string | undefined) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

const getFriendUnit = (count: number, t: TranslateFn) => {
  return count === 1 ? t('referral.taskPage.friendUnit') : t('referral.taskPage.friendsUnit')
}

const isRewardAchieved = (item: { achieved?: boolean; status?: number | string }) => {
  if (item.achieved === true) return true

  return Number(item.status) === 1
}

const createStatusText = (
  item: { achieved?: boolean; status?: number | string },
  t: TranslateFn
) => {
  return isRewardAchieved(item)
    ? t('referral.taskPage.achieved')
    : t('referral.taskPage.notAchieved')
}

const createFriendCondition = (item: ReferralTaskFriendReward, t: TranslateFn) => {
  const max = toText(item.max)
  const condition = max
  const unitCount = toNumber(max)

  return {
    condition,
    conditionUnit: getFriendUnit(unitCount, t)
  }
}

const createWalletCondition = (item: ReferralTaskWalletReward, t: TranslateFn) => {
  const condition = toText(item.people)

  return {
    condition,
    conditionUnit: getFriendUnit(toNumber(condition), t)
  }
}

const createRewardRow = (
  condition: string,
  reward: string,
  item: { achieved?: boolean; status?: number | string },
  t: TranslateFn,
  conditionUnit?: string
): ReferralTaskRewardRow => {
  const achieved = isRewardAchieved(item)

  return {
    condition,
    conditionUnit,
    reward,
    status: createStatusText(item, t),
    achieved
  }
}

/**
 * 根据后台任务配置生成当前标签对应的奖励表格。
 */
export const buildReferralTaskRewardTable = (
  config: ReferralTaskRewardConfig | null,
  activeTab: ReferralTaskTabKey,
  t: TranslateFn
): ReferralTaskRewardTable => {
  const baseColumns = [t('referral.taskPage.reward'), t('referral.taskPage.status')]

  if (activeTab === 'cumulative-deposit') {
    return {
      columns: [t('referral.taskPage.depositAmount'), ...baseColumns],
      rows: (config?.rechargeList ?? []).map(item =>
        createRewardRow(toText(item.amount), toText(item.reward), item, t)
      )
    }
  }

  if (activeTab === 'commission-boost') {
    return {
      columns: [t('referral.taskPage.commissionBoost'), ...baseColumns],
      rows: (config?.increaseList ?? []).map(item =>
        createRewardRow(toText(item.rebate), toText(item.amount), item, t)
      )
    }
  }

  if (activeTab === 'recommended-wallet') {
    return {
      columns: [t('referral.taskPage.depositors'), ...baseColumns],
      rows: (config?.recommendedWallet ?? []).map(item => {
        const { condition, conditionUnit } = createWalletCondition(item, t)
        return createRewardRow(condition, toText(item.amount), item, t, conditionUnit)
      })
    }
  }

  return {
    columns: [t('referral.taskPage.invitedSignUps'), ...baseColumns],
    rows: (config?.friendList ?? []).map(item => {
      const { condition, conditionUnit } = createFriendCondition(item, t)
      return createRewardRow(condition, toText(item.reward), item, t, conditionUnit)
    })
  }
}

/**
 * 返回任务页佣金币图片资源。
 */
export const getReferralTaskCoinImage = () => commissionCoinIcon

/**
 * 返回任务规则占位图片资源。
 */
export const getReferralTaskRulesPlaceholderImage = () => taskRulesPlaceholderImage
