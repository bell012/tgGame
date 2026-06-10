import type {
  ActivityListItem,
  CheckInActivityCurrencyConfig,
  CheckInActivitySignConfigItem,
  CheckInHistorySignItem,
  CheckInTicketInfo,
  QueryCheckInStatusResult,
  ReceiveCheckInRewardResult
} from '@/api/interface/activity'
import cashIcon from '@/static/img/check-in/cash.png'
import giftBoxClosed from '@/static/img/check-in/gift-box-closed.png'
import giftBoxOpened from '@/static/img/check-in/gift-box-open.png'
import goldenEggIcon from '@/static/img/check-in/golden-egg.png'
import checkInCloseButton from '@/static/img/check-in/popup-close.png'
import checkInRulesButton from '@/static/img/check-in/popup-rules.png'
import redPacketIcon from '@/static/img/check-in/red-packet.png'
import turntableIcon from '@/static/img/check-in/roulette.png'
import gameCashVoucherIcon from '@/static/img/lucky-spin/vouchers/game-cash-voucher.png'
import gameGoldenEggIcon from '@/static/img/lucky-spin/vouchers/game-golden-egg.png'
import gameLuckyRedEnvelopeIcon from '@/static/img/lucky-spin/vouchers/game-lucky-red-envelope.png'
import gameLuckySpinIcon from '@/static/img/lucky-spin/vouchers/game-lucky-spin.png'
import gameMysteryBoxIcon from '@/static/img/lucky-spin/vouchers/game-mystery-box.png'
import { formatUsDateTime12h } from '@/utils/date'
import { getCurrencySymbol } from '@/utils/locale'
import type { CSSProperties } from 'vue'

// 签到页面布局模式：mobile 对应 H5 设计稿，pc 对应 PC 弹窗设计稿。
export type CheckInPageMode = 'mobile' | 'pc'

// 单个签到奖励卡片的页面展示数据。
export interface CheckInRewardItem {
  day: number
  amount: string
  icon: string
  currencySymbol: string
  betAmount?: number
  rechargeAmount?: number
  rewardTiggerType?: number[]
  conditionRelation?: number | string | null
  claimed?: boolean
  spanFull?: boolean
  cardStyle: CSSProperties
  iconShellStyle: CSSProperties
  amountStyle: CSSProperties
}

// 签到条件提醒弹窗展示模式：all/any 展示两项条件，depositOnly/betOnly 展示单项条件。
export type CheckInRequirementReminderMode = 'all' | 'any' | 'depositOnly' | 'betOnly'

// 签到条件提醒条件标签 key，供数据层和组件层共用，避免散落魔法字符串。
export const CHECK_IN_REQUIREMENT_LABEL_DEPOSIT = 'deposit'
export const CHECK_IN_REQUIREMENT_LABEL_VALID_BET = 'validBet'

// 签到条件提醒条件标签类型。
export type CheckInRequirementReminderLabel =
  | typeof CHECK_IN_REQUIREMENT_LABEL_DEPOSIT
  | typeof CHECK_IN_REQUIREMENT_LABEL_VALID_BET

// 签到条件提醒弹窗单行数据。
export interface CheckInRequirementReminderItem {
  label: CheckInRequirementReminderLabel
  value: string
}

// 签到条件提醒弹窗完整数据。
export interface CheckInRequirementReminderData {
  mode: CheckInRequirementReminderMode
  items: CheckInRequirementReminderItem[]
}

// 主视觉金额奖励，用于签到后展示现金类奖励。
export interface CheckInHeroAmountReward {
  type: 'amount'
  amount: string
  icon: string
  currencySymbol: string
  background: string
  amountColor: string
}

// 主视觉功能奖励，用于签到后展示票券/玩法入口类奖励。
export interface CheckInHeroActionReward {
  type: 'action'
  title?: string
  titleKey?: string
  icon: string
  background: string
  requiresPhoneVerification?: boolean
  actionLabel?: string
  actionKey?: string
}

// 主视觉奖励联合类型，页面根据 type 区分金额奖励和功能奖励。
export type CheckInHeroReward = CheckInHeroAmountReward | CheckInHeroActionReward

// 签到弹窗页面所需的完整视图数据。
export interface CheckInViewData {
  activityId?: number
  title: string
  subtitle: string
  promoEndsAt: string
  promoDateTextKey: 'checkIn.promoStartsAt' | 'checkIn.promoEndsAt'
  rewards: CheckInRewardItem[]
  canClaim: boolean
  heroRewards: CheckInHeroReward[]
  todayIsSign: boolean
}

// 奖励卡片设计预设，承载 Figma 中不同卡片的颜色和图标样式。
interface CheckInRewardPreset {
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

// 后端 rewardType 枚举：0 固定金额，1 随机金额。
const CHECK_IN_REWARD_TYPE_FIXED = 0
const CHECK_IN_REWARD_TYPE_RANDOM = 1

// 后端 rewardTiggerType 枚举：0 充值要求，1 流水要求。
const CHECK_IN_REQUIREMENT_TYPE_DEPOSIT = 0
const CHECK_IN_REQUIREMENT_TYPE_BET = 1

// 后端 conditionRelation 枚举：空或 0 全部满足，1 任意满足。
const CHECK_IN_CONDITION_RELATION_ANY = 1

// 后端活动状态枚举：2 表示活动进行中。
const CHECK_IN_ACTIVITY_STATUS_ACTIVE = 2

/**
 * 统一后端和前端语言编码，避免 zh-CN/en 这类值匹配不到后端配置。
 */
export const normalizeCheckInLanguageCode = (languageCode?: string) => {
  const normalizedLanguageCode = String(languageCode ?? '')
    .trim()
    .toLowerCase()

  if (normalizedLanguageCode.startsWith('zh')) {
    return 'zh'
  }

  if (normalizedLanguageCode === 'eng' || normalizedLanguageCode.startsWith('en')) {
    return 'eng'
  }

  return normalizedLanguageCode
}

// 签到奖励卡片设计预设，按天数顺序循环使用。
const CHECK_IN_REWARD_PRESETS: CheckInRewardPreset[] = [
  {
    cardStyle: createCardStyle(
      'rgba(255, 192, 94, 0.42)',
      'rgba(141, 77, 0, 0.28)',
      'rgba(255, 214, 132, 0.45)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 232, 142, 0.96)', 'rgba(255, 183, 38, 0.96)'),
    amountStyle: createAmountStyle('#fff09e')
  },
  {
    cardStyle: createCardStyle(
      'rgba(62, 210, 114, 0.4)',
      'rgba(14, 96, 37, 0.24)',
      'rgba(100, 235, 145, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(128, 243, 145, 0.96)', 'rgba(0, 198, 16, 0.96)'),
    amountStyle: createAmountStyle('#d9ff95')
  },
  {
    cardStyle: createCardStyle(
      'rgba(192, 116, 255, 0.38)',
      'rgba(86, 7, 129, 0.26)',
      'rgba(222, 153, 255, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(208, 137, 255, 0.96)', 'rgba(178, 21, 255, 0.96)'),
    amountStyle: createAmountStyle('#ffe88d')
  },
  {
    cardStyle: createCardStyle(
      'rgba(255, 121, 121, 0.36)',
      'rgba(126, 0, 0, 0.24)',
      'rgba(255, 166, 166, 0.4)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 138, 138, 0.96)', 'rgba(255, 46, 46, 0.96)'),
    amountStyle: createAmountStyle('#ffe88d')
  },
  {
    cardStyle: createCardStyle(
      'rgba(72, 201, 176, 0.34)',
      'rgba(6, 82, 64, 0.24)',
      'rgba(126, 245, 225, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(141, 255, 237, 0.96)', 'rgba(13, 182, 151, 0.96)'),
    amountStyle: createAmountStyle('#f0ff98')
  },
  {
    cardStyle: createCardStyle(
      'rgba(255, 179, 109, 0.36)',
      'rgba(130, 61, 0, 0.24)',
      'rgba(255, 202, 143, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 212, 138, 0.96)', 'rgba(255, 142, 0, 0.96)'),
    amountStyle: createAmountStyle('#fff3a8')
  },
  {
    cardStyle: createCardStyle(
      'rgba(255, 218, 127, 0.28)',
      'rgba(38, 24, 0, 0.32)',
      'rgba(255, 231, 173, 0.42)'
    ),
    iconShellStyle: createIconShellStyle('rgba(255, 241, 181, 0.96)', 'rgba(255, 191, 64, 0.96)'),
    amountStyle: createAmountStyle('#fff1ab')
  }
]

// 后端 ticketType 到奖励图片的映射：1 现金、2 红包、3 金蛋、4 转盘、5/6 盲盒。
const CHECK_IN_TICKET_TYPE_ICON_MAP: Record<number, string> = {
  1: gameCashVoucherIcon,
  2: gameLuckyRedEnvelopeIcon,
  3: gameGoldenEggIcon,
  4: gameLuckySpinIcon,
  5: gameMysteryBoxIcon,
  6: gameMysteryBoxIcon
}

// 主视觉现金奖励卡固定使用绿色渐变背景。
const CHECK_IN_HERO_AMOUNT_BACKGROUND = 'linear-gradient(180deg, #2BBB76 0%, #41882C 100%)'

// 主视觉现金奖励金额固定使用亮黄色字体。
const CHECK_IN_HERO_AMOUNT_COLOR = '#F7FF4B'

// 主视觉票券奖励标题 key 类型。
type CheckInHeroTicketTitleKey =
  | 'checkIn.luckySpinReward'
  | 'checkIn.redPacketReward'
  | 'checkIn.goldenEggReward'
  | 'checkIn.cashVoucherReward'
  | 'checkIn.mysteryBoxReward'

// 主视觉票券奖励卡设计预设。
interface CheckInHeroTicketPreset {
  titleKey: CheckInHeroTicketTitleKey
  icon: string
  background: string
}

// 主视觉票券奖励卡按 ticketType 映射对应文案、图标和背景。
const CHECK_IN_HERO_TICKET_PRESET_MAP: Record<number, CheckInHeroTicketPreset> = {
  1: {
    titleKey: 'checkIn.cashVoucherReward',
    icon: cashIcon,
    background: 'linear-gradient(180deg, #61D3AF 0%, #009267 103.66%)'
  },
  2: {
    titleKey: 'checkIn.redPacketReward',
    icon: redPacketIcon,
    background: 'linear-gradient(180deg, #FF717C 0%, #DF1215 103.66%)'
  },
  3: {
    titleKey: 'checkIn.goldenEggReward',
    icon: goldenEggIcon,
    background: 'linear-gradient(180deg, #E7C952 0%, #C17E00 103.66%)'
  },
  4: {
    titleKey: 'checkIn.luckySpinReward',
    icon: turntableIcon,
    background: 'linear-gradient(180deg, #D14DF6 0%, #9B12DF 103.66%)'
  },
  5: {
    titleKey: 'checkIn.mysteryBoxReward',
    icon: giftBoxOpened,
    background: 'linear-gradient(180deg, #61A4D3 0%, #006B92 103.66%)'
  },
  6: {
    titleKey: 'checkIn.mysteryBoxReward',
    icon: giftBoxOpened,
    background: 'linear-gradient(180deg, #61A4D3 0%, #006B92 103.66%)'
  }
}

// 将后端可能返回的字符串/数字安全转换为 number。
const toNumber = (value: unknown) => {
  const normalizedValue =
    typeof value === 'string' && value.trim().length === 0 ? Number.NaN : Number(value)

  return Number.isFinite(normalizedValue) ? normalizedValue : null
}

// 格式化主视觉金额：保留后端原始精度，小数位不足两位时补 0。
const formatRewardAmount = (value: unknown) => {
  const numericValue = toNumber(value)

  if (numericValue === null) {
    return '0'
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    if (trimmedValue.length > 0) {
      const [, decimalPart = ''] = trimmedValue.split('.')

      if (decimalPart.length === 0) {
        return `${trimmedValue}.00`
      }

      if (decimalPart.length === 1) {
        return `${trimmedValue}0`
      }

      return trimmedValue
    }
  }

  return Number.isInteger(numericValue) ? `${numericValue}.00` : String(numericValue)
}

// 格式化奖励卡片金额，超过千位时使用 K 单位。
const formatRewardDisplayNumber = (value: unknown) => {
  const numericValue = toNumber(value)

  if (numericValue === null) {
    return '0'
  }

  if (Math.abs(numericValue) >= 1000) {
    const kiloValue = numericValue / 1000
    const formattedKiloValue = Number.isInteger(kiloValue)
      ? String(kiloValue)
      : kiloValue.toFixed(1).replace(/\.0$/, '')

    return `${formattedKiloValue}K`
  }

  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2)
}

// 格式化随机金额区间，相同上下限只展示一个值。
const formatRewardRangeAmount = (amountRange?: number[]) => {
  const minAmount = toNumber(amountRange?.[0])
  const maxAmount = toNumber(amountRange?.[1])

  if (minAmount === null && maxAmount === null) {
    return '0'
  }

  if (minAmount === null) {
    return formatRewardDisplayNumber(maxAmount)
  }

  if (maxAmount === null || minAmount === maxAmount) {
    return formatRewardDisplayNumber(minAmount)
  }

  return `${formatRewardDisplayNumber(minAmount)}~${formatRewardDisplayNumber(maxAmount)}`
}

// 根据单个奖励卡片配置解析 H5 未签到条件提醒弹窗数据。
export const createCheckInRequirementReminderData = (
  reward: CheckInRewardItem
): CheckInRequirementReminderData | null => {
  const rewardTiggerType = reward.rewardTiggerType ?? []
  const hasDepositRequirement = rewardTiggerType.includes(CHECK_IN_REQUIREMENT_TYPE_DEPOSIT)
  const hasBetRequirement = rewardTiggerType.includes(CHECK_IN_REQUIREMENT_TYPE_BET)

  if (!hasDepositRequirement && !hasBetRequirement) {
    return null
  }

  const mode: CheckInRequirementReminderMode =
    hasDepositRequirement && hasBetRequirement
      ? toNumber(reward.conditionRelation) === CHECK_IN_CONDITION_RELATION_ANY
        ? 'any'
        : 'all'
      : hasDepositRequirement
        ? 'depositOnly'
        : 'betOnly'

  const items: CheckInRequirementReminderItem[] = []

  if (hasDepositRequirement) {
    items.push({
      label: CHECK_IN_REQUIREMENT_LABEL_DEPOSIT,
      value: formatRewardDisplayNumber(reward.rechargeAmount)
    })
  }

  if (hasBetRequirement) {
    items.push({
      label: CHECK_IN_REQUIREMENT_LABEL_VALID_BET,
      value: formatRewardDisplayNumber(reward.betAmount)
    })
  }

  return {
    mode,
    items
  }
}

// 根据 mbSign.signDays 定位本次应签到的奖励；异常情况下回退到第一张未领取卡片。
export const resolveCurrentCheckInReward = (
  rewards: CheckInRewardItem[],
  status?: QueryCheckInStatusResult
) => {
  const currentSignDay = toNumber(status?.signDays)
  const currentReward =
    currentSignDay !== null ? rewards.find(reward => reward.day === currentSignDay) : undefined

  return currentReward ?? rewards.find(reward => !reward.claimed) ?? null
}

// 对比 mbSign 当前充值/流水与当天奖励条件，按 conditionRelation 判断是否允许签到。
export const areCheckInRewardRequirementsMet = (
  reward: CheckInRewardItem,
  status?: QueryCheckInStatusResult
) => {
  const rewardTiggerType = reward.rewardTiggerType ?? []
  const hasDepositRequirement = rewardTiggerType.includes(CHECK_IN_REQUIREMENT_TYPE_DEPOSIT)
  const hasBetRequirement = rewardTiggerType.includes(CHECK_IN_REQUIREMENT_TYPE_BET)

  if (!hasDepositRequirement && !hasBetRequirement) {
    return true
  }

  const depositRequirementMet =
    (toNumber(status?.rechargeAmount) ?? 0) >= (toNumber(reward.rechargeAmount) ?? 0)
  const betRequirementMet = (toNumber(status?.betAmount) ?? 0) >= (toNumber(reward.betAmount) ?? 0)

  if (hasDepositRequirement && hasBetRequirement) {
    return toNumber(reward.conditionRelation) === CHECK_IN_CONDITION_RELATION_ANY
      ? depositRequirementMet || betRequirementMet
      : depositRequirementMet && betRequirementMet
  }

  return hasDepositRequirement ? depositRequirementMet : betRequirementMet
}

// 根据 rewardType 决定奖励卡片金额来源：固定金额取 rewardAmount，随机金额取 amountRange。
const resolveRewardConfigAmount = (
  rewardConfig: CheckInActivitySignConfigItem,
  rewardType?: unknown
) => {
  const resolvedRewardType =
    toNumber(rewardConfig.rewardType ?? rewardType) ?? CHECK_IN_REWARD_TYPE_FIXED

  if (resolvedRewardType === CHECK_IN_REWARD_TYPE_RANDOM) {
    return formatRewardRangeAmount(rewardConfig.amountRange)
  }

  return formatRewardDisplayNumber(rewardConfig.rewardAmount)
}

// 根据后端 ticketType 解析奖励列表使用的票券图标，统一走 vouchers 目录素材。
const resolveRewardIcon = (ticketType?: unknown) => {
  const resolvedTicketType = toNumber(ticketType)

  return resolvedTicketType !== null
    ? CHECK_IN_TICKET_TYPE_ICON_MAP[resolvedTicketType] || gameMysteryBoxIcon
    : gameMysteryBoxIcon
}

// 解析活动实际命中的币种配置，优先当前币种，其次活动币种列表，再兜底第一个 config key。
const resolveActivityCurrencyContext = (
  activity?: ActivityListItem,
  currencyCode?: string
): { config?: CheckInActivityCurrencyConfig; currencyCode?: string } => {
  const configMap = activity?.config

  if (!configMap) {
    return {}
  }

  const normalizedCurrencyCode = String(currencyCode ?? '')
    .trim()
    .toUpperCase()

  if (normalizedCurrencyCode && configMap[normalizedCurrencyCode]) {
    return {
      config: configMap[normalizedCurrencyCode],
      currencyCode: normalizedCurrencyCode
    }
  }

  const firstConfigCurrency = activity?.currencyList?.[0]

  if (firstConfigCurrency && configMap[firstConfigCurrency]) {
    return {
      config: configMap[firstConfigCurrency],
      currencyCode: firstConfigCurrency
    }
  }

  const firstConfigEntry = Object.entries(configMap).find(([, config]) => Boolean(config))

  return {
    config: firstConfigEntry?.[1],
    currencyCode: firstConfigEntry?.[0]
  }
}

// 匹配当前语言的活动简介，活动没有对应语言时不进入展示。
export const resolveCheckInActivityDesc = (activity?: ActivityListItem, languageCode?: string) => {
  const normalizedLanguageCode = normalizeCheckInLanguageCode(languageCode)

  return activity?.activityDesc?.find(item => {
    return normalizeCheckInLanguageCode(item.languageCode) === normalizedLanguageCode
  })
}

// 解析活动标题，优先使用后端 activiName，兜底 activityName 多语言配置。
const resolveCheckInActivityName = (activity?: ActivityListItem, languageCode?: string) => {
  const normalizedLanguageCode = normalizeCheckInLanguageCode(languageCode)
  const matchedActivityName = activity?.activityName?.find(item => {
    return normalizeCheckInLanguageCode(item.languageCode) === normalizedLanguageCode
  })

  return activity?.activiName || matchedActivityName?.name || ''
}

// 根据活动是否开始决定展示开始时间文案还是结束时间文案。
const resolvePromoDateMeta = (activity: ActivityListItem, status: QueryCheckInStatusResult) => {
  const startDate = status.startDate ?? activity.startDate
  const endDate = status.endDate ?? activity.endDate
  const normalizedStartDate = toNumber(startDate)
  const isNotStarted = normalizedStartDate !== null && Date.now() < normalizedStartDate

  return {
    date: formatUsDateTime12h(isNotStarted ? startDate : endDate),
    textKey: isNotStarted ? ('checkIn.promoStartsAt' as const) : ('checkIn.promoEndsAt' as const)
  }
}

// 判断当前是否可点击签到：活动进行中、已到开始时间且今日未签到。
const isCheckInActivityClaimableNow = (
  activity: ActivityListItem,
  status: QueryCheckInStatusResult
) => {
  const startDate = toNumber(status.startDate ?? activity.startDate)
  const isStarted = startDate === null || Date.now() >= startDate

  return (
    Number(activity.status) === CHECK_IN_ACTIVITY_STATUS_ACTIVE && isStarted && !status.todayIsSign
  )
}

// 将后端单天签到奖励配置转换为奖励卡片视图数据。
const createRewardItemFromConfig = (
  rewardConfig: CheckInActivitySignConfigItem,
  index: number,
  claimed: boolean,
  currencyCode?: string,
  rewardType?: unknown,
  rewardTiggerType?: number[],
  conditionRelation?: number | string | null
): CheckInRewardItem => {
  const preset = CHECK_IN_REWARD_PRESETS[index % CHECK_IN_REWARD_PRESETS.length]

  return {
    day: toNumber(rewardConfig.day) ?? index + 1,
    amount: resolveRewardConfigAmount(rewardConfig, rewardType),
    icon: resolveRewardIcon(rewardConfig.ticketType),
    currencySymbol: getCurrencySymbol(currencyCode),
    betAmount: toNumber(rewardConfig.betAmount) ?? 0,
    rechargeAmount: toNumber(rewardConfig.rechargeAmount) ?? 0,
    rewardTiggerType,
    conditionRelation,
    claimed,
    cardStyle: preset.cardStyle,
    iconShellStyle: preset.iconShellStyle,
    amountStyle: preset.amountStyle
  }
}

// 解析今日已领取奖励，只返回当前签到天对应的一条记录，避免历史记录被误判为双奖励。
const resolveTodayHistoryReward = (
  status?: QueryCheckInStatusResult
): CheckInHistorySignItem | null => {
  const historySign = status?.historySign ?? []

  if (!status?.todayIsSign) {
    return null
  }

  const currentSignDay = toNumber(status.signDays)
  const currentDayHistoryReward = [...historySign]
    .reverse()
    .find(item => toNumber(item.signDays) === currentSignDay)

  if (currentDayHistoryReward) {
    return currentDayHistoryReward
  }

  const latestTodayHistoryReward = [...historySign].reverse().find(item => item.todayIsSign)

  if (latestTodayHistoryReward) {
    return latestTodayHistoryReward
  }

  if (historySign.length > 0) {
    return historySign[historySign.length - 1]
  }

  return {
    signDays: status.signDays,
    ticket: status.ticket,
    todayIsSign: true,
    todaySignAmount: status.todaySignAmount
  }
}

// 创建主视觉现金奖励卡数据。
const createAmountHeroReward = (
  amount: unknown,
  currencyCode?: string
): CheckInHeroAmountReward | null => {
  const resolvedAmount = toNumber(amount)

  if (resolvedAmount === null) {
    return null
  }

  return {
    type: 'amount',
    amount: formatRewardAmount(amount),
    icon: cashIcon,
    currencySymbol: getCurrencySymbol(currencyCode),
    background: CHECK_IN_HERO_AMOUNT_BACKGROUND,
    amountColor: CHECK_IN_HERO_AMOUNT_COLOR
  }
}

// 根据 ticketType 匹配主视觉票券奖励卡设计预设。
const resolveHeroTicketPreset = (ticketType?: unknown) => {
  const resolvedTicketType = toNumber(ticketType)

  return resolvedTicketType !== null
    ? CHECK_IN_HERO_TICKET_PRESET_MAP[resolvedTicketType]
    : undefined
}

// 创建主视觉票券奖励卡数据。
const createActionHeroReward = (
  ticket?: CheckInTicketInfo,
  fallbackTicketType?: unknown
): CheckInHeroActionReward | null => {
  const preset = resolveHeroTicketPreset(ticket?.type ?? fallbackTicketType)

  if (!preset) {
    return null
  }

  return {
    type: 'action',
    titleKey: preset.titleKey,
    icon: preset.icon,
    background: preset.background,
    requiresPhoneVerification: toNumber(ticket?.completeVerification?.verifyPhone) === 1,
    actionKey: 'checkIn.useNow'
  }
}

// 根据 mbSign 历史记录创建主视觉奖励卡，优先解析金额奖励，缺少金额时回退票券奖励。
const createHeroRewardFromHistoryItem = (
  historyItem: CheckInHistorySignItem,
  signConfigMap: Map<number, CheckInActivitySignConfigItem>,
  currencyCode?: string
): CheckInHeroReward | null => {
  const signDay = toNumber(historyItem.signDays) ?? 0
  const matchedConfig = signConfigMap.get(signDay)
  const amountReward = createAmountHeroReward(
    historyItem.todaySignAmount ?? matchedConfig?.rewardAmount ?? historyItem.ticket?.amount,
    currencyCode
  )

  if (amountReward) {
    return amountReward
  }

  return createActionHeroReward(historyItem.ticket, matchedConfig?.ticketType)
}

// 根据 receiveReward 返回值生成领取后的主视觉卡片：只金额、只票券、金额+票券三种情况都在这里收口。
export const createCheckInHeroRewardsFromClaimResult = (
  claimResult?: ReceiveCheckInRewardResult,
  currencyCode?: string
): CheckInHeroReward[] => {
  if (!claimResult) {
    return []
  }

  const heroRewards: CheckInHeroReward[] = []
  const amountReward = createAmountHeroReward(claimResult.amount, currencyCode)
  const actionReward = createActionHeroReward(claimResult.ticket)

  if (amountReward) {
    heroRewards.push(amountReward)
  }

  if (actionReward) {
    heroRewards.push(actionReward)
  }

  return heroRewards.slice(0, 2)
}

/**
 * 创建空态签到视图数据，避免在接口未返回时渲染业务 mock 内容。
 */
export const createDefaultCheckInViewData = (): CheckInViewData => {
  return {
    title: '',
    subtitle: '',
    promoEndsAt: '',
    promoDateTextKey: 'checkIn.promoEndsAt',
    rewards: [],
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

  const resolvedCurrencyContext = resolveActivityCurrencyContext(activity, options?.currencyCode)
  const resolvedConfig = resolvedCurrencyContext.config
  const activityDesc = resolveCheckInActivityDesc(activity, options?.languageCode)
  const promoDateMeta = resolvePromoDateMeta(activity, status)
  const signConfigs = resolvedConfig?.sign ?? []
  const historySign = status.historySign ?? []
  // mbSign.historySign[].signDays 与签到配置 sign[].day 一一对应；
  // 只要某一天出现在 historySign 里，就把对应奖励卡标记为已领取。
  const claimedDays = new Set(
    historySign.map(item => toNumber(item.signDays)).filter((day): day is number => day !== null)
  )
  const signConfigMap = new Map(
    signConfigs.map(item => [toNumber(item.day) ?? 0, item] as const).filter(item => item[0] > 0)
  )
  const todayHistoryReward = resolveTodayHistoryReward(status)
  const resolvedTodayHeroReward = todayHistoryReward
    ? createHeroRewardFromHistoryItem(
        todayHistoryReward,
        signConfigMap,
        resolvedCurrencyContext.currencyCode
      )
    : null
  const heroRewards = resolvedTodayHeroReward ? [resolvedTodayHeroReward] : []

  return {
    activityId: activity.rowId,
    title: resolveCheckInActivityName(activity, options?.languageCode) || '',
    subtitle: activityDesc?.name || '',
    promoEndsAt: promoDateMeta.date,
    promoDateTextKey: promoDateMeta.textKey,
    rewards:
      signConfigs.length > 0
        ? signConfigs.map((item, index) =>
            createRewardItemFromConfig(
              item,
              index,
              claimedDays.has(toNumber(item.day) ?? index + 1),
              resolvedCurrencyContext.currencyCode,
              resolvedConfig?.rewardType,
              resolvedConfig?.rewardTiggerType,
              resolvedConfig?.conditionRelation
            )
          )
        : [],
    canClaim: isCheckInActivityClaimableNow(activity, status),
    heroRewards,
    todayIsSign: Boolean(status.todayIsSign)
  }
}
