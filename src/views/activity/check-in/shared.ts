import type {
  ActivityListItem,
  CheckInActivityCurrencyConfig,
  CheckInActivitySignConfigItem,
  CheckInHistorySignItem,
  CheckInTicketInfo,
  QueryCheckInStatusResult
} from '@/api/interface/activity'
import { formatUsDateTime12h } from '@/utils/date'
import { getCurrencySymbol } from '@/utils/locale'
import cashIcon from '@/static/img/check-in/cash.png'
import giftBoxClosed from '@/static/img/check-in/gift-box-closed.png'
import giftBoxOpened from '@/static/img/check-in/gift-box-open.png'
import giftBoxIcon from '@/static/img/check-in/gift-box.png'
import goldenEggIcon from '@/static/img/check-in/golden-egg.png'
import gameCashVoucherIcon from '@/static/img/lucky-spin/vouchers/game-cash-voucher.png'
import gameGoldenEggIcon from '@/static/img/lucky-spin/vouchers/game-golden-egg.png'
import gameLuckyRedEnvelopeIcon from '@/static/img/lucky-spin/vouchers/game-lucky-red-envelope.png'
import gameLuckySpinIcon from '@/static/img/lucky-spin/vouchers/game-lucky-spin.png'
import gameMysteryBoxIcon from '@/static/img/lucky-spin/vouchers/game-mystery-box.png'
import checkInCloseButton from '@/static/img/check-in/popup-close.png'
import checkInRulesButton from '@/static/img/check-in/popup-rules.png'
import redPacketIcon from '@/static/img/check-in/red-packet.png'
import turntableIcon from '@/static/img/check-in/roulette.png'
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
}

// 主视觉功能奖励，用于签到后展示票券/玩法入口类奖励。
export interface CheckInHeroActionReward {
  type: 'action'
  title?: string
  titleKey?: string
  icon: string
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

// 后端 ticketType 到奖励图片的映射：1 现金、2 红包、3 金蛋、4 转盘、5/6 盲盒。
const CHECK_IN_TICKET_TYPE_ICON_MAP: Record<number, string> = {
  1: gameCashVoucherIcon,
  2: gameLuckyRedEnvelopeIcon,
  3: gameGoldenEggIcon,
  4: gameLuckySpinIcon,
  5: gameMysteryBoxIcon,
  6: gameMysteryBoxIcon
}

// 接口未返回前的默认奖励列表，仅用于开发兜底和骨架外的异常降级。
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
    currencySymbol: getCurrencySymbol(),
    claimed: false,
    cardStyle: preset.cardStyle,
    iconShellStyle: preset.iconShellStyle,
    amountStyle: preset.amountStyle
  }
})

// 将后端可能返回的字符串/数字安全转换为 number。
const toNumber = (value: unknown) => {
  const normalizedValue =
    typeof value === 'string' && value.trim().length === 0 ? Number.NaN : Number(value)

  return Number.isFinite(normalizedValue) ? normalizedValue : null
}

// 格式化普通金额；fixedDigits 用于主视觉领取结果的两位小数展示。
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
      value: formatRewardDisplayNumber(reward.betAmount)
    })
  }

  if (hasBetRequirement) {
    items.push({
      label: CHECK_IN_REQUIREMENT_LABEL_VALID_BET,
      value: formatRewardDisplayNumber(reward.rechargeAmount)
    })
  }

  return {
    mode,
    items
  }
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

// 根据后端 ticketType 解析奖励卡片和主视觉使用的票券图标。
const resolveRewardIcon = (ticketType?: unknown, fallbackIndex = 0) => {
  const resolvedTicketType = toNumber(ticketType)
  const mappedIcon =
    resolvedTicketType !== null ? CHECK_IN_TICKET_TYPE_ICON_MAP[resolvedTicketType] : undefined

  return mappedIcon || CHECK_IN_REWARD_PRESETS[fallbackIndex % CHECK_IN_REWARD_PRESETS.length].icon
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

// 从票券多语言信息中解析当前语言的票券名称。
const resolveTicketLanguageName = (ticket?: CheckInTicketInfo, languageCode?: string) => {
  const normalizedLanguageCode = normalizeCheckInLanguageCode(languageCode)

  const matchedLanguageInfo = ticket?.languageInfo?.find(item => {
    return normalizeCheckInLanguageCode(item.languageCode) === normalizedLanguageCode
  })

  return matchedLanguageInfo?.name || ticket?.languageInfo?.[0]?.name || ''
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
    icon: resolveRewardIcon(rewardConfig.ticketType, index),
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

// 解析今日已领取奖励，优先使用 mbSign 顶层今日奖励，再回退 historySign。
const resolveTodayHistoryRewards = (status?: QueryCheckInStatusResult) => {
  const historySign = status?.historySign ?? []
  const todayRewards = historySign.filter(item => item.todayIsSign)
  const topLevelTodayReward: CheckInHistorySignItem | null = status?.todayIsSign
    ? {
        signDays: status.signDays,
        ticket: status.ticket,
        todayIsSign: true,
        todaySignAmount: status.todaySignAmount
      }
    : null

  if (topLevelTodayReward) {
    return [topLevelTodayReward, ...todayRewards].slice(0, 2)
  }

  if (todayRewards.length > 0) {
    return todayRewards.slice(0, 2)
  }

  if (status?.todayIsSign && historySign.length > 0) {
    return [historySign[historySign.length - 1]]
  }

  return []
}

// 创建主视觉左侧金额奖励数据。
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

// 创建主视觉右侧功能奖励数据。
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
    title: 'Daily Check-in Rewards',
    subtitle: 'Check in daily to claim rewards',
    promoEndsAt: '12/18/2026 11:14:15 AM',
    promoDateTextKey: 'checkIn.promoEndsAt',
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

  const resolvedCurrencyContext = resolveActivityCurrencyContext(activity, options?.currencyCode)
  const resolvedConfig = resolvedCurrencyContext.config
  const activityDesc = resolveCheckInActivityDesc(activity, options?.languageCode)
  const promoDateMeta = resolvePromoDateMeta(activity, status)
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
    title: resolveCheckInActivityName(activity, options?.languageCode) || 'Daily Check-in Rewards',
    subtitle: activityDesc?.name || 'Check in daily to claim rewards',
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
        : DEFAULT_REWARDS,
    canClaim: isCheckInActivityClaimableNow(activity, status),
    heroRewards,
    todayIsSign: Boolean(status.todayIsSign)
  }
}
