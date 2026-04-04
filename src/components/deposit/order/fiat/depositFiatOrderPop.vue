<template>
  <!-- 订单弹窗壳组件 -->
  <depositPopShell
    :modelValue="modelValue"
    :isHidden="hiddenPop"
    :withMask="true"
    :transitionType="isMobile ? 'drawer-slide' : 'modal'"
    @overlay-close="handleClose"
  >
    <!-- 法币订单面板 -->
    <orderFiatPanel :orderInfo="orderInfo" @close="handleClose" />
  </depositPopShell>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { ref } from 'vue'
import depositPopShell from '../../shared/depositPopShell.vue'
import orderFiatPanel from './orderFiatPanel.vue'
import type { FiatOrderType } from '../orderType'

interface Props {
  modelValue: boolean
  orderInfo: Partial<FiatOrderType>
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
</script>
