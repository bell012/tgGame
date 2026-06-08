import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCheckInModalStore = defineStore('checkInModal', () => {
  const visible = ref(false)

  // 打开全局签到弹窗。
  const openModal = () => {
    visible.value = true
  }

  // 关闭全局签到弹窗。
  const closeModal = () => {
    visible.value = false
  }

  // 直接同步全局签到弹窗显示状态，供 v-model 使用。
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
