import { useIsMobile } from '@/composables/useMediaQuery'
import { useCheckInModalStore } from '@/stores/checkInModal'
import { useUserStore } from '@/stores/user'
import { getCurrentCurrency, getLocaleFromRouteParam } from '@/utils/locale'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { loadActiveCheckInDataList } from './checkInData'
import {
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
  // 本次弹窗打开时使用的语言。语言从默认英文切到路由语言后，要按新语言重算队列。
  const localeAtOpen = ref('')

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

    // 路由语言还没准备好时，initLanguage 会先落到默认英文。这时筛活动会丢掉只有中文简介的签到。
    if (!getLocaleFromRouteParam(route.params.locale as string | undefined)) {
      return
    }

    if (!isLoggedIn.value || isChecking.value || isCheckInPreviewRoute.value) {
      return
    }

    const localeChangedWhileOpen =
      checkInModalStore.visible && localeAtOpen.value !== String(locale.value)

    if (checkInModalStore.visible && !localeChangedWhileOpen) {
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

      const eligibleQueue = checkInDataQueue.filter(item =>
        shouldShowCheckInAutoPopup(item.activity, activeMemberId.value, loginToken.value)
      )

      if (eligibleQueue.length === 0) {
        if (localeChangedWhileOpen) {
          checkInModalStore.closeModal()
        }
        return
      }

      setOpenedCheckInActivityIds(
        eligibleQueue.map(item => Number(item.activity.rowId)).filter(id => id > 0)
      )
      eligibleQueue.forEach(item => {
        markCheckInAutoPopupShown(item.activity, activeMemberId.value, loginToken.value)
      })
      localeAtOpen.value = String(locale.value)

      // 先关掉再打开，让弹窗用新的活动名单重新加载。同步开关会被合并成一次 true，队列不会刷新。
      if (checkInModalStore.visible) {
        checkInModalStore.closeModal()
        await nextTick()
      }

      if (!isHomeRoute.value || requestEntryId !== homeEntryId.value || !isLoggedIn.value) {
        return
      }

      checkInModalStore.openModal()
    } catch (error) {
      console.error(error)
    } finally {
      isChecking.value = false
    }
  }

  // 从往返缓存恢复页面时，内存里的本次访问记录还在。记一次新的首页访问，高频活动可以再弹。
  const handlePageShow = (event: PageTransitionEvent) => {
    if (!event.persisted || !isHomeRoute.value) {
      return
    }

    lastCheckedKey.value = ''
    homeEntryId.value += 1
  }

  onMounted(() => {
    window.addEventListener('pageshow', handlePageShow)
  })

  onUnmounted(() => {
    window.removeEventListener('pageshow', handlePageShow)
  })

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
      () => route.params.locale,
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
