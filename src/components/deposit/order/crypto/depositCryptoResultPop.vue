<template>
  <!-- 数字币订单结果弹窗壳组件 -->
  <depositPopShell
    :modelValue="modelValue"
    :withMask="true"
    :transitionType="isMobile ? 'drawer-slide' : 'modal'"
    @overlay-close="handleClose"
  >
    <!-- 数字币订单结果面板 -->
    <orderCryptoResultPanel
      :orderInfo="orderInfo"
      :method-icon="methodIcon"
      :order-status="orderStatus"
      @close="handleClose"
    />
  </depositPopShell>
</template>

<script setup lang="ts">
import type { QueryPayOrderByOrderIdResult } from '@/api/interface/wallet'
import { useIsMobile } from '@/composables/useMediaQuery'
import depositPopShell from '../../shared/depositPopShell.vue'
import orderCryptoResultPanel from './orderCryptoResultPanel.vue'

interface Props {
  modelValue: boolean
  orderInfo: Partial<QueryPayOrderByOrderIdResult>
  methodIcon?: string
  orderStatus?: 'Completed' | 'Cancelled'
}

withDefaults(defineProps<Props>(), {
  methodIcon: '',
  orderStatus: 'Completed'
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
}>()

const isMobile = useIsMobile()

// 关闭数字币订单结果弹窗并通知父组件同步状态
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
