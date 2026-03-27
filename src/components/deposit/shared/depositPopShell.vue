<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="modelValue"
        v-show="isMobile || !isHidden"
        class="modal-overlay"
        :class="[withMask ? 'bg-mask-60-1' : 'bg-transparent']"
        @click.self="handleOverlayClick"
      >
        <slot />
      </div>
    </transition>
  </teleport>
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
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  z-index: 999;
}

@media (min-width: 640px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active :deep(.modal-container),
.modal-leave-active :deep(.modal-container) {
  transition: transform 0.3s ease;
}

.modal-enter-from :deep(.modal-container),
.modal-leave-to :deep(.modal-container) {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from :deep(.modal-container),
  .modal-leave-to :deep(.modal-container) {
    transform: scale(0.9);
  }
}
</style>
