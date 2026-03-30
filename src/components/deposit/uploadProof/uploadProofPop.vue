<template>
  <depositPopShell :modelValue="modelValue" :withMask="true" @overlay-close="handleClose">
    <uploadProofPanel v-if="modelValue" @close="handleClose" @confirmUpload="handleConfirmUpload" />
  </depositPopShell>
</template>
<script setup lang="ts">
import uploadProofPanel from './uploadProofPanel.vue'
import depositPopShell from '../shared/depositPopShell.vue'
interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
  confirmUpload: []
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
const handleConfirmUpload = () => {
  handleClose()
  emit('confirmUpload')
}
</script>
