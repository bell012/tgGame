import { useIsMobile } from '@/composables/useMediaQuery'
import { useCheckInModalStore } from '@/stores/checkInModal'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency } from '@/utils/locale'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { loadActiveCheckInData } from './checkInData'

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

  const isLoggedIn = computed(() => {
    return Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId)
  })

  const activeMemberId = computed(() => {
    return String(userInfo.value?.memberId || acctInfo.value?.memberId || '').trim()
  })

  const activeCurrency = computed(() => {
    return acctInfo.value?.currency || userInfo.value?.currency || getCurrentCurrency()
  })

  const activeChannelId = computed(() => {
    return isMobile.value ? '4' : '3'
  })

  const isCheckInPreviewRoute = computed(() => {
    return String(route.name || '').replace(/^Locale/, '') === 'checkIn'
  })

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
