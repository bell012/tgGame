import type {
  ActivityListItem,
  CheckInActivityCurrencyConfig,
  CheckInActivitySignConfigItem,
  CheckInHistorySignItem,
  CheckInTicketInfo,
  QueryCheckInStatusResult
} from '@/api/interface/activity'
import { formatUsDateTime12h } from '@/utils/date'
import cashIcon from '@/static/img/check-in/cash.png'
import giftBoxClosed from '@/static/img/check-in/gift-box-closed.png'
import giftBoxOpened from '@/static/img/check-in/gift-box-open.png'
import giftBoxIcon from '@/static/img/check-in/gift-box.png'
import goldenEggIcon from '@/static/img/check-in/golden-egg.png'
import checkInCloseButton from '@/static/img/check-in/popup-close.png'
import checkInRulesButton from '@/static/img/check-in/popup-rules.png'
import redPacketIcon from '@/static/img/check-in/red-packet.png'
import turntableIcon from '@/static/img/check-in/roulette.png'
import type { CSSProperties } from 'vue'

export type CheckInPageMode = 'mobile' | 'pc'

export interface CheckInRewardItem {
  day: number
  amount: string
  icon: string
  claimed?: boolean
  spanFull?: boolean
  cardStyle: CSSProperties
  iconShellStyle: CSSProperties
  amountStyle: CSSProperties
}

export interface CheckInHeroAmountReward {
  type: 'amount'
  amount: string
  icon: string
}

export interface CheckInHeroActionReward {
  type: 'action'
  title?: string
  titleKey?: string
  icon: string
  actionLabel?: string
  actionKey?: string
}

export type CheckInHeroReward = CheckInHeroAmountReward | CheckInHeroActionReward

export interface CheckInViewData {
  activityId?: number
  promoEndsAt: string
  rewards: CheckInRewardItem[]
  canClaim: boolean
  heroRewards: CheckInHeroReward[]
  todayIsSign: boolean
}

interface CheckInRewardPreset {
  icon: string
  cardStyle: CSSProperties
  iconShellStyle: CSSProperties
  amountStyle: CSSProperties
}

/**
 * 生成奖励卡片的渐变背景、边框和阴影样式。
 */
const createCardStyle = (
  startColor: string,
  endColor: string,
  borderColor: string
): CSSProperties => ({
  background: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
  borderColor,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 12px 24px rgba(0, 0, 0, 0.14)'
})

/**
 * 生成奖励图标容器的渐变背景样式。
 */
const createIconShellStyle = (startColor: string, endColor: string): CSSProperties => ({
  background: `linear-gradient(180deg, ${startColor} 0%, ${endColor} 100%)`,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25)'
})

/**
 * 生成奖励金额文字样式。
 */
const createAmountStyle = (color: string): CSSProperties => ({
  color,
  textShadow: '0 1px 6px rgba(0, 0, 0, 0.18)'
})

/**
 * 签到按钮和主视觉素材。
 */
export const CHECK_IN_CLOSE_BUTTON = checkInCloseButton
export const CHECK_IN_RULES_BUTTON = checkInRulesButton
export const CHECK_IN_HERO_CLOSED = giftBoxClosed
export const CHECK_IN_HERO_OPENED = giftBoxOpened

const CHECK_IN_REWARD_PRESETS: CheckInRewardPreset[] = [
  {
    icon: giftBoxIcon,
    cardStyle: createCardStyle(
      'rgba(255, 192, 94, 0.42)',
      'rgba(141, 77, 0, 0.28)',
      'rgba(255, 214, 132, 0.45)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 232, 142, 0.96)', 'rgba(255, 183, 38, 0.96)'),
    amountStyle: createAmountStyle('#fff09e')
  },
  {
    icon: cashIcon,
    cardStyle: createCardStyle(
      'rgba(62, 210, 114, 0.4)',
      'rgba(14, 96, 37, 0.24)',
      'rgba(100, 235, 145, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(128, 243, 145, 0.96)', 'rgba(0, 198, 16, 0.96)'),
    amountStyle: createAmountStyle('#d9ff95')
  },
  {
    icon: turntableIcon,
    cardStyle: createCardStyle(
      'rgba(192, 116, 255, 0.38)',
      'rgba(86, 7, 129, 0.26)',
      'rgba(222, 153, 255, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(208, 137, 255, 0.96)', 'rgba(178, 21, 255, 0.96)'),
    amountStyle: createAmountStyle('#ffe88d')
  },
  {
    icon: redPacketIcon,
    cardStyle: createCardStyle(
      'rgba(255, 121, 121, 0.36)',
      'rgba(126, 0, 0, 0.24)',
      'rgba(255, 166, 166, 0.4)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 138, 138, 0.96)', 'rgba(255, 46, 46, 0.96)'),
    amountStyle: createAmountStyle('#ffe88d')
  },
  {
    icon: goldenEggIcon,
    cardStyle: createCardStyle(
      'rgba(72, 201, 176, 0.34)',
      'rgba(6, 82, 64, 0.24)',
      'rgba(126, 245, 225, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(141, 255, 237, 0.96)', 'rgba(13, 182, 151, 0.96)'),
    amountStyle: createAmountStyle('#f0ff98')
  },
  {
    icon: goldenEggIcon,
    cardStyle: createCardStyle(
      'rgba(255, 179, 109, 0.36)',
      'rgba(130, 61, 0, 0.24)',
      'rgba(255, 202, 143, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 212, 138, 0.96)', 'rgba(255, 142, 0, 0.96)'),
    amountStyle: createAmountStyle('#fff3a8')
  },
  {
    icon: goldenEggIcon,
    cardStyle: createCardStyle(
      'rgba(255, 218, 127, 0.28)',
      'rgba(38, 24, 0, 0.32)',
      'rgba(255, 231, 173, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 241, 181, 0.96)', 'rgba(255, 191, 64, 0.96)'),
    amountStyle: createAmountStyle('#fff1ab')
  }
]

const CHECK_IN_TICKET_TYPE_ICON_MAP: Record<number, string> = {
  1: cashIcon,
  2: giftBoxIcon,
  3: turntableIcon,
  4: redPacketIcon,
  5: giftBoxIcon,
  6: goldenEggIcon
}

const DEFAULT_REWARDS: CheckInRewardItem[] = [
  '100',
  '0',
  '300~800',
  '5K~10K',
  '800',
  '1000',
  '1500'
].map((amount, index) => {
  const preset = CHECK_IN_REWARD_PRESETS[index]

  return {
    day: index + 1,
    amount,
    icon: preset.icon,
    claimed: false,
    cardStyle: preset.cardStyle,
    iconShellStyle: preset.iconShellStyle,
    amountStyle: preset.amountStyle
  }
})

const normalizeLanguageCode = (languageCode?: string) => {
  return String(languageCode ?? '')
    .trim()
    .toLowerCase()
    .startsWith('zh')
    ? 'zh'
    : 'eng'
}

const toNumber = (value: unknown) => {
  const normalizedValue =
    typeof value === 'string' && value.trim().length === 0 ? Number.NaN : Number(value)

  return Number.isFinite(normalizedValue) ? normalizedValue : null
}

const formatRewardAmount = (value: unknown, fixedDigits?: number) => {
  const numericValue = toNumber(value)

  if (numericValue === null) {
    return '0'
  }

  if (typeof fixedDigits === 'number') {
    return numericValue.toFixed(fixedDigits)
  }

  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2)
}

const resolveRewardIcon = (ticketType?: unknown, fallbackIndex = 0) => {
  const resolvedTicketType = toNumber(ticketType)
  const mappedIcon =
    resolvedTicketType !== null ? CHECK_IN_TICKET_TYPE_ICON_MAP[resolvedTicketType] : undefined

  return mappedIcon || CHECK_IN_REWARD_PRESETS[fallbackIndex % CHECK_IN_REWARD_PRESETS.length].icon
}

const resolveActivityCurrencyConfig = (
  activity?: ActivityListItem,
  currencyCode?: string
): CheckInActivityCurrencyConfig | undefined => {
  const configMap = activity?.config

  if (!configMap) {
    return undefined
  }

  const normalizedCurrencyCode = String(currencyCode ?? '')
    .trim()
    .toUpperCase()

  if (normalizedCurrencyCode && configMap[normalizedCurrencyCode]) {
    return configMap[normalizedCurrencyCode]
  }

  const firstConfigCurrency = activity?.currencyList?.[0]

  if (firstConfigCurrency && configMap[firstConfigCurrency]) {
    return configMap[firstConfigCurrency]
  }

  return Object.values(configMap).find(Boolean)
}

const resolveTicketLanguageName = (ticket?: CheckInTicketInfo, languageCode?: string) => {
  const normalizedLanguageCode = normalizeLanguageCode(languageCode)

  const matchedLanguageInfo = ticket?.languageInfo?.find(item => {
    return normalizeLanguageCode(item.languageCode) === normalizedLanguageCode
  })

  return matchedLanguageInfo?.name || ticket?.languageInfo?.[0]?.name || ''
}

const createRewardItemFromConfig = (
  rewardConfig: CheckInActivitySignConfigItem,
  index: number,
  claimed: boolean
): CheckInRewardItem => {
  const preset = CHECK_IN_REWARD_PRESETS[index % CHECK_IN_REWARD_PRESETS.length]

  return {
    day: toNumber(rewardConfig.day) ?? index + 1,
    amount: formatRewardAmount(rewardConfig.rewardAmount),
    icon: resolveRewardIcon(rewardConfig.ticketType, index),
    claimed,
    cardStyle: preset.cardStyle,
    iconShellStyle: preset.iconShellStyle,
    amountStyle: preset.amountStyle
  }
}

const resolveTodayHistoryRewards = (status?: QueryCheckInStatusResult) => {
  const historySign = status?.historySign ?? []
  const todayRewards = historySign.filter(item => item.todayIsSign)

  if (todayRewards.length > 0) {
    return todayRewards.slice(0, 2)
  }

  if (status?.todayIsSign && historySign.length > 0) {
    return [historySign[historySign.length - 1]]
  }

  return []
}

const createPrimaryHeroReward = (
  historyItem: CheckInHistorySignItem,
  signConfigMap: Map<number, CheckInActivitySignConfigItem>
): CheckInHeroAmountReward => {
  const signDay = toNumber(historyItem.signDays) ?? 0
  const matchedConfig = signConfigMap.get(signDay)
  const resolvedAmount =
    historyItem.todaySignAmount ?? matchedConfig?.rewardAmount ?? historyItem.ticket?.amount ?? 0

  return {
    type: 'amount',
    amount: formatRewardAmount(resolvedAmount, 2),
    icon: resolveRewardIcon(historyItem.ticket?.type ?? matchedConfig?.ticketType)
  }
}

const createSecondaryHeroReward = (
  historyItem: CheckInHistorySignItem,
  signConfigMap: Map<number, CheckInActivitySignConfigItem>,
  languageCode?: string
): CheckInHeroActionReward => {
  const signDay = toNumber(historyItem.signDays) ?? 0
  const matchedConfig = signConfigMap.get(signDay)
  const localizedTitle = resolveTicketLanguageName(historyItem.ticket, languageCode)

  return {
    type: 'action',
    title: localizedTitle || undefined,
    titleKey: localizedTitle ? undefined : 'checkIn.luckySpinReward',
    icon: resolveRewardIcon(historyItem.ticket?.type ?? matchedConfig?.ticketType),
    actionKey: 'checkIn.useNow'
  }
}

/**
 * 创建默认签到视图数据，供开发调试和接口未返回时使用。
 */
export const createDefaultCheckInViewData = (): CheckInViewData => {
  return {
    promoEndsAt: '12/18/2026 11:14:15 AM',
    rewards: DEFAULT_REWARDS,
    canClaim: false,
    heroRewards: [],
    todayIsSign: false
  }
}

/**
 * 将签到活动配置和签到状态结果转换为页面视图数据。
 */
export const createCheckInViewData = (
  activity?: ActivityListItem,
  status?: QueryCheckInStatusResult,
  options?: {
    currencyCode?: string
    languageCode?: string
  }
): CheckInViewData => {
  if (!activity || !status) {
    return createDefaultCheckInViewData()
  }

  const resolvedConfig = resolveActivityCurrencyConfig(activity, options?.currencyCode)
  const signConfigs = resolvedConfig?.sign ?? []
  const historySign = status.historySign ?? []
  const claimedDays = new Set(
    historySign.map(item => toNumber(item.signDays)).filter((day): day is number => day !== null)
  )
  const signConfigMap = new Map(
    signConfigs.map(item => [toNumber(item.day) ?? 0, item] as const).filter(item => item[0] > 0)
  )
  const todayHistoryRewards = resolveTodayHistoryRewards(status)
  const heroRewards: CheckInHeroReward[] = []

  if (todayHistoryRewards[0]) {
    heroRewards.push(createPrimaryHeroReward(todayHistoryRewards[0], signConfigMap))
  }

  if (todayHistoryRewards[1]) {
    heroRewards.push(
      createSecondaryHeroReward(todayHistoryRewards[1], signConfigMap, options?.languageCode)
    )
  }

  return {
    activityId: activity.rowId,
    promoEndsAt: formatUsDateTime12h(status.endDate ?? activity.endDate),
    rewards:
      signConfigs.length > 0
        ? signConfigs.map((item, index) =>
            createRewardItemFromConfig(
              item,
              index,
              claimedDays.has(toNumber(item.day) ?? index + 1)
            )
          )
        : DEFAULT_REWARDS,
    canClaim: !status.todayIsSign,
    heroRewards,
    todayIsSign: Boolean(status.todayIsSign)
  }
}
