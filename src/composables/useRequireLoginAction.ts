import { useAuthModalStore } from '@/stores/authModal'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export const useRequireLoginAction = () => {
  const userStore = useUserStore()
  const authModalStore = useAuthModalStore()
  const { userInfo, acctInfo } = storeToRefs(userStore)

  const isLoggedIn = computed(() => Boolean(userInfo.value?.tradeToken || acctInfo.value?.memberId))

  const requireLogin = () => {
    userStore.syncStoredUserData()
    if (isLoggedIn.value) {
      return true
    }

    authModalStore.openLoginModal()
    return false
  }

  return {
    isLoggedIn,
    requireLogin
  }
}
