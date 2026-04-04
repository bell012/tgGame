<template>
  <depositPopShell
    :modelValue="modelValue"
    :isHidden="hiddenPop"
    :withMask="true"
    :zoom="true"
    :transitionType="isMobile ? 'drawer-slide' : 'modal'"
    @overlay-close="handleClose"
  >
    <depositPanel v-model="activeTab" @close="handleClose" @hidden="handleHidden" />
  </depositPopShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import depositPanel from './depositPanel.vue'
import depositPopShell from '../shared/depositPopShell.vue'

const isMobile = useIsMobile()
interface Props {
  modelValue: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const activeTab = ref<'Crypto' | 'Fiat'>('Crypto')
const hiddenPop = ref<boolean>(false)

// 处理关闭事件
const handleClose = () => {
  emit('update:modelValue', false)
}

// 处理隐藏状态事件
const handleHidden = (status: boolean) => {
  hiddenPop.value = status
}
</script>
