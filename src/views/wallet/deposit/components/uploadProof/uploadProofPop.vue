<template>
  <depositPopShell
    :teleport-target="teleportTarget"
    :modelValue="modelValue"
    :withMask="true"
    @overlay-close="handleClose"
  >
    <uploadProofPanel
      ref="panel"
      :teleport-target="teleportTarget"
      v-if="modelValue"
      :order-id="orderId"
      @close="handleClose"
      @confirmUpload="handleConfirmUpload"
    />
  </depositPopShell>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import uploadProofPanel from './uploadProofPanel.vue'
import depositPopShell from '../shared/depositPopShell.vue'
interface Props {
  teleportTarget?: HTMLElement | null
  modelValue: boolean
  orderId?: string | number
}

const props = defineProps<Props>()

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

const panel = ref<InstanceType<typeof uploadProofPanel>>()
const back = () => {
  if (!props.modelValue) return false
  if (!panel.value?.back()) handleClose()
  return true
}
defineExpose({ back })
</script>
