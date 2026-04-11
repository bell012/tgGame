import { computed, onActivated, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import type { SubGameItem2 } from '@/api/interface/home.interface'
import type { GameBetTotalResult } from '@/api/interface/user'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency, getFormattedBalance } from '@/utils/locale'
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
import favoriteGameFallbackImage from '@/static/img/personalCenter/myProfile.png'
import Api from '@/api'

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
  const userStore = useUserStore()
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
  const profileRequestDate = ref(new Date())

  const avatarUrl = computed(() => resolveProfileAvatarUrl(userInfo.value?.headPortrait))
  const selectedAvatarFrameImage = computed(() => {
    const avatarFrameId = profileCustomizationState.value.avatarFrameId ?? DEFAULT_AVATAR_FRAME_ID
    if (avatarFrameId === DEFAULT_AVATAR_FRAME_ID) return ''
    return avatarFrameImageMap[avatarFrameId as Exclude<AvatarFrameId, 'none'>]
  })
  const displayName = computed(() => userInfo.value?.nickName || '')
  const profileId = computed(() => userInfo.value?.memberId || acctInfo.value?.memberId || '--')
  const currentCurrency = computed(
    () => acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency()
  )

  /**
   * 从本地缓存中读取游戏目录，用于映射收藏游戏的名称与图片。
   */
  const getStoredGameCatalog = (): SubGameItem2[] => {
    if (typeof window === 'undefined') return []
    try {
      const storedValue = localStorage.getItem('gameData')
      const parsedValue = storedValue ? JSON.parse(storedValue) : []
      if (!Array.isArray(parsedValue)) return []
      const gameCatalog: SubGameItem2[] = []
      parsedValue.forEach(section => {
        if (!Array.isArray(section?.subGame)) return
        section.subGame.forEach((provider: any) => {
          if (Array.isArray(provider?.subGame)) gameCatalog.push(...provider.subGame)
        })
      })
      return gameCatalog
    } catch (error) {
      console.error(error)
      return []
    }
  }

  /**
   * 将游戏图片相对路径转换成完整图片地址。
   */
  const toFavoriteGameImage = (value?: string) =>
    value ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}` : favoriteGameFallbackImage

  /**
   * 获取收藏游戏展示名称，缺失时回退到 itemCode。
   */
  const getFavoriteGameName = (gameItem?: SubGameItem2, fallbackItemCode?: string) =>
    gameItem?.itemName || fallbackItemCode || '--'

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
  const favoriteGameCards = computed<FavoriteGame[]>(() => {
    const gameCatalog = getStoredGameCatalog()
    return favoriteGameList.value.slice(0, 3).map(item => {
      const matchedGame = gameCatalog.find(
        game => game?.platformCode === item.platformCode && game?.itemCode === item.itemCode
      )
      return {
        image: toFavoriteGameImage(matchedGame?.icon2),
        name: getFavoriteGameName(matchedGame, item.itemCode),
        betAmount: getFormattedBalance(Number(item.betAmount ?? 0), currentCurrency.value, 2)
      }
    })
  })
  const joinedOnText = computed(() => {
    const baseDate = new Date(`${profileRequestDate.value.toISOString().slice(0, 10)}T00:00:00`)
    const isZh = String(locale.value).toLowerCase().startsWith('zh')
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
      showToast({ message: t('personalCenter.copySuccess'), position: 'middle', type: 'success' })
    } catch (error) {
      if (fallbackCopyText(value)) {
        showToast({ message: t('personalCenter.copySuccess'), position: 'middle', type: 'success' })
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
    profileRequestDate.value = new Date()
    const res = await Api.user.getGameBetTotal({})
    const result = res.result
    gameBetSummary.value = {
      betAmount: Number(result?.betAmount ?? 0),
      total: Number(result?.total ?? 0),
      win: String(result?.win ?? '0')
    }
    favoriteGameList.value = Array.isArray(result?.list) ? result.list : []
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
    favoriteGameCards,
    joinedOnText,
    copyMemberId,
    goToEditProfile
  }
}
