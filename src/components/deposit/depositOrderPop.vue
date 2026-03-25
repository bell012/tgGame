<template>
  <div v-if="modelValue" class="min-h-screen">
    <!-- H5端 -->
    <div v-if="isMobile" class="sm:hidden">
      <orderPanel
        v-show="!hiddenPop"
        :orderInfo="orderInfo"
        @close="handleClose"
        @hidden="handleHidden"
      />
    </div>

    <!-- PC端 -->
    <teleport v-if="!isMobile" to="body">
      <transition name="modal-fade">
        <div
          class="fixed inset-0 flex items-center justify-center z-[999] overflow-hidden"
          @click.self="handleClose"
          :class="{ 'bg-mask-60-1': !hiddenPop }"
        >
          <orderPanel
            v-show="!hiddenPop"
            :orderInfo="orderInfo"
            @close="handleClose"
            @hidden="handleHidden"
          />
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import orderPanel from './orderPanel.vue'
import { ref } from 'vue'

const isMobile = useIsMobile()

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
}>()

const hiddenPop = ref<boolean>(false)

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleHidden = () => {
  hiddenPop.value = !hiddenPop.value
}
</script>

<style scoped lang="scss">
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}
</style>
