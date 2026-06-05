import { useIsMobile } from '@/composables/useMediaQuery'
import { useCheckInModalStore } from '@/stores/checkInModal'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency } from '@/utils/locale'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { loadActiveCheckInData } from './checkInData'

// 后端 channel 枚举：3 表示 PC，4 表示 H5。
const CHECK_IN_PC_CHANNEL_ID = '3'
const CHECK_IN_H5_CHANNEL_ID = '4'

// 登录后自动判断今天是否需要弹出签到弹窗。
export const useCheckInAutoPopup = () => {
  const route = useRoute()
  const { locale } = useI18n()
  const isMobile = useIsMobile()
  const userStore = useUserStore()
  const checkInModalStore = useCheckInModalStore()
  const { acctInfo, userInfo } = storeToRefs(userStore)
  const isChecking = ref(false)
  const lastCheckedKey = ref('')

  // 当前用户是否已经登录，登录后才允许自动查询签到状态。
  const isLoggedIn = computed(() => {
    return Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId)
  })

  // 当前会员 ID，用于避免同一用户同一环境重复检查。
  const activeMemberId = computed(() => {
    return String(userInfo.value?.memberId || acctInfo.value?.memberId || '').trim()
  })

  // 当前币种，用于匹配活动 config 中的币种配置。
  const activeCurrency = computed(() => {
    return acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency()
  })

  // 当前访问终端：H5 使用 4，PC 使用 3，对应后端 channel 枚举。
  const activeChannelId = computed(() => {
    return isMobile.value ? CHECK_IN_H5_CHANNEL_ID : CHECK_IN_PC_CHANNEL_ID
  })

  // /check-in 是开发预览入口，自动弹出逻辑需要跳过该路由。
  const isCheckInPreviewRoute = computed(() => {
    return String(route.name || '').replace(/^Locale/, '') === 'checkIn'
  })

  // 执行签到自动弹出检查：命中活动且今日未签到时打开全局弹窗。
  const runAutoPopupCheck = async () => {
    userStore.syncStoredUserData()

    if (!isLoggedIn.value || isChecking.value || checkInModalStore.visible) {
      return
    }

    if (isCheckInPreviewRoute.value) {
      return
    }

    const checkKey = [
      activeMemberId.value,
      activeCurrency.value,
      locale.value,
      activeChannelId.value
    ].join(':')

    if (!activeMemberId.value || lastCheckedKey.value === checkKey) {
      return
    }

    lastCheckedKey.value = checkKey
    isChecking.value = true

    try {
      const checkInData = await loadActiveCheckInData({
        channelId: activeChannelId.value,
        currencyCode: activeCurrency.value,
        languageCode: locale.value,
        isLoggedIn: true,
        requireAutoPopup: true
      })

      if (checkInData && !checkInData.status.todayIsSign) {
        checkInModalStore.openModal()
      }
    } catch (error) {
      console.error(error)
    } finally {
      isChecking.value = false
    }
  }

  watch(
    [
      isLoggedIn,
      activeMemberId,
      activeCurrency,
      () => locale.value,
      activeChannelId,
      () => route.fullPath
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
