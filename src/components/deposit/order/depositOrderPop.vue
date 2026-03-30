<template>
  <depositPopShell
    :modelValue="modelValue"
    :isHidden="hiddenPop"
    :withMask="true"
    :transitionType="isMobile ? 'drawer-slide' : 'modal'"
    @overlay-close="handleClose"
  >
    <orderPanel :orderInfo="orderInfo" @close="handleClose" @hidden="handleHidden" />
  </depositPopShell>
</template>

<script setup lang="ts">
import orderPanel from './orderPanel.vue'
import { ref } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import depositPopShell from '../shared/depositPopShell.vue'
import { OrderType } from './orderType'

const isMobile = useIsMobile()
interface Props {
  modelValue: boolean
  orderInfo: OrderType
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  close: []
  hidden: []
}>()

const hiddenPop = ref<boolean>(false)

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleHidden = () => {
  emit('hidden')
  hiddenPop.value = !hiddenPop.value
}
</script>
