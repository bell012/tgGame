import type {
  QueryReferralSettlementRuleResult,
  QueryReferralTaskProgressResult,
  QueryTaskRewardCommissionItem,
  QueryTaskRewardConfigResult
} from '@/api/interface/agent'
import Api from '@/api'
import quickDetailsIcon from '@/static/img/referral/quick-action-details.png'
import quickGuideIcon from '@/static/img/referral/quick-action-guide.png'
import quickRulesIcon from '@/static/img/referral/quick-action-rules.png'
import quickTaskIcon from '@/static/img/referral/quick-action-task.png'
import commissionCoinIcon from '@/static/img/referral/referral-coin.png'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { formatBalance, getLanguageCode } from '@/utils/locale'

type TranslateFn = (key: string, named?: Record<string, unknown>) => string

type SiteConfigWithAgentShare = {
  baseSiteConfig?: {
    agent_share_url?: string
  }
}

export type ReferralQuickActionId = 'tasks' | 'details' | 'rules' | 'guide'

export interface ReferralShareChannelApiItem {
  openStatus?: unknown
  shareDomainImage?: unknown
  shareDomainUrl?: unknown
  shareName?: unknown
  site?: unknown
  sort?: unknown
}

export interface ReferralQuickAction {
  id: ReferralQuickActionId
  label: string
  icon: string
}

export interface ReferralSocialChannel {
  openStatus: number
  shareDomainImage: string
  shareDomainUrl: string
  shareName: string
  site: string
  sort: number
}

export interface ReferralBannerSlide {
  rowId: number
  url: string
  sortNum: number
  jumpType: number
  linkType: number
  linkUrl: string
}

export interface ReferralBannerPayload {
  bannerSlides: ReferralBannerSlide[]
  posterImages: string[]
}

export type ReferralCommissionBoostPeriodTabKey = 'current' | 'previous'
export type ReferralSettlementPeriodType = 'daily' | 'weekly' | 'monthly'

export interface ReferralCommissionBoostLevelView {
  id: string
  rateText: string
  activeFriendsText: string
}

export interface ReferralCommissionBoostViewData {
  estimatedCommissionText: string
  friendsDeltaText: string
  currentLevelRateText: string
  activeFriendsText: string
  progressPercent: number
  levels: ReferralCommissionBoostLevelView[]
}

export interface ReferralWeekRange {
  startTime: number
  endTime: number
}

export interface ReferralCommissionBoostPeriodMeta {
  periodType: ReferralSettlementPeriodType
  currentLabel: string
  previousLabel: string
}

const referralBannerPayloadCache = new Map<string, ReferralBannerPayload>()
const referralBannerPendingRequests = new Map<string, Promise<ReferralBannerPayload>>()

/**
 * 将资源字段转换为可用图片地址。
 */
export const toReferralAssetImageUrl = (value: unknown) => {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue
  }

  const imageBaseUrl = String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '').replace(/\/+$/, '')
  const imagePath = normalizedValue.replace(/^\/+/, '')

  return imageBaseUrl ? `${imageBaseUrl}/${imagePath}` : normalizedValue
}

/**
 * 将分享图标字段转换为可用图片地址。
 */
export const toReferralSocialChannelImageUrl = (value: unknown) => toReferralAssetImageUrl(value)

/**
 * 将接口返回的分享渠道配置转换为页面可用数据。
 */
export const buildReferralSocialChannelsFromApi = (result: unknown): ReferralSocialChannel[] => {
  if (!Array.isArray(result)) {
    return []
  }

  return result
    .filter(item => Number((item as ReferralShareChannelApiItem)?.openStatus ?? 1) === 1)
    .map((item, index) => {
      const channelItem = (item ?? {}) as ReferralShareChannelApiItem
      const shareName = String(channelItem.shareName ?? '').trim()
      const shareDomainImage = toReferralSocialChannelImageUrl(channelItem.shareDomainImage)
      const shareDomainUrl = String(channelItem.shareDomainUrl ?? '').trim()
      const site = String(channelItem.site ?? '').trim()
      const sort = Number(channelItem.sort)

      return {
        openStatus: Number(channelItem.openStatus ?? 1),
        shareDomainImage,
        shareDomainUrl,
        shareName,
        site,
        sort: Number.isFinite(sort) ? sort : index
      }
    })
    .filter(
      item =>
        Boolean(item.shareName) && Boolean(item.shareDomainImage) && Boolean(item.shareDomainUrl)
    )
    .sort((left, right) => left.sort - right.sort)
}

/**
 * 将接口返回的轮播图配置转换为推荐页横幅轮播数据。
 * 保留后台原始 key，仅对值做规范化处理。
 */
export const buildReferralBannerSlidesFromApi = (result: unknown): ReferralBannerSlide[] => {
  if (!Array.isArray(result)) {
    return []
  }

  return result
    .filter(item => {
      const record = (item ?? {}) as Record<string, unknown>
      return Number(record.deploymentPath) === 4 && Number(record.enable ?? 1) === 1
    })
    .map((item, index) => {
      const record = (item ?? {}) as Record<string, unknown>
      const url = toReferralAssetImageUrl(record.url)
      const rowId = Number(record.rowId)
      const sortNum = Number(record.sortNum)

      return {
        rowId: Number.isFinite(rowId) ? rowId : index,
        url,
        sortNum: Number.isFinite(sortNum) ? sortNum : index,
        jumpType: Number(record.jumpType) || 0,
        linkType: Number(record.linkType) || 0,
        linkUrl: String(record.linkUrl ?? '').trim()
      }
    })
    .filter(item => Boolean(item.url))
    .sort((left, right) => left.sortNum - right.sortNum)
}

/**
 * 将接口返回的轮播图配置转换为邀请海报图片列表。
 */
export const buildReferralPosterImagesFromApi = (result: unknown): string[] => {
  if (!Array.isArray(result)) {
    return []
  }

  return result
    .filter(item => {
      const record = (item ?? {}) as Record<string, unknown>
      return Number(record.deploymentPath) === 3 && Number(record.enable ?? 1) === 1
    })
    .map((item, index) => {
      const record = (item ?? {}) as Record<string, unknown>
      const image = toReferralAssetImageUrl(record.url)
      const sort = Number(record.sortNum)

      return {
        image,
        sort: Number.isFinite(sort) ? sort : index
      }
    })
    .filter(item => Boolean(item.image))
    .sort((left, right) => left.sort - right.sort)
    .map(item => item.image)
}

/**
 * 生成推荐页顶部快捷入口数据。
 */
export const createReferralQuickActions = (t: TranslateFn): ReferralQuickAction[] => [
  {
    id: 'tasks',
    label: t('referral.h5.quickActions.tasks'),
    icon: quickTaskIcon
  },
  {
    id: 'details',
    label: t('referral.h5.quickActions.details'),
    icon: quickDetailsIcon
  },
  {
    id: 'rules',
    label: t('referral.h5.quickActions.rules'),
    icon: quickRulesIcon
  },
  {
    id: 'guide',
    label: t('referral.h5.quickActions.guide'),
    icon: quickGuideIcon
  }
]

/**
 * 返回佣金图标资源。
 */
export const getReferralCommissionCoinImage = () => commissionCoinIcon

/**
 * 返回邀请任务卡片的首档奖励人数与金额。
 */
export const getReferralInviteTaskReward = (result?: QueryTaskRewardConfigResult | null) => {
  const firstFriendReward = result?.config?.friendList?.[0]

  return {
    count: String(firstFriendReward?.min ?? '0'),
    amount: String(firstFriendReward?.reward ?? '0')
  }
}

/**
 * 判断任务进度数据是否存在有效值。
 */
export const hasReferralTaskProgressData = (result?: QueryReferralTaskProgressResult | null) => {
  if (!result) {
    return false
  }

  return [
    result.activeSubNum,
    result.newSub,
    result.rechargeSubNum,
    result.subBet,
    result.subNum,
    result.subRecharge
  ].some(value => Number(value ?? 0) > 0)
}

/**
 * 构建推荐页本周与上周的查询区间。
 */
const getStartOfDay = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const getEndOfDay = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(23, 59, 59, 999)
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

/**
 * 规范化推荐页结算周期类型。
 */
export const normalizeReferralSettlementPeriodType = (
  settlementType?: number | string
): ReferralSettlementPeriodType => {
  const normalizedType = Number(settlementType)

  if (normalizedType === 1) {
    return 'daily'
  }

  if (normalizedType === 3) {
    return 'monthly'
  }

  return 'weekly'
}

/**
 * 生成推荐页佣金加码周期标签文案。
 */
export const createReferralCommissionBoostPeriodMeta = (
  t: TranslateFn,
  settlementRule?: QueryReferralSettlementRuleResult | null
): ReferralCommissionBoostPeriodMeta => {
  const periodType = normalizeReferralSettlementPeriodType(settlementRule?.settlementType)

  if (periodType === 'daily') {
    return {
      periodType,
      currentLabel: t('referral.commissionBoost.today'),
      previousLabel: t('referral.commissionBoost.yesterday')
    }
  }

  if (periodType === 'monthly') {
    return {
      periodType,
      currentLabel: t('referral.commissionBoost.thisMonth'),
      previousLabel: t('referral.commissionBoost.lastMonth')
    }
  }

  return {
    periodType,
    currentLabel: t('referral.commissionBoost.thisWeek'),
    previousLabel: t('referral.commissionBoost.lastWeek')
  }
}

/**
 * 构建推荐页当前周期与上一周期的查询区间。
 */
export const buildReferralTaskPeriodRanges = (
  settlementRule?: QueryReferralSettlementRuleResult | null,
  now = new Date()
) => {
  const periodType = normalizeReferralSettlementPeriodType(settlementRule?.settlementType)
  const settlementDay = Number(settlementRule?.settlementDay ?? 1)
  const currentDate = new Date(now)
  const currentPeriodEnd = getEndOfDay(currentDate)

  if (periodType === 'daily') {
    const currentStart = getStartOfDay(currentDate)
    const previousStart = new Date(currentStart)
    previousStart.setDate(previousStart.getDate() - 1)
    const previousEnd = new Date(currentStart)
    previousEnd.setMilliseconds(-1)

    return {
      current: {
        startTime: currentStart.getTime(),
        endTime: currentPeriodEnd.getTime()
      },
      previous: {
        startTime: previousStart.getTime(),
        endTime: previousEnd.getTime()
      }
    } satisfies Record<ReferralCommissionBoostPeriodTabKey, ReferralWeekRange>
  }

  if (periodType === 'monthly') {
    const currentStart = getMonthStartBySettlementDay(currentDate, settlementDay)
    const previousEnd = new Date(currentStart)
    previousEnd.setMilliseconds(-1)
    const previousStart = getMonthStartBySettlementDay(
      new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate() - 1),
      settlementDay
    )

    return {
      current: {
        startTime: currentStart.getTime(),
        endTime: currentPeriodEnd.getTime()
      },
      previous: {
        startTime: previousStart.getTime(),
        endTime: previousEnd.getTime()
      }
    } satisfies Record<ReferralCommissionBoostPeriodTabKey, ReferralWeekRange>
  }

  const currentStart = getWeekStartBySettlementDay(currentDate, settlementDay)
  const previousEnd = new Date(currentStart)
  previousEnd.setMilliseconds(-1)
  const previousStart = new Date(currentStart)
  previousStart.setDate(previousStart.getDate() - 7)

  return {
    current: {
      startTime: currentStart.getTime(),
      endTime: currentPeriodEnd.getTime()
    },
    previous: {
      startTime: previousStart.getTime(),
      endTime: previousEnd.getTime()
    }
  } satisfies Record<ReferralCommissionBoostPeriodTabKey, ReferralWeekRange>
}

/**
 * 将佣金等级配置转换为佣金加码卡片展示数据。
 */
export const createReferralCommissionBoostViewData = (
  t: TranslateFn,
  commissionList: QueryTaskRewardCommissionItem[] | undefined,
  progressResult?: QueryReferralTaskProgressResult | null
): ReferralCommissionBoostViewData => {
  const normalizedCommissionLevels = (commissionList ?? [])
    .map((item, index) => ({
      id: String(item.id ?? `commission-level-${index}`),
      people: Number(item.people ?? 0),
      rate: Number(item.rate ?? 0),
      dayTeamBet: Number(item.dayTeamBet ?? 0)
    }))
    .filter(item => Number.isFinite(item.people) && Number.isFinite(item.rate))
    .sort((left, right) => left.people - right.people)

  const activeFriends = Number(progressResult?.activeSubNum ?? 0)
  const validBets = Number(progressResult?.subBet ?? 0)
  const newFriends = Number(progressResult?.newSub ?? 0)
  const formatCommissionRateText = (rate: number) => `${String(rate)}%`

  const currentLevel =
    normalizedCommissionLevels.reduce<(typeof normalizedCommissionLevels)[number] | null>(
      (matchedLevel, level) => {
        if (activeFriends >= level.people && validBets >= level.dayTeamBet) {
          return level
        }

        return matchedLevel
      },
      null
    ) ?? null

  const currentRate = currentLevel?.rate ?? 0
  const nextLevel =
    normalizedCommissionLevels.find(
      level => activeFriends < level.people || validBets < level.dayTeamBet
    ) ?? null

  const estimatedCommission = validBets * (currentRate / 100)
  const nextPeopleTarget = Number(nextLevel?.people ?? 0)
  const progressPercent =
    nextPeopleTarget > 0
      ? Math.max(0, Math.min(100, (activeFriends / nextPeopleTarget) * 100))
      : normalizedCommissionLevels.length > 0
        ? 100
        : 0

  return {
    estimatedCommissionText: formatBalance(estimatedCommission, 2),
    friendsDeltaText: `+${Math.max(0, newFriends)}`,
    currentLevelRateText: formatCommissionRateText(currentRate),
    activeFriendsText: formatBalance(activeFriends, 0),
    progressPercent,
    levels: normalizedCommissionLevels.map(level => ({
      id: level.id,
      rateText: formatCommissionRateText(level.rate),
      activeFriendsText:
        level.people === 1
          ? t('referral.commissionBoost.activeFriendSingular', {
              count: formatBalance(level.people, 0)
            })
          : t('referral.commissionBoost.activeFriendPlural', {
              count: formatBalance(level.people, 0)
            })
    }))
  }
}

/**
 * 生成推荐页榜单祝贺文案。
 */
export const createReferralMarqueeMessages = (records: unknown[]): string[] => {
  return records
    .map(item => String(((item ?? {}) as Record<string, unknown>).noticeTitle ?? '').trim())
    .filter(Boolean)
}

/**
 * 生成推荐文案弹窗预设文案列表。
 */
export const createReferralMessagePresets = (t: TranslateFn): string[] => [
  t('referral.messagePopup.presets.exclusiveRewards'),
  t('referral.messagePopup.presets.earnTogether'),
  t('referral.messagePopup.presets.unlockBonus')
]

/**
 * 构建推荐页默认分享链接。
 */
export const getDefaultReferralLink = () => {
  const siteConfigStore = useSiteConfigStore()
  siteConfigStore.syncStoredConfig()

  const agentShareUrl = (
    siteConfigStore.config as SiteConfigWithAgentShare | null
  )?.baseSiteConfig?.agent_share_url?.trim()

  if (agentShareUrl) {
    return agentShareUrl.replace(/\/+$/, '')
  }

  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.origin.replace(/\/+$/, '')
}

/**
 * 构建推荐页复制文案内容。
 */
export const buildReferralShareMessage = (...segments: unknown[]) =>
  segments
    .map(item => String(item ?? '').trim())
    .filter(Boolean)
    .join(' ')

/**
 * 构建推荐页横幅请求缓存键。
 */
export const buildReferralBannerRequestKey = (channelId: string, languageCode: string) =>
  `${String(channelId ?? '').trim()}::${String(languageCode ?? '').trim()}`

/**
 * 读取推荐页横幅缓存数据。
 */
export const getCachedReferralBannerPayload = (key: string) =>
  referralBannerPayloadCache.get(String(key ?? '').trim())

/**
 * 请求并缓存推荐页横幅和邀请海报数据。
 */
export const fetchReferralBannerPayload = (channelId: string, languageCode = getLanguageCode()) => {
  const requestKey = buildReferralBannerRequestKey(channelId, languageCode)

  return resolveReferralBannerPayload(requestKey, async () => {
    const response = await Api.home.getQuerySlideshow({
      languageCode,
      channelId,
      page: {
        current: 1,
        size: 100
      }
    })

    const records = Array.isArray(response?.result?.records) ? response.result.records : []

    return {
      bannerSlides: buildReferralBannerSlidesFromApi(records),
      posterImages: buildReferralPosterImagesFromApi(records)
    }
  })
}

/**
 * 按缓存键复用推荐页横幅请求，避免同参数重复拉取。
 */
export const resolveReferralBannerPayload = async (
  key: string,
  loader: () => Promise<ReferralBannerPayload>
) => {
  const normalizedKey = String(key ?? '').trim()
  const cachedPayload = getCachedReferralBannerPayload(normalizedKey)

  if (cachedPayload) {
    return cachedPayload
  }

  const pendingRequest = referralBannerPendingRequests.get(normalizedKey)
  if (pendingRequest) {
    return pendingRequest
  }

  const requestPromise = loader()
    .then(payload => {
      referralBannerPayloadCache.set(normalizedKey, payload)
      return payload
    })
    .finally(() => {
      referralBannerPendingRequests.delete(normalizedKey)
    })

  referralBannerPendingRequests.set(normalizedKey, requestPromise)
  return requestPromise
}
