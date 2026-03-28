<template>
  <depositPopShell
    :modelValue="modelValue"
    :isHidden="hiddenPop"
    :withMask="true"
    :zoom="true"
    @overlay-close="handleClose"
  >
    <depositPanel v-model="activeTab" @close="handleClose" @hidden="handleHidden" />
  </depositPopShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import depositPanel from './depositPanel.vue'
import depositPopShell from '../shared/depositPopShell.vue'

interface Props {
  modelValue: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const activeTab = ref<'Crypto' | 'Fiat'>('Crypto')
const hiddenPop = ref<boolean>(false)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleHidden = (status: boolean) => {
  hiddenPop.value = status
}
</script>
