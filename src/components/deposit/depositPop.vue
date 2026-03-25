<template>
  <div v-if="modelValue" class="min-h-screen">
    <!-- H5端 -->
    <div v-if="isMobile" class="sm:hidden">
      <depositPanel v-model="activeTab" @close="handleClose" />
    </div>

    <!-- PC端 -->
    <teleport v-if="!isMobile" to="body">
      <transition name="modal-fade">
        <div
          class="fixed inset-0 bg-mask-60-1 flex items-center justify-center z-[999] overflow-hidden"
          @click.self="handleClose"
        >
          <depositPanel v-model="activeTab" @close="handleClose" />
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import depositPanel from './depositPanel.vue'

const isMobile = useIsMobile()

interface Props {
  modelValue: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const handleClose = () => {
  emit('update:modelValue', false)
}

const activeTab = ref<'Crypto' | 'Fiat'>('Crypto')
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
