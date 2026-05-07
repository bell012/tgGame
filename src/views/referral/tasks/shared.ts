import commissionCoinIcon from '@/static/img/referral/referral-coin.png'
import taskRulesPlaceholderImage from '@/static/img/referral/claim_popup_hero.png'
import type {
  QueryTaskRewardConfig,
  QueryTaskRewardConfigResult,
  QueryTaskRewardFriendItem,
  QueryTaskRewardWalletItem
} from '@/api/interface/agent'
import { getCurrencySymbol } from '@/utils/locale'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

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

export type ReferralTaskRewardConfig = QueryTaskRewardConfig
export type ReferralTaskRewardConfigResult = QueryTaskRewardConfigResult

type ReferralTaskPeriodKey = 'daily' | 'weekly' | 'monthly'

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

const createFriendCondition = (item: QueryTaskRewardFriendItem, t: TranslateFn) => {
  const max = toText(item.max)
  const condition = max
  const unitCount = toNumber(max)

  return {
    condition,
    conditionUnit: getFriendUnit(unitCount, t)
  }
}

const createWalletCondition = (item: QueryTaskRewardWalletItem, t: TranslateFn) => {
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

const toAmountNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const formatTaskAmount = (value: unknown) => {
  const amount = toAmountNumber(value, 0)
  const decimals = Number.isInteger(amount) ? 0 : 2
  return `${getCurrencySymbol()}${amount.toFixed(decimals)}`
}

const pickFirstDefined = (sources: unknown[], keys: string[]) => {
  for (const source of sources) {
    if (!source || typeof source !== 'object') {
      continue
    }

    const record = source as Record<string, unknown>

    for (const key of keys) {
      const value = record[key]

      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value
      }
    }
  }

  return undefined
}

const resolveTaskPeriodKey = (
  result?: ReferralTaskRewardConfigResult | null
): ReferralTaskPeriodKey => {
  const periodValue = String(
    pickFirstDefined(
      [result, result?.config],
      ['resetType', 'rewardType', 'rewardTypeName', 'periodType', 'cycleType']
    ) ?? ''
  )
    .trim()
    .toLowerCase()

  if (periodValue === 'daily' || periodValue === 'day' || periodValue === '2') {
    return 'daily'
  }

  if (periodValue === 'monthly' || periodValue === 'month' || periodValue === '3') {
    return 'monthly'
  }

  return 'weekly'
}

const formatResetCountdown = (countdown: string, localeCode: string) => {
  const normalizedCountdown = String(countdown ?? '').trim()

  if (!normalizedCountdown) {
    return ''
  }

  if (!localeCode.startsWith('zh')) {
    return normalizedCountdown
  }

  return normalizedCountdown
    .replace(/\s*(\d+)\s*D/giu, '$1天')
    .replace(/\s*(\d+)\s*H/giu, '$1小时')
    .replace(/\s*(\d+)\s*M/giu, '$1分钟')
    .replace(/\s*(\d+)\s*S/giu, '$1秒')
    .replace(/\s+/gu, '')
}

/**
 * 生成任务页有效邀请说明文案。
 */
export const createReferralTaskValidInviteDescription = (
  t: TranslateFn,
  result?: ReferralTaskRewardConfigResult | null
) => {
  const periodKey = resolveTaskPeriodKey(result)
  const rechargeAmount = formatTaskAmount(
    pickFirstDefined(
      [result?.config, result],
      [
        'validInviteRechargeAmount',
        'inviteRechargeAmount',
        'validRechargeAmount',
        'rechargeThreshold'
      ]
    ) ?? 500
  )
  const betAmount = formatTaskAmount(
    pickFirstDefined(
      [result?.config, result],
      ['validInviteBetAmount', 'inviteBetAmount', 'validBetAmount', 'betThreshold']
    ) ?? 1000
  )

  return t('referral.taskPage.validInviteDescription', {
    period: t(`referral.taskPage.periodLabel.${periodKey}`),
    rechargeAmount,
    betAmount
  })
}

/**
 * 生成任务页重置提示文案。
 */
export const createReferralTaskResetHint = (
  t: TranslateFn,
  localeCode: string,
  result?: ReferralTaskRewardConfigResult | null
) => {
  const periodKey = resolveTaskPeriodKey(result)
  const rawCountdown = String(
    pickFirstDefined(
      [result, result?.config],
      ['resetCountdown', 'countdown', 'countDown', 'rewardCountdown']
    ) ?? '05D 02H 20M'
  )
  const countdown = formatResetCountdown(rawCountdown, localeCode)

  return t(`referral.taskPage.resetHint.${periodKey}`, {
    countdown
  })
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
