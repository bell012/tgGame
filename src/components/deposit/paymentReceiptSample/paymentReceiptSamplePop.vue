<template>
  <depositPopShell :modelValue="modelValue" :withMask="false" @overlay-close="handleClose">
    <paymentReceiptSamplePanel @close="handleClose" />
  </depositPopShell>
</template>
<script setup lang="ts">
import paymentReceiptSamplePanel from './paymentReceiptSamplePanel.vue'
import depositPopShell from '../shared/depositPopShell.vue'
interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
}>()

// 处理关闭事件
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
