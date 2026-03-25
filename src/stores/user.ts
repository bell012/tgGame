import { defineStore } from 'pinia'
import { clearNotificationStateCache } from '@/utils/notification-cache'
import { ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)

  function setUser(userData: User) {
    user.value = userData
    isLoggedIn.value = true
  }

  function logout() {
    user.value = null
    isLoggedIn.value = false
    clearNotificationStateCache()
  }

  return {
    user,
    isLoggedIn,
    setUser,
    logout
  }
})
