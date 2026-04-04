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
import { ref } from 'vue'
import depositPopShell from '../../shared/depositPopShell.vue'
import orderCryptoPanel from './orderCryptoPanel.vue'
import type { CryptOrderType } from '../orderType'

interface Props {
  modelValue: boolean
  orderInfo: Partial<CryptOrderType> | Partial<QueryPayOrderByOrderIdResult>
}

const isMobile = useIsMobile()
defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
  hidden: []
}>()

const hiddenPop = ref<boolean>(false)

// 关闭弹窗并同步关闭事件
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 切换隐藏状态并通知父组件
const handleHidden = () => {
  emit('hidden')
  hiddenPop.value = !hiddenPop.value
}
</script>
