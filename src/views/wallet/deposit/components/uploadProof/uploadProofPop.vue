<template>
  <depositPopShell :modelValue="modelValue" :withMask="true" @overlay-close="handleClose">
    <uploadProofPanel
      v-if="modelValue"
      :order-id="orderId"
      @close="handleClose"
      @confirmUpload="handleConfirmUpload"
    />
  </depositPopShell>
</template>
<script setup lang="ts">
import uploadProofPanel from './uploadProofPanel.vue'
import depositPopShell from '../shared/depositPopShell.vue'
interface Props {
  modelValue: boolean
  orderId?: string | number
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
  confirmUpload: [uploadedFilePath: string]
}>()

// 处理关闭事件
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
// 处理确认上传事件
const handleConfirmUpload = (uploadedFilePath: string) => {
  handleClose()
  emit('confirmUpload', uploadedFilePath)
}
</script>
