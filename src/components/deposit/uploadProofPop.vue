<template>
  <depositPopShell :modelValue="modelValue" :withMask="true" @overlay-close="handleClose">
    <uploadProofPanel @close="handleClose" />
  </depositPopShell>
</template>
<script setup lang="ts">
import uploadProofPanel from './uploadProofPanel.vue'
import depositPopShell from './depositPopShell.vue'
interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
