<template>
  <div v-if="modelValue" class="min-h-screen">
    <!-- H5 -->
    <teleport v-if="isMobile" to="body">
      <transition name="drawer-mask">
        <div
          v-show="!isHidden"
          class="fixed inset-0 z-[999]"
          :class="[withMask ? 'bg-mask-60-1' : '', { 'with-zoom': zoom }]"
          @click.self="handleOverlayClick"
        >
          <slot />
          <transition name="drawer-slide"></transition>
        </div>
      </transition>
    </teleport>

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

// 遮罩层淡入淡出动画
.drawer-mask-enter-active,
.drawer-mask-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-mask-enter-from,
.drawer-mask-leave-to {
  opacity: 0;
}

.drawer-mask-enter-to,
.drawer-mask-leave-from {
  opacity: 1;
}

// 抽屉滑动动画 - 从右往左滑入，从左往右滑出
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.drawer-slide-enter-to,
.drawer-slide-leave-from {
  transform: translateX(0);
}
</style>
