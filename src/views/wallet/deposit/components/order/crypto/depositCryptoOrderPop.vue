<template>
  <!-- 订单弹窗壳组件 -->
  <depositPopShell
    :teleport-target="teleportTarget"
    :modelValue="modelValue"
    :isHidden="hiddenPop"
    :withMask="true"
    :transitionType="isMobile ? 'drawer-slide' : 'modal'"
    @overlay-close="handleClose"
  >
    <!-- 数字币订单面板 -->
    <orderCryptoPanel
      ref="orderPanel"
      :embedded="embedded"
      :teleport-target="teleportTarget"
      :orderInfo="orderInfo"
      @close="handleClose"
      @hidden="handleHidden"
    />
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
  embedded?: boolean
  teleportTarget?: HTMLElement | null
  modelValue: boolean
  orderInfo: Partial<CryptOrderType> | Partial<QueryPayOrderByOrderIdResult>
}

const isMobile = useIsMobile()
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
  hidden: [value: boolean]
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

// 同步隐藏状态并通知父组件
const handleHidden = (value: boolean) => {
  emit('hidden', value)
  hiddenPop.value = value
}

const orderPanel = ref<InstanceType<typeof orderCryptoPanel>>()
const back = () => {
  if (!props.modelValue) return false
  if (orderPanel.value?.back()) return true
  handleClose()
  return true
}
defineExpose({ back })
</script>
