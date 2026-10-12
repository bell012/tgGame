import { useIsMobile } from '@/composables/useMediaQuery'
import { useCheckInModalStore } from '@/stores/checkInModal'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency } from '@/utils/locale'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { loadActiveCheckInDataList } from './checkInData'
import {
  CHECK_IN_POP_WAY,
  getCheckInLoginPopWay,
  markCheckInAutoPopupShown,
  setOpenedCheckInActivityIds,
  shouldShowCheckInAutoPopup
} from './checkInAutoPopupRules'

// 后端 channel 枚举：3 表示 PC，4 表示 H5。
const CHECK_IN_PC_CHANNEL_ID = '3'
const CHECK_IN_H5_CHANNEL_ID = '4'

// 登录后只在首页按 loginAfterPopWay 自动弹出签到弹窗。
export const useCheckInAutoPopup = () => {
  const route = useRoute()
  const { locale } = useI18n()
  const isMobile = useIsMobile()
  const userStore = useUserStore()
  const checkInModalStore = useCheckInModalStore()
  const { acctInfo, userInfo } = storeToRefs(userStore)
  const isChecking = ref(false)
  const lastCheckedKey = ref('')
  const homeEntryId = ref(0)
  // 每次进入首页只弹一次。停在首页关掉后，同一次停留不再打开。
  const frequentShownEntry = new Map<string, number>()

  // 当前用户是否已经登录，登录后才允许自动查询签到状态。
  const isLoggedIn = computed(() => {
    return Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId)
  })

  // 当前会员 ID，用于按会员分开记录弹出次数。
  const activeMemberId = computed(() => {
    return String(userInfo.value?.memberId || acctInfo.value?.memberId || '').trim()
  })

  const loginToken = computed(() => String(userInfo.value?.tradeToken ?? ''))

  // 当前币种，用于匹配活动 config 中的币种配置。
  const activeCurrency = computed(() => {
    return acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency()
  })

  // 当前访问终端：H5 使用 4，PC 使用 3，对应后端 channel 枚举。
  const activeChannelId = computed(() => {
    return isMobile.value ? CHECK_IN_H5_CHANNEL_ID : CHECK_IN_PC_CHANNEL_ID
  })

  const isHomeRoute = computed(() => {
    const name = String(route.name || '')
    return name === 'Home' || name === 'LocaleHome'
  })

  // /check-in 是开发预览入口，自动弹出逻辑需要跳过该路由。
  const isCheckInPreviewRoute = computed(() => {
    return String(route.name || '').replace(/^Locale/, '') === 'checkIn'
  })

  // 执行签到自动弹出检查：只在首页，并按后台弹出次数过滤。
  const runAutoPopupCheck = async () => {
    userStore.syncStoredUserData()

    if (!isHomeRoute.value) {
      if (checkInModalStore.visible) {
        checkInModalStore.closeModal()
      }
      return
    }

    if (!isLoggedIn.value || isChecking.value || checkInModalStore.visible) {
      return
    }

    if (isCheckInPreviewRoute.value) {
      return
    }

    const requestEntryId = homeEntryId.value
    const checkKey = [
      activeMemberId.value,
      activeCurrency.value,
      locale.value,
      activeChannelId.value,
      requestEntryId
    ].join(':')

    if (!activeMemberId.value || lastCheckedKey.value === checkKey) {
      return
    }

    lastCheckedKey.value = checkKey
    isChecking.value = true

    try {
      const checkInDataQueue = await loadActiveCheckInDataList({
        channelId: activeChannelId.value,
        currencyCode: activeCurrency.value,
        languageCode: locale.value,
        isLoggedIn: true,
        requireAutoPopup: true,
        excludeTodaySigned: true
      })

      if (!isHomeRoute.value || requestEntryId !== homeEntryId.value || !isLoggedIn.value) {
        return
      }

      const eligibleQueue = checkInDataQueue.filter(item => {
        if (!shouldShowCheckInAutoPopup(item.activity, activeMemberId.value, loginToken.value)) {
          return false
        }

        if (getCheckInLoginPopWay(item.activity) !== CHECK_IN_POP_WAY.EACH_HOME_VISIT) {
          return true
        }

        const activityId = String(item.activity.rowId ?? '')
        return frequentShownEntry.get(activityId) !== requestEntryId
      })

      if (eligibleQueue.length === 0) {
        return
      }

      setOpenedCheckInActivityIds(
        eligibleQueue.map(item => Number(item.activity.rowId)).filter(id => id > 0)
      )
      eligibleQueue.forEach(item => {
        markCheckInAutoPopupShown(item.activity, activeMemberId.value, loginToken.value)
        if (getCheckInLoginPopWay(item.activity) === CHECK_IN_POP_WAY.EACH_HOME_VISIT) {
          frequentShownEntry.set(String(item.activity.rowId ?? ''), requestEntryId)
        }
      })
      checkInModalStore.openModal()
    } catch (error) {
      console.error(error)
    } finally {
      isChecking.value = false
    }
  }

  // 进入首页记一次访问；离开首页关掉已经打开的自动弹窗。
  watch(
    isHomeRoute,
    (onHome, wasOnHome) => {
      if (!onHome) {
        if (checkInModalStore.visible) {
          checkInModalStore.closeModal()
        }
        return
      }

      if (!wasOnHome) {
        homeEntryId.value += 1
      }
    },
    { immediate: true }
  )

  watch(
    [
      isLoggedIn,
      activeMemberId,
      activeCurrency,
      () => locale.value,
      activeChannelId,
      isHomeRoute,
      homeEntryId
    ],
    () => {
      void runAutoPopupCheck()
    },
    { immediate: true, flush: 'post' }
  )

  return {
    runAutoPopupCheck
  }
}
