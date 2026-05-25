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
import { ref, watch } from 'vue'
import depositPopShell from '../../shared/depositPopShell.vue'
import type { FiatOrderType } from '../orderType'
import orderFiatPanel from './orderFiatPanel.vue'

interface Props {
  modelValue: boolean
  orderInfo: Partial<FiatOrderType>
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
</script>
