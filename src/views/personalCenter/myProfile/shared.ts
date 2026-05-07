import { computed, onActivated, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import type { GameBetTotalResult } from '@/api/interface/user'
import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'
import { globalShowToast } from '@/utils/toast.ts'
import {
  formatBalance,
  getCurrentCurrency,
  getCurrencySymbol,
  getFormattedBalance
} from '@/utils/locale'
import { getGameImage, getGameName } from '@/utils/global-dic'
import {
  DEFAULT_AVATAR_FRAME_ID,
  profileCustomizationState,
  resolveProfileAvatarUrl,
  type AvatarFrameId
} from '@/utils/profile-customization'
import { navigateTo } from '@/utils/router'
import TotalWinsIcon from '@/static/svg/personalCenter/icon81.svg?component'
import TotalBetsIcon from '@/static/svg/personalCenter/icon82.svg?component'
import TotalWageredIcon from '@/static/svg/personalCenter/icon83.svg?component'
import border1Image from '@/static/img/personalCenter/border_1.png'
import border2Image from '@/static/img/personalCenter/border_2.png'
import border3Image from '@/static/img/personalCenter/border_3.png'
import border4Image from '@/static/img/personalCenter/border_4.png'
import border5Image from '@/static/img/personalCenter/border_5.png'
import Api from '@/api'
import { formatLinkCode } from '@/utils/toast'

type FavoriteGameSourceItem = GameBetTotalResult['list'][number]

interface FavoriteGame {
  image: string
  name: string
  betAmount: string
}

interface GameBetSummary {
  betAmount: number
  total: number
  win: string
}

const EMPTY_GAME_BET_SUMMARY: GameBetSummary = { betAmount: 0, total: 0, win: '0' }

export const useMyProfile = (options?: { onEdit?: () => void }) => {
  const { t, locale } = useI18n()
  const localeStore = useLocaleStore()
  const userStore = useUserStore()
  const { currentCurrency: selectedCurrency } = storeToRefs(localeStore)
  const { userInfo, acctInfo } = storeToRefs(userStore)

  const avatarFrameImageMap: Record<Exclude<AvatarFrameId, 'none'>, string> = {
    border_1: border1Image,
    border_2: border2Image,
    border_3: border3Image,
    border_4: border4Image,
    border_5: border5Image
  }

  const gameBetSummary = ref<GameBetSummary>(EMPTY_GAME_BET_SUMMARY)
  const favoriteGameList = ref<FavoriteGameSourceItem[]>([])

  const avatarUrl = computed(() => resolveProfileAvatarUrl(userInfo.value?.headPortrait))
  const selectedAvatarFrameImage = computed(() => {
    const avatarFrameId = profileCustomizationState.value.avatarFrameId ?? DEFAULT_AVATAR_FRAME_ID
    if (avatarFrameId === DEFAULT_AVATAR_FRAME_ID) return ''
    return avatarFrameImageMap[avatarFrameId as Exclude<AvatarFrameId, 'none'>]
  })
  const displayName = computed(() => userInfo.value?.nickName || '')
  const profileId = computed(() => formatLinkCode(userInfo.value?.linkCode) || '-')

  /**
   * 优先使用当前已选币种；未选择时回退到账户币种与本地缓存币种。
   */
  const currentCurrency = computed(() => {
    const selectedCurrencyCode = String(selectedCurrency.value ?? '')
      .trim()
      .toUpperCase()

    if (selectedCurrencyCode && selectedCurrencyCode !== 'NONE') {
      return selectedCurrencyCode
    }

    return acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency()
  })

  const profileStats = computed(() => [
    {
      label: t('personalCenter.myProfile.totalWins'),
      value: gameBetSummary.value.win || '0',
      icon: TotalWinsIcon
    },
    {
      label: t('personalCenter.myProfile.totalBets'),
      value: String(gameBetSummary.value.total ?? 0),
      icon: TotalBetsIcon
    },
    {
      label: t('personalCenter.myProfile.totalWagered'),
      value: getFormattedBalance(
        Number(gameBetSummary.value.betAmount ?? 0),
        currentCurrency.value,
        2
      ),
      icon: TotalWageredIcon
    }
  ])

  const topStats = computed(() => profileStats.value.slice(0, 2))
  const bottomStat = computed(() => profileStats.value[2])

  /**
   * 币种符号
   */
  const bottomStatCurrencySymbol = computed(() => getCurrencySymbol(currentCurrency.value).trim())

  /**
   * 总投注金额
   */
  const bottomStatAmountText = computed(() =>
    formatBalance(Number(gameBetSummary.value.betAmount ?? 0), 2)
  )

  const favoriteGameCards = computed<FavoriteGame[]>(() => {
    return favoriteGameList.value.slice(0, 3).map(item => {
      const gameCode = String(
        (item as FavoriteGameSourceItem & { gameCode?: string }).gameCode ?? item.itemCode ?? ''
      ).trim()

      return {
        image: getGameImage(item.platformCode, gameCode),
        name: getGameName('game_code', `${item.platformCode}|${gameCode}`) || '-',
        betAmount: getFormattedBalance(Number(item.betAmount ?? 0), currentCurrency.value, 2)
      }
    })
  })

  //  使用userInfo.userInfo 注册时间显示
  const joinedOnText = computed(() => {
    const createTime = Number(userInfo.value?.createTime ?? 0)
    const baseDate = Number.isFinite(createTime) && createTime > 0 ? new Date(createTime) : null
    const isZh = String(locale.value).toLowerCase().startsWith('zh')

    if (!baseDate || Number.isNaN(baseDate.getTime())) {
      return t('personalCenter.myProfile.joinedOn', { date: '--' })
    }

    const formattedDate = new Intl.DateTimeFormat(isZh ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: isZh ? 'long' : 'short',
      day: 'numeric'
    }).format(baseDate)
    return t('personalCenter.myProfile.joinedOn', { date: formattedDate })
  })

  /**
   * 在 Clipboard API 不可用时，使用 textarea 复制文本。
   */
  const fallbackCopyText = (value: string) => {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', 'true')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  }

  /**
   * 复制会员 ID。
   */
  const copyMemberId = async () => {
    const value = profileId.value
    if (!value || value === '--') return
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value)
      else if (!fallbackCopyText(value)) throw new Error('Copy failed')
      globalShowToast(t('personalCenter.copySuccess'))
    } catch (error) {
      if (fallbackCopyText(value)) {
        globalShowToast(t('personalCenter.copySuccess'))
        return
      }
      console.error(error)
    }
  }

  /**
   * 跳转或切换到编辑资料页面。
   */
  const goToEditProfile = () => {
    if (options?.onEdit) {
      options.onEdit()
      return
    }
    navigateTo('/personal-center/edit-profile')
  }

  /**
   * 初始化我的资料统计与用户信息。
   */
  onMounted(async () => {
    const res = await Api.user.getGameBetTotal({})
    if (res?.code === 'C2') {
      const result = res.result
      gameBetSummary.value = {
        betAmount: Number(result?.betAmount ?? 0),
        total: Number(result?.total ?? 0),
        win: String(result?.win ?? '0')
      }
      favoriteGameList.value = Array.isArray(result?.list) ? result.list : []
    }
    userStore.syncStoredUserData()
    await userStore.refreshCurrentUserData()
  })

  /**
   * 页面重新激活时同步最新用户信息。
   */
  onActivated(() => {
    userStore.syncStoredUserData()
  })

  return {
    userInfo,
    avatarUrl,
    selectedAvatarFrameImage,
    displayName,
    profileId,
    topStats,
    bottomStat,
    bottomStatCurrencySymbol,
    bottomStatAmountText,
    favoriteGameCards,
    joinedOnText,
    copyMemberId,
    goToEditProfile
  }
}
