import { computed, type Component, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import Api from '@/api'
import type { CommonResponse, VipListItem } from '@/api/interface/vip'
import { useUserStore } from '@/stores/user'
import { useVipStore } from '@/stores/vip'
import { useThemeStore } from '@/stores/theme'
import {
  DEFAULT_AVATAR_FRAME_ID,
  profileCustomizationState,
  resolveProfileAvatarUrl,
  type AvatarFrameId
} from '@/utils/profile-customization'
import { formatBalance } from '@/utils/locale'
import border1Image from '@/static/img/personalCenter/border_1.png'
import border2Image from '@/static/img/personalCenter/border_2.png'
import border3Image from '@/static/img/personalCenter/border_3.png'
import border4Image from '@/static/img/personalCenter/border_4.png'
import border5Image from '@/static/img/personalCenter/border_5.png'
import item1Image from '@/static/img/personalCenter/item_1.png'
import item3Image from '@/static/img/personalCenter/item_3.png'
import item4Image from '@/static/img/personalCenter/item_4.png'
import rule1Icon from '@/static/svg/rule_1.svg?url'
import rule2Icon from '@/static/svg/rule_2.svg?url'
import VipCardWordmarkIcon from '@/static/svg/vip/vip.svg?url'
import VipLevel0Icon from '@/static/svg/vip/0.svg?url'
import VipLevel1Icon from '@/static/svg/vip/1.svg?url'
import VipLevel2Icon from '@/static/svg/vip/2.svg?url'
import VipLevel3Icon from '@/static/svg/vip/3.svg?url'
import VipLevel4Icon from '@/static/svg/vip/4.svg?url'
import VipLevel5Icon from '@/static/svg/vip/5.svg?url'
import VipLevel6Icon from '@/static/svg/vip/6.svg?url'
import VipLevel7Icon from '@/static/svg/vip/7.svg?url'
import VipLevel8Icon from '@/static/svg/vip/8.svg?url'
import VipLevel9Icon from '@/static/svg/vip/9.svg?url'
import VipLevel10Icon from '@/static/svg/vip/10.svg?url'
import VipRight0Icon from '@/static/svg/vip/vip0.svg?url'
import VipRight1Icon from '@/static/svg/vip/vip1.svg?url'
import VipRight2Icon from '@/static/svg/vip/vip2.svg?url'
import VipRight3Icon from '@/static/svg/vip/vip3.svg?url'
import VipRight4Icon from '@/static/svg/vip/vip4.svg?url'
import VipRight5Icon from '@/static/svg/vip/vip5.svg?url'
import VipRight6Icon from '@/static/svg/vip/vip6.svg?url'
import VipRight7Icon from '@/static/svg/vip/vip7.svg?url'
import VipRight8Icon from '@/static/svg/vip/vip8.svg?url'
import VipRight9Icon from '@/static/svg/vip/vip9.svg?url'
import VipRight10Icon from '@/static/svg/vip/vip10.svg?url'
import VipCornerUnlockedIcon from '@/static/svg/vip/kai.svg?component'
import VipCornerLockedIcon from '@/static/svg/vip/suo.svg?component'

type Translate = (key: string, named?: Record<string, unknown>) => string

interface UseVipPageDataOptions {
  viewedVipId?: Readonly<Ref<number | null | undefined>>
}

export type VipBenefitCardKey = 'levelUp' | 'weekly' | 'monthly'
export type VipBenefitCardStatus = 'claim' | 'upgrade'

export interface VipProgressItem {
  key: string
  label: string
  current: string
  target: string
  progress: number
}

export interface VipBenefitCard {
  key: VipBenefitCardKey
  title: string
  amount: string
  status: VipBenefitCardStatus
  buttonText: string
  background: string
  image: string
}

export interface VipRetentionCard {
  key: string
  label: string
  amount: string
  icon: string
}

export interface VipBenefitComparisonRow {
  key: string
  label: string
  amount: string
  emphasized?: boolean
}

export interface VipBenefitComparisonColumn {
  key: 'current' | 'unlock'
  vipId: number
  title: string
  rows: VipBenefitComparisonRow[]
}

type VipThemeVariant =
  | 'vip0'
  | 'vip1'
  | 'vip2'
  | 'vip3'
  | 'vip4'
  | 'vip5'
  | 'vip6'
  | 'vip7'
  | 'vip8'
  | 'vip9'
  | 'vip10'

type VipCardThemeConfig = {
  darkBackground: string
  lightBackground: string
  accentColor: string
  progressTextColor: string
  progressTrackColor: string
  progressFillColor: string
  wordmarkColor: string
  rightDecoration: string
}

export interface VipCardTheme {
  background: string
  accentColor: string
  progressTextColor: string
  progressTrackColor: string
  progressFillColor: string
  wordmarkColor: string
  wordmarkIcon: string
  levelNumberIcon: string
  rightDecorationIcon: string
  cornerBadgeIcon: Component
  goalHintKey: string
}

type VipBenefitCardBackground = {
  darkBackground: string
  lightBackground: string
}

type VipListRewardMoneyField = 'upgradedMoney' | 'weekMoney' | 'monthMoney'
type VipListRewardAmountField = 'upgradedAmount' | 'weekAmount' | 'monthAmount'

const benefitCardBackgroundMap: Record<VipBenefitCardKey, VipBenefitCardBackground> = {
  levelUp: {
    darkBackground: 'linear-gradient(90deg, #255580 0%, #313333 100%)',
    lightBackground: 'linear-gradient(90deg, #ADD5F9 0%, #FFF 100%)'
  },
  weekly: {
    darkBackground: 'linear-gradient(90deg, #834A26 0%, #313333 100%)',
    lightBackground: 'linear-gradient(90deg, #FECFB3 0%, #FFF 100%)'
  },
  monthly: {
    darkBackground: 'linear-gradient(90deg, #733032 0%, #313333 100%)',
    lightBackground: 'linear-gradient(90deg, #FEB6B6 0%, #FFF 100%)'
  }
}

const vipListRewardFieldMap: Record<
  VipBenefitCardKey,
  {
    money: VipListRewardMoneyField
    amount: VipListRewardAmountField
  }
> = {
  levelUp: {
    money: 'upgradedMoney',
    amount: 'upgradedAmount'
  },
  weekly: {
    money: 'weekMoney',
    amount: 'weekAmount'
  },
  monthly: {
    money: 'monthMoney',
    amount: 'monthAmount'
  }
}

const avatarFrameImageMap: Record<Exclude<AvatarFrameId, 'none'>, string> = {
  border_1: border1Image,
  border_2: border2Image,
  border_3: border3Image,
  border_4: border4Image,
  border_5: border5Image
}

const vipLevelNumberIconMap: Record<number, string> = {
  0: VipLevel0Icon,
  1: VipLevel1Icon,
  2: VipLevel2Icon,
  3: VipLevel3Icon,
  4: VipLevel4Icon,
  5: VipLevel5Icon,
  6: VipLevel6Icon,
  7: VipLevel7Icon,
  8: VipLevel8Icon,
  9: VipLevel9Icon,
  10: VipLevel10Icon
}

const vipCardThemeConfigMap: Record<VipThemeVariant, VipCardThemeConfig> = {
  vip0: {
    darkBackground: 'linear-gradient(180deg, #8C989A 0%, #414747 100%)',
    lightBackground: 'linear-gradient(180deg, #DBDBDB 0%, #C4C8C8 100%)',
    wordmarkColor: '#FFFFFF',
    accentColor: '#FFFFFF',
    progressTextColor: '#8F9D9E',
    progressTrackColor: 'rgba(255, 255, 255, 0.15)',
    progressFillColor: '#FFFFFF',
    rightDecoration: VipRight0Icon
  },
  vip1: {
    darkBackground: 'linear-gradient(180deg, #8C7797 0%, #3F2E45 100%)',
    lightBackground: 'linear-gradient(180deg, #FAE9FF 0%, #DCBFE1 100%)',
    wordmarkColor: '#B599CB',
    accentColor: '#B599CB',
    progressTextColor: '#9A83AC',
    progressTrackColor: 'rgba(181, 153, 203, 0.15)',
    progressFillColor: '#B599CB',
    rightDecoration: VipRight1Icon
  },
  vip2: {
    darkBackground: 'linear-gradient(180deg, #557364 0%, #2C4235 100%)',
    lightBackground: 'linear-gradient(180deg, #D0F9E1 0%, #A5DBB0 100%)',
    wordmarkColor: '#70BD88',
    accentColor: '#70BD88',
    progressTextColor: '#5D9771',
    progressTrackColor: 'rgba(112, 189, 136, 0.15)',
    progressFillColor: '#70BD88',
    rightDecoration: VipRight2Icon
  },
  vip3: {
    darkBackground: 'linear-gradient(180deg, #938E37 0%, #434018 100%)',
    lightBackground: 'linear-gradient(180deg, #FFFCC9 0%, #EBE781 100%)',
    wordmarkColor: '#D3BF04',
    accentColor: '#D3BF04',
    progressTextColor: '#B6A348',
    progressTrackColor: 'rgba(211, 191, 4, 0.15)',
    progressFillColor: '#D3BF04',
    rightDecoration: VipRight3Icon
  },
  vip4: {
    darkBackground: 'linear-gradient(180deg, #26918C 0%, #263D3F 100%)',
    lightBackground: 'linear-gradient(180deg, #D6FFED 0%, #A5F8FF 100%)',
    wordmarkColor: '#2AD2CA',
    accentColor: '#2AD2CA',
    progressTextColor: '#45AEA0',
    progressTrackColor: 'rgba(42, 210, 202, 0.15)',
    progressFillColor: '#2AD2CA',
    rightDecoration: VipRight4Icon
  },
  vip5: {
    darkBackground: 'linear-gradient(180deg, #137134 0%, #1A2F25 100%)',
    lightBackground: 'linear-gradient(180deg, #CFFED7 0%, #8CE5BA 100%)',
    wordmarkColor: '#2AEE88',
    accentColor: '#2AEE88',
    progressTextColor: '#198E48',
    progressTrackColor: 'rgba(42, 238, 136, 0.15)',
    progressFillColor: '#2AEE88',
    rightDecoration: VipRight5Icon
  },
  vip6: {
    darkBackground: 'linear-gradient(180deg, #103781 0%, #1D1F2E 100%)',
    lightBackground: 'linear-gradient(180deg, #C4E7FF 0%, #A5C3FF 100%)',
    wordmarkColor: '#2AB3EE',
    accentColor: '#2AB3EE',
    progressTextColor: '#3E5DA3',
    progressTrackColor: 'rgba(42, 179, 238, 0.15)',
    progressFillColor: '#2AB3EE',
    rightDecoration: VipRight6Icon
  },
  vip7: {
    darkBackground: 'linear-gradient(180deg, #833AB0 0%, #372841 100%)',
    lightBackground: 'linear-gradient(180deg, #E5CAFF 0%, #F3A5FF 100%)',
    wordmarkColor: '#C064F5',
    accentColor: '#C064F5',
    progressTextColor: '#A365B5',
    progressTrackColor: 'rgba(192, 100, 245, 0.15)',
    progressFillColor: '#C064F5',
    rightDecoration: VipRight7Icon
  },
  vip8: {
    darkBackground: 'linear-gradient(180deg, #AD9041 0%, #423829 100%)',
    lightBackground: 'linear-gradient(180deg, #FFF9C7 0%, #FFDBA5 100%)',
    wordmarkColor: '#EEB440',
    accentColor: '#EEB440',
    progressTextColor: '#B79A51',
    progressTrackColor: 'rgba(238, 180, 64, 0.15)',
    progressFillColor: '#EEB440',
    rightDecoration: VipRight8Icon
  },
  vip9: {
    darkBackground: 'linear-gradient(180deg, #B13585 0%, #2E1D28 100%)',
    lightBackground: 'linear-gradient(180deg, #FFC8EC 0%, #FFA5BF 100%)',
    wordmarkColor: '#FD63D4',
    accentColor: '#FD63D4',
    progressTextColor: '#B5649A',
    progressTrackColor: 'rgba(253, 99, 212, 0.15)',
    progressFillColor: '#FD63D4',
    rightDecoration: VipRight9Icon
  },
  vip10: {
    darkBackground: 'linear-gradient(180deg, #9D1A1D 0%, #2E1D1D 100%)',
    lightBackground: 'linear-gradient(180deg, #FFCDCE 0%, #FFA5A7 100%)',
    wordmarkColor: '#FF5659',
    accentColor: '#FF5659',
    progressTextColor: '#C54C4E',
    progressTrackColor: 'rgba(255, 86, 89, 0.15)',
    progressFillColor: '#FF5659',
    rightDecoration: VipRight10Icon
  }
}

/**
 * 将 vipId 映射到卡片主题配置 key；超出 vip0-vip10 时统一回退到 vip0。
 */
const resolveVipThemeVariant = (vipId?: number | null): VipThemeVariant => {
  if (typeof vipId === 'number' && vipId >= 0 && vipId <= 10) {
    return `vip${vipId}` as VipThemeVariant
  }

  return 'vip0'
}

/**
 * 根据当前用户等级与当前卡片等级，决定右下角显示解锁还是未解锁角标。
 */
const resolveVipCardCornerBadgeIcon = (
  currentVipId?: number | null,
  viewedVipId?: number | null
) => {
  return currentVipId === viewedVipId ? VipCornerUnlockedIcon : VipCornerLockedIcon
}

/**
 * 根据当前用户等级与当前卡片等级，返回卡片底部提示文案 key。
 */
const resolveVipCardGoalHintKey = (currentVipId?: number | null, viewedVipId?: number | null) => {
  return currentVipId === viewedVipId ? 'vipPage.goalHint.unlocked' : 'vipPage.goalHint.keepGoing'
}

/**
 * 根据 vipId 返回左侧等级数字 SVG；超出范围时默认回退到 vip0。
 */
const resolveVipLevelNumberIcon = (vipId?: number | null) => {
  if (typeof vipId === 'number' && vipId >= 0 && vipId <= 10) {
    return vipLevelNumberIconMap[vipId]
  }

  return VipLevel0Icon
}

/**
 * 计算单个进度值百分比，并将结果限制在 0-100 区间内。
 */
const getClampedProgress = (currentValue: number, targetValue: number) => {
  if (!targetValue || targetValue <= 0) {
    return 0
  }

  return Math.min(Math.max((currentValue / targetValue) * 100, 0), 100)
}

/**
 * 根据当前浅色/暗黑主题，返回权益卡片对应的渐变背景。
 */
const resolveBenefitCardBackground = (key: VipBenefitCardKey, currentTheme: 'light' | 'dark') => {
  const backgroundConfig = benefitCardBackgroundMap[key]
  return currentTheme === 'dark'
    ? backgroundConfig.darkBackground
    : backgroundConfig.lightBackground
}

/**
 * 从 VIP 等级配置中读取奖励金额，优先使用 *Money 字段，缺失时回退到旧的 *Amount 字段。
 */
const resolveVipListRewardAmount = (targetConfig: VipListItem | null, key: VipBenefitCardKey) => {
  if (!targetConfig) {
    return 0
  }

  const rewardField = vipListRewardFieldMap[key]
  return targetConfig[rewardField.money] ?? targetConfig[rewardField.amount] ?? 0
}

/**
 * 计算单个 VIP 等级的三项奖励总额。
 */
const getVipBenefitTotalRewards = (targetConfig: VipListItem | null) => {
  return (
    resolveVipListRewardAmount(targetConfig, 'levelUp') +
    resolveVipListRewardAmount(targetConfig, 'weekly') +
    resolveVipListRewardAmount(targetConfig, 'monthly')
  )
}

/**
 * 组装权益对比区单列数据，包含三项奖励及总奖励。
 */
const createBenefitComparisonColumn = (
  t: Translate,
  key: 'current' | 'unlock',
  targetConfig: VipListItem | null,
  fallbackVipId: number
): VipBenefitComparisonColumn => {
  const resolvedVipId = targetConfig?.vipId ?? fallbackVipId

  return {
    key,
    vipId: resolvedVipId,
    title:
      key === 'current'
        ? t('vipPage.benefitsComparison.currentLevel', { vipId: resolvedVipId })
        : t('vipPage.benefitsComparison.unlockLevel', { vipId: resolvedVipId }),
    rows: [
      {
        key: 'levelUp',
        label: t('vipPage.cards.levelUp'),
        amount: formatBalance(resolveVipListRewardAmount(targetConfig, 'levelUp'))
      },
      {
        key: 'weekly',
        label: t('vipPage.cards.weekly'),
        amount: formatBalance(resolveVipListRewardAmount(targetConfig, 'weekly'))
      },
      {
        key: 'monthly',
        label: t('vipPage.cards.monthly'),
        amount: formatBalance(resolveVipListRewardAmount(targetConfig, 'monthly'))
      },
      {
        key: 'totalRewards',
        label: t('vipPage.benefitsComparison.totalRewards'),
        amount: formatBalance(getVipBenefitTotalRewards(targetConfig)),
        emphasized: true
      }
    ]
  }
}

/**
 * 组装单个权益卡片展示数据，包括金额、按钮文案、背景与图片。
 */
const createBenefitCard = (
  t: Translate,
  key: VipBenefitCardKey,
  titleKey: string,
  amount: number | undefined,
  status: VipBenefitCardStatus,
  image: string,
  background: string
) => {
  return {
    key,
    title: t(titleKey),
    amount: formatBalance(amount ?? 0),
    status,
    buttonText: status === 'claim' ? t('referral.claim') : t('personalCenter.upgrade'),
    background,
    image
  }
}

/**
 * 将后端权益状态值映射为前端按钮状态：2 为 Claim，其余默认显示 Upgrade。
 */
const getBenefitCardStatus = (state: number | undefined): VipBenefitCardStatus => {
  if (Number(state) === 2) {
    return 'claim'
  }

  return 'upgrade'
}

/**
 * 组装单个 VIP 进度项的展示数据。
 */
const createProgressItem = (
  key: string,
  label: string,
  currentValue: number,
  targetValue: number
): VipProgressItem => ({
  key,
  label,
  current: formatBalance(currentValue),
  target: formatBalance(targetValue),
  progress: getClampedProgress(currentValue, targetValue)
})

/**
 * 聚合 VIP 页面 H5 / PC 共用的展示数据与业务方法。
 */
export const useVipPageData = (t: Translate, options?: UseVipPageDataOptions) => {
  const userStore = useUserStore()
  const vipStore = useVipStore()
  const themeStore = useThemeStore()
  const { userInfo } = storeToRefs(userStore)
  const { myVipInfo, vipInfo, vipList } = storeToRefs(vipStore)
  const { theme } = storeToRefs(themeStore)

  const avatarUrl = computed(() => resolveProfileAvatarUrl(userInfo.value?.headPortrait))

  const selectedAvatarFrameImage = computed(() => {
    const avatarFrameId = profileCustomizationState.value.avatarFrameId ?? DEFAULT_AVATAR_FRAME_ID
    if (avatarFrameId === DEFAULT_AVATAR_FRAME_ID) return ''
    return avatarFrameImageMap[avatarFrameId as Exclude<AvatarFrameId, 'none'>]
  })

  const vipLevels = computed(() => {
    return [...vipList.value].sort((left, right) => (left.vipId ?? 0) - (right.vipId ?? 0))
  })

  const currentVipLevel = computed(() => myVipInfo.value?.vipId ?? userInfo.value?.vipId ?? 0)

  /**
   * 按传入等级获取对应 VIP 配置；缺失时依次回退到当前等级配置与列表首项。
   */
  const getVipTargetConfigById = (vipId?: number | null) => {
    return (
      vipStore.getVipTargetConfig(vipId ?? currentVipLevel.value) ??
      vipStore.getVipTargetConfig(currentVipLevel.value) ??
      vipLevels.value[0] ??
      null
    )
  }

  const resolvedViewedVipId = computed(() => options?.viewedVipId?.value ?? currentVipLevel.value)

  /**
   * 读取当前正在查看的 VIP 卡片配置，用于权益对比区展示。
   */
  const viewedVipTargetConfig = computed(() => getVipTargetConfigById(viewedVipLevel.value))

  /**
   * 获取当前查看卡片的下一档 VIP 配置；若已是最高等级则返回 null。
   */
  const nextVipTargetConfig = computed(() => {
    if (!vipLevels.value.length) {
      return null
    }

    const currentIndex = vipLevels.value.findIndex(item => item.vipId === viewedVipLevel.value)

    if (currentIndex >= 0) {
      return vipLevels.value[currentIndex + 1] ?? null
    }

    return vipLevels.value.find(item => (item.vipId ?? 0) > viewedVipLevel.value) ?? null
  })

  const viewedVipLevel = computed(() => {
    return (
      getVipTargetConfigById(resolvedViewedVipId.value)?.vipId ?? resolvedViewedVipId.value ?? 0
    )
  })

  /**
   * 根据卡片等级生成顶部 VIP 卡片所需的主题、角标与文案配置。
   */
  const getVipCardThemeByVipId = (vipId?: number | null): VipCardTheme => {
    const resolvedVipId = vipId ?? currentVipLevel.value
    const themeVariant = resolveVipThemeVariant(resolvedVipId)
    const themeConfig = vipCardThemeConfigMap[themeVariant]

    return {
      background: theme.value === 'dark' ? themeConfig.darkBackground : themeConfig.lightBackground,
      accentColor: themeConfig.accentColor,
      progressTextColor: themeConfig.progressTextColor,
      progressTrackColor: themeConfig.progressTrackColor,
      progressFillColor: themeConfig.progressFillColor,
      wordmarkColor: themeConfig.wordmarkColor,
      wordmarkIcon: VipCardWordmarkIcon,
      levelNumberIcon: resolveVipLevelNumberIcon(resolvedVipId),
      rightDecorationIcon: themeConfig.rightDecoration,
      cornerBadgeIcon: resolveVipCardCornerBadgeIcon(currentVipLevel.value, resolvedVipId),
      goalHintKey: resolveVipCardGoalHintKey(currentVipLevel.value, resolvedVipId)
    }
  }

  const viewedVipCardTheme = computed(() => getVipCardThemeByVipId(resolvedViewedVipId.value))

  /**
   * 返回权益对比 Tab 所需的当前等级与下一等级数据；最高等级仅保留当前等级一列。
   */
  const benefitComparisonColumns = computed<VipBenefitComparisonColumn[]>(() => {
    const currentColumn = createBenefitComparisonColumn(
      t,
      'current',
      viewedVipTargetConfig.value,
      viewedVipLevel.value
    )

    if (!nextVipTargetConfig.value) {
      return [currentColumn]
    }

    return [
      currentColumn,
      createBenefitComparisonColumn(
        t,
        'unlock',
        nextVipTargetConfig.value,
        nextVipTargetConfig.value.vipId ?? viewedVipLevel.value
      )
    ]
  })

  /**
   * 标记当前等级是否仍有下一档 VIP，用于控制对比区箭头与双列布局。
   */
  const hasNextVipLevel = computed(() => Boolean(nextVipTargetConfig.value))

  /**
   * 按指定 VIP 等级返回有效投注与充值两项进度数据。
   */
  const getProgressItemsByVipId = (vipId?: number | null): VipProgressItem[] => {
    const targetConfig = getVipTargetConfigById(vipId)

    return [
      createProgressItem(
        'validBet',
        t('personalCenter.validBet'),
        myVipInfo.value?.betAmount ?? 0,
        targetConfig?.betAmountLine ?? 0
      ),
      createProgressItem(
        'deposit',
        t('personalCenter.deposit'),
        myVipInfo.value?.rechargeAmount ?? 0,
        targetConfig?.rechargeAmount ?? 0
      )
    ]
  }

  /**
   * 计算当前卡片总进度，投注与充值各占 50%。
   */
  const getOverallProgressByVipId = (vipId?: number | null) => {
    const [betProgress, rechargeProgress] = getProgressItemsByVipId(vipId)

    return Math.min(
      (betProgress?.progress ?? 0) * 0.5 + (rechargeProgress?.progress ?? 0) * 0.5,
      100
    )
  }

  /**
   * 按指定 VIP 等级返回保级要求卡片数据。
   */
  const getRetentionCardsByVipId = (vipId?: number | null): VipRetentionCard[] => {
    const targetConfig = getVipTargetConfigById(vipId)

    return [
      {
        key: 'minimumDeposit',
        label: t('vipPage.retention.minimumDeposit'),
        amount: formatBalance(targetConfig?.keepAmount ?? 0),
        icon: rule1Icon
      },
      {
        key: 'minimumValidBet',
        label: t('vipPage.retention.minimumValidBet'),
        amount: formatBalance(targetConfig?.betAmountLine ?? 0),
        icon: rule2Icon
      }
    ]
  }

  const progressItems = computed<VipProgressItem[]>(() => {
    return getProgressItemsByVipId(resolvedViewedVipId.value)
  })

  const overallProgress = computed(() => {
    return getOverallProgressByVipId(resolvedViewedVipId.value)
  })

  const benefitCards = computed<VipBenefitCard[]>(() => {
    const benefitInfo = vipInfo.value

    return [
      createBenefitCard(
        t,
        'levelUp',
        'vipPage.cards.levelUp',
        benefitInfo?.upgradedMoney,
        getBenefitCardStatus(benefitInfo?.upgradedState),
        item1Image,
        resolveBenefitCardBackground('levelUp', theme.value)
      ),
      createBenefitCard(
        t,
        'weekly',
        'vipPage.cards.weekly',
        benefitInfo?.weekMoney,
        getBenefitCardStatus(benefitInfo?.weekState),
        item3Image,
        resolveBenefitCardBackground('weekly', theme.value)
      ),
      createBenefitCard(
        t,
        'monthly',
        'vipPage.cards.monthly',
        benefitInfo?.monthMoney,
        getBenefitCardStatus(benefitInfo?.monthState),
        item4Image,
        resolveBenefitCardBackground('monthly', theme.value)
      )
    ]
  })

  const retentionCards = computed<VipRetentionCard[]>(() => {
    return getRetentionCardsByVipId(resolvedViewedVipId.value)
  })

  const rules = computed(() => {
    return Array.from({ length: 9 }, (_, index) => {
      const key = `rule${index + 1}`
      return {
        key,
        title: t(`vipPage.rules.${key}.title`),
        description: t(`vipPage.rules.${key}.description`)
      }
    })
  })

  /**
   * 进入页面后同步本地用户信息，并刷新用户资料与 VIP 数据。
   */
  const initializeVipPage = async () => {
    userStore.syncStoredUserData()
    await Promise.all([userStore.refreshCurrentUserData(), vipStore.refreshVipData()])
  }

  return {
    userInfo,
    avatarUrl,
    selectedAvatarFrameImage,
    vipLevels,
    vipLevel: currentVipLevel,
    currentVipLevel,
    viewedVipLevel,
    viewedVipCardTheme,
    getVipCardThemeByVipId,
    progressItems,
    overallProgress,
    getProgressItemsByVipId,
    getOverallProgressByVipId,
    benefitCards,
    benefitComparisonColumns,
    hasNextVipLevel,
    retentionCards,
    getRetentionCardsByVipId,
    rules,
    initializeVipPage
  }
}

/**
 * 按权益卡片类型调用对应领取接口。
 */
export const claimVipBenefit = (key: VipBenefitCardKey): Promise<CommonResponse> => {
  switch (key) {
    case 'levelUp':
      return Api.vip.upgradedPoints({})
    case 'weekly':
      return Api.vip.weekPoints({})
    case 'monthly':
      return Api.vip.monthPoints({})
  }

  return Promise.reject(new Error('Unsupported VIP benefit key'))
}
