import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { VipListItem } from '@/api/interface/vip'
import { useUserStore } from '@/stores/user'
import { useVipStore } from '@/stores/vip'
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
import item2Image from '@/static/img/personalCenter/item_2.png'
import item3Image from '@/static/img/personalCenter/item_3.png'
import item4Image from '@/static/img/personalCenter/item_4.png'

type Translate = (key: string) => string

export type VipBenefitCardStatus = 'claimed' | 'claim' | 'locked'

export interface VipProgressItem {
  key: string
  label: string
  current: string
  target: string
  progress: number
}

export interface VipBenefitCard {
  key: string
  title: string
  amount: string
  status: VipBenefitCardStatus
  claimed: boolean
  claimable: boolean
  buttonText: string
  background: string
  image: string
}

const benefitCardBackgroundMap: Record<string, string> = {
  levelUp: 'linear-gradient(90deg, #1C3D57 0%, #313333 100%)',
  daily: 'linear-gradient(90deg, #59461D 0%, #313333 87.05%)',
  weekly: 'linear-gradient(90deg, #5F3A25 0%, #313333 88.71%)',
  monthly: 'linear-gradient(90deg, #60292B 0%, #313333 87.88%)'
}

const avatarFrameImageMap: Record<Exclude<AvatarFrameId, 'none'>, string> = {
  border_1: border1Image,
  border_2: border2Image,
  border_3: border3Image,
  border_4: border4Image,
  border_5: border5Image
}

const getClampedProgress = (currentValue: number, targetValue: number) => {
  if (!targetValue || targetValue <= 0) {
    return 0
  }

  return Math.min(Math.max((currentValue / targetValue) * 100, 0), 100)
}

const createBenefitCard = (
  t: Translate,
  key: string,
  titleKey: string,
  amount: number | undefined,
  status: VipBenefitCardStatus,
  image: string
) => {
  const claimed = status === 'claimed'
  const claimable = status === 'claim'

  return {
    key,
    title: t(titleKey),
    amount: formatBalance(amount ?? 0),
    status,
    claimed,
    claimable,
    buttonText: claimed
      ? t('vipPage.claimed')
      : claimable
        ? t('referral.claim')
        : t('vipPage.locked'),
    background: benefitCardBackgroundMap[key],
    image
  }
}

const getLevelUpCardStatus = (
  currentVipLevel: number,
  lastObtainedVipId: number,
  amount: number | undefined
): VipBenefitCardStatus => {
  if (currentVipLevel <= 0 || (amount ?? 0) <= 0) {
    return 'locked'
  }

  if (lastObtainedVipId >= currentVipLevel) {
    return 'claimed'
  }

  return 'claim'
}

const getPeriodicCardStatus = (activeFlag: number | undefined): VipBenefitCardStatus => {
  return Number(activeFlag ?? 0) === 1 ? 'claim' : 'locked'
}

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

export const useVipPageData = (t: Translate) => {
  const userStore = useUserStore()
  const vipStore = useVipStore()
  const { userInfo } = storeToRefs(userStore)
  const { myVipInfo } = storeToRefs(vipStore)

  const avatarUrl = computed(() => resolveProfileAvatarUrl(userInfo.value?.headPortrait))

  const selectedAvatarFrameImage = computed(() => {
    const avatarFrameId = profileCustomizationState.value.avatarFrameId ?? DEFAULT_AVATAR_FRAME_ID
    if (avatarFrameId === DEFAULT_AVATAR_FRAME_ID) return ''
    return avatarFrameImageMap[avatarFrameId as Exclude<AvatarFrameId, 'none'>]
  })

  const vipLevel = computed(() => myVipInfo.value?.vipId || userInfo.value?.vipId || 0)
  const vipTargetConfig = computed(() => vipStore.getVipTargetConfig(vipLevel.value))

  const progressItems = computed<VipProgressItem[]>(() => {
    const targetConfig = vipTargetConfig.value

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
  })

  const overallProgress = computed(() => {
    const [betProgress, rechargeProgress] = progressItems.value

    return Math.min(
      (betProgress?.progress ?? 0) * 0.5 + (rechargeProgress?.progress ?? 0) * 0.5,
      100
    )
  })

  const benefitCards = computed<VipBenefitCard[]>(() => {
    const targetConfig: VipListItem | null = vipTargetConfig.value
    const currentVipLevel = vipLevel.value
    const lastObtainedVipId = myVipInfo.value?.lastObtainedVipId ?? 0

    return [
      createBenefitCard(
        t,
        'levelUp',
        'vipPage.cards.levelUp',
        targetConfig?.upgradedAmount,
        getLevelUpCardStatus(currentVipLevel, lastObtainedVipId, targetConfig?.upgradedAmount),
        item1Image
      ),
      createBenefitCard(
        t,
        'daily',
        'vipPage.cards.daily',
        targetConfig?.dayAmount,
        getPeriodicCardStatus(targetConfig?.dayFlag),
        item2Image
      ),
      createBenefitCard(
        t,
        'weekly',
        'vipPage.cards.weekly',
        targetConfig?.weekAmount,
        getPeriodicCardStatus(targetConfig?.weekFlag),
        item3Image
      ),
      createBenefitCard(
        t,
        'monthly',
        'vipPage.cards.monthly',
        targetConfig?.monthAmount,
        getPeriodicCardStatus(targetConfig?.monthFlag),
        item4Image
      )
    ]
  })

  const rules = computed(() => {
    return Array.from({ length: 10 }, (_, index) => {
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
    vipLevel,
    progressItems,
    overallProgress,
    benefitCards,
    rules,
    initializeVipPage
  }
}
