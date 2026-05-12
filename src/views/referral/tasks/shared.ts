import type {
  QueryReferralSettlementRuleResult,
  QueryTaskRewardConfig,
  QueryTaskRewardConfigResult,
  QueryTaskRewardFriendItem,
  QueryTaskRewardWalletItem
} from '@/api/interface/agent'
import taskRulesPlaceholderImage from '@/static/img/referral/claim_popup_hero.png'
import commissionCoinIcon from '@/static/img/referral/referral-coin.png'
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

export interface ReferralTaskResetHintSegments {
  prefix: string
  countdown: string
  suffix: string
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

/**
 * 执行toNumber方法。
 */
const toNumber = (value: number | string | undefined) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

/**
 * 获取getFriendUnit方法。
 */
const getFriendUnit = (count: number, t: TranslateFn) => {
  return count === 1 ? t('referral.taskPage.friendUnit') : t('referral.taskPage.friendsUnit')
}

/**
 * 执行isRewardAchieved方法。
 */
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

/**
 * 生成createFriendCondition方法。
 */
const createFriendCondition = (item: QueryTaskRewardFriendItem, t: TranslateFn) => {
  const max = toText(item.max)
  const condition = max
  const unitCount = toNumber(max)

  return {
    condition,
    conditionUnit: getFriendUnit(unitCount, t)
  }
}

/**
 * 生成createWalletCondition方法。
 */
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

/**
 * 执行toAmountNumber方法。
 */
const toAmountNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

/**
 * 格式化formatTaskAmount方法。
 */
const formatTaskAmount = (value: unknown) => {
  const amount = toAmountNumber(value, 0)
  const decimals = Number.isInteger(amount) ? 0 : 2
  return `${getCurrencySymbol()}${amount.toFixed(decimals)}`
}

/**
 * 根据结算规则解析任务周期类型。
 */
export const resolveReferralTaskPeriodKeyFromSettlementRule = (
  settlementRule?: QueryReferralSettlementRuleResult | null
): ReferralTaskPeriodKey => {
  const settlementType = Number(settlementRule?.settlementType)

  if (settlementType === 1) {
    return 'daily'
  }

  if (settlementType === 3) {
    return 'monthly'
  }

  return 'weekly'
}

const getStartOfDay = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const getMonthStartBySettlementDay = (date: Date, settlementDay: number) => {
  const normalizedSettlementDay = Math.max(1, Math.min(31, settlementDay || 1))
  const currentPeriodStart = new Date(date)

  if (date.getDate() >= normalizedSettlementDay) {
    currentPeriodStart.setDate(normalizedSettlementDay)
  } else {
    currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1, normalizedSettlementDay)
  }

  currentPeriodStart.setHours(0, 0, 0, 0)
  return currentPeriodStart
}

const getWeekStartBySettlementDay = (date: Date, settlementDay: number) => {
  const normalizedSettlementDay = Math.max(1, Math.min(7, settlementDay || 1))
  const currentJsDay = date.getDay()
  const targetJsDay = normalizedSettlementDay === 7 ? 0 : normalizedSettlementDay
  const diff = (currentJsDay - targetJsDay + 7) % 7
  const weekStart = new Date(date)

  weekStart.setDate(date.getDate() - diff)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

const buildResetCountdownText = (targetDate: Date) => {
  const diffMs = Math.max(0, targetDate.getTime() - Date.now())
  const totalMinutes = Math.floor(diffMs / 60000)
  const totalHours = Math.floor(totalMinutes / 60)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const minutes = totalMinutes % 60

  return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(
    minutes
  ).padStart(2, '0')}M`
}

/**
 * 格式化formatResetCountdown方法。
 */
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
  settlementRule?: QueryReferralSettlementRuleResult | null
) => {
  const periodKey = resolveReferralTaskPeriodKeyFromSettlementRule(settlementRule)
  const rechargeAmount = formatTaskAmount(settlementRule?.minRecharge ?? 0)
  const betAmount = formatTaskAmount(settlementRule?.minBet ?? 0)

  return t('referral.taskPage.validInviteDescription', {
    period: t(`referral.taskPage.periodLabel.${periodKey}`),
    rechargeAmount,
    betAmount
  })
}

/**
 * 生成任务页最高奖励标题。
 */
export const createReferralTaskMaxRewardLabel = (
  t: TranslateFn,
  settlementRule?: QueryReferralSettlementRuleResult | null
) => {
  const periodKey = resolveReferralTaskPeriodKeyFromSettlementRule(settlementRule)

  if (periodKey === 'daily') {
    return t('referral.taskPage.maxRewardThisDay')
  }

  if (periodKey === 'monthly') {
    return t('referral.taskPage.maxRewardThisMonth')
  }

  return t('referral.taskPage.maxRewardThisWeek')
}

const resolveReferralTaskResetCountdown = (
  localeCode: string,
  settlementRule?: QueryReferralSettlementRuleResult | null
) => {
  const periodKey = resolveReferralTaskPeriodKeyFromSettlementRule(settlementRule)
  const settlementDay = Number(settlementRule?.settlementDay ?? 1)
  const now = new Date()
  let nextResetTime = new Date(now)

  if (periodKey === 'daily') {
    nextResetTime = getStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  } else if (periodKey === 'monthly') {
    const currentStart = getMonthStartBySettlementDay(now, settlementDay)
    nextResetTime = new Date(currentStart)
    nextResetTime.setMonth(
      nextResetTime.getMonth() + 1,
      Math.max(1, Math.min(31, settlementDay || 1))
    )
    nextResetTime.setHours(0, 0, 0, 0)
  } else {
    const currentStart = getWeekStartBySettlementDay(now, settlementDay)
    nextResetTime = new Date(currentStart)
    nextResetTime.setDate(nextResetTime.getDate() + 7)
    nextResetTime.setHours(0, 0, 0, 0)
  }

  return {
    periodKey,
    countdown: formatResetCountdown(buildResetCountdownText(nextResetTime), localeCode)
  }
}

/**
 * 生成任务页重置提示文案。
 */
export const createReferralTaskResetHint = (
  t: TranslateFn,
  localeCode: string,
  settlementRule?: QueryReferralSettlementRuleResult | null
) => {
  const { periodKey, countdown } = resolveReferralTaskResetCountdown(localeCode, settlementRule)

  return t(`referral.taskPage.resetHint.${periodKey}`, {
    countdown
  })
}

/**
 * 拆分任务页重置提示文案，便于单独渲染倒计时样式。
 */
export const createReferralTaskResetHintSegments = (
  t: TranslateFn,
  localeCode: string,
  settlementRule?: QueryReferralSettlementRuleResult | null
): ReferralTaskResetHintSegments => {
  const { periodKey, countdown } = resolveReferralTaskResetCountdown(localeCode, settlementRule)
  const marker = '__COUNTDOWN__'
  const template = t(`referral.taskPage.resetHint.${periodKey}`, {
    countdown: marker
  })
  const [prefix, suffix = ''] = template.split(marker)

  return {
    prefix,
    countdown,
    suffix
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
