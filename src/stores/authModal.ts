import { defineStore } from 'pinia'
import { ref } from 'vue'

type AuthModalTab = 'login' | 'register'

export const useAuthModalStore = defineStore('authModal', () => {
  const visible = ref(false)
  const defaultTab = ref<AuthModalTab>('login')

  const openModal = (tab: AuthModalTab = 'login') => {
    defaultTab.value = tab
    visible.value = true
  }

  const openLoginModal = () => {
    openModal('login')
  }

  const openRegisterModal = () => {
    openModal('register')
  }

  const closeModal = () => {
    visible.value = false
  }

  const setVisible = (nextVisible: boolean) => {
    visible.value = nextVisible
  }

  return {
    visible,
    defaultTab,
    openModal,
    openLoginModal,
    openRegisterModal,
    closeModal,
    setVisible
  }
})
