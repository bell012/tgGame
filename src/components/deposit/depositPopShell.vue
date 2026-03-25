<template>
  <div v-if="modelValue" class="min-h-screen">
    <!-- H5 -->
    <div v-if="isMobile" v-show="!isHidden" class="sm:hidden">
      <slot />
    </div>

    <!-- PC -->
    <teleport v-if="!isMobile" to="body">
      <transition name="modal-fade">
        <div
          v-show="!isHidden"
          class="fixed inset-0 flex items-center justify-center z-[999] overflow-hidden"
          :class="[withMask ? 'bg-mask-60-1' : '', { 'with-zoom': zoom }]"
          @click.self="handleOverlayClick"
        >
          <slot />
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'

interface Props {
  modelValue: boolean
  isHidden?: boolean
  withMask?: boolean
  zoom?: boolean
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isHidden: false,
  withMask: true,
  zoom: false,
  closeOnOverlayClick: true
})

const emit = defineEmits<{
  'overlay-close': []
}>()

const isMobile = useIsMobile()

const handleOverlayClick = () => {
  if (!props.closeOnOverlayClick) return
  emit('overlay-close')
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

.with-zoom.modal-fade-enter-active :deep(.modal-container) {
  animation: modalZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.with-zoom.modal-fade-leave-active :deep(.modal-container) {
  animation: modalZoomOut 0.3s cubic-bezier(0.7, 0, 0.84, 0);
}

@keyframes modalZoomIn {
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
}

@keyframes modalZoomOut {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.8);
  }
}
</style>
