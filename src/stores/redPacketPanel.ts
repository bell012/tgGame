import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRedPacketPanelStore = defineStore('redPacketPanel', () => {
  const visible = ref(false)

  // 打开 PC 右下角红包面板。
  const open = () => {
    visible.value = true
  }

  // 关闭 PC 右下角红包面板。
  const close = () => {
    visible.value = false
  }

  return {
    visible,
    open,
    close
  }
})
