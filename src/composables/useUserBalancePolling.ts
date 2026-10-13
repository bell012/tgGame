import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 登录后进入页面时查一次主账户余额。
 * 顶栏随路由切换查一次；个人中心在进入页面时查一次。停在当前页不再重复请求。
 */
export const useUserBalancePolling = () => {
  const route = useRoute()
  const userStore = useUserStore()
  const { acctInfo, userInfo } = storeToRefs(userStore)
  let active = false

  const isLoggedIn = computed(() => Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId))

  const refresh = () => {
    if (!active || !isLoggedIn.value) {
      return
    }

    // 不传 force：同时进入的顶栏和个人中心会复用同一次进行中的查询。
    void userStore.refreshBalance()
  }

  const start = () => {
    if (active) {
      return
    }

    active = true
    refresh()
  }

  const stop = () => {
    active = false
  }

  onMounted(start)
  // KeepAlive 首次进入会先 onMounted 再 onActivated，active 锁避免连查两次。
  onActivated(start)
  onDeactivated(stop)
  onBeforeUnmount(stop)

  watch(
    () => route.path,
    () => {
      refresh()
    }
  )

  watch(isLoggedIn, (loggedIn, wasLoggedIn) => {
    if (loggedIn && wasLoggedIn === false) {
      refresh()
    }
  })
}
