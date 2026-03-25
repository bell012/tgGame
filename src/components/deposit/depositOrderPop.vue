<template>
  <depositPopShell
    :modelValue="modelValue"
    :isHidden="hiddenPop"
    :withMask="true"
    @overlay-close="handleClose"
  >
    <orderPanel :orderInfo="orderInfo" @close="handleClose" @hidden="handleHidden" />
  </depositPopShell>
</template>

<script setup lang="ts">
import orderPanel from './orderPanel.vue'
import { ref } from 'vue'
import depositPopShell from './depositPopShell.vue'

interface Props {
  modelValue: boolean
  orderInfo: {
    order_no: string
    created_at: string
    amount: number
    method: string
    method_icon: string
    rate: string
    network: string
    address_token: string
  }
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
