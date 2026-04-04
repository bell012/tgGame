<template>
  <!-- 订单弹窗壳组件 -->
  <depositPopShell
    :modelValue="modelValue"
    :isHidden="hiddenPop"
    :withMask="true"
    :transitionType="isMobile ? 'drawer-slide' : 'modal'"
    @overlay-close="handleClose"
  >
    <!-- 数字币订单面板 -->
    <orderCryptoPanel :orderInfo="orderInfo" @close="handleClose" @hidden="handleHidden" />
  </depositPopShell>
</template>

<script setup lang="ts">
import type { QueryPayOrderByOrderIdResult } from '@/api/interface/wallet'
import { useIsMobile } from '@/composables/useMediaQuery'
import { ref, watch } from 'vue'
import depositPopShell from '../../shared/depositPopShell.vue'
import type { CryptOrderType } from '../orderType'
import orderCryptoPanel from './orderCryptoPanel.vue'

interface Props {
  modelValue: boolean
  orderInfo: Partial<CryptOrderType> | Partial<QueryPayOrderByOrderIdResult>
}

const isMobile = useIsMobile()
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
  hidden: []
}>()

const hiddenPop = ref<boolean>(false)

watch(
  () => props.modelValue,
  isVisible => {
    if (isVisible) {
      hiddenPop.value = false
    }
  }
)

// 关闭弹窗并同步关闭事件
const handleClose = () => {
  hiddenPop.value = false
  emit('update:modelValue', false)
  emit('close')
}

// 切换隐藏状态并通知父组件
const handleHidden = () => {
  emit('hidden')
  hiddenPop.value = true
}
</script>
