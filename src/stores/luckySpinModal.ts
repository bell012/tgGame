import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLuckySpinModalStore = defineStore('luckySpinModal', () => {
  const visible = ref(false)

  const openModal = () => {
    visible.value = true
  }

  const closeModal = () => {
    visible.value = false
  }

  const setVisible = (nextVisible: boolean) => {
    visible.value = nextVisible
  }

  return {
    visible,
    openModal,
    closeModal,
    setVisible
  }
})
