<template>
  <teleport to="body">
    <transition name="feedback-detail-popup">
      <div v-if="props.show" class="feedback-detail-popup-mask">
        <div class="feedback-detail-popup-card" :style="popupCardStyle">
          <FeedbackDetailPage embedded :record-id="props.recordId" @back="emit('close')" />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import FeedbackDetailPage from '../detail/index.vue'

// 详情弹窗：复用移动端详情页，父组件只管开关和记录 id。
const props = defineProps<{
  show: boolean
  recordId: string
}>()

const emit = defineEmits<{
  close: []
}>()

const popupCardStyle = ref<Record<string, string>>({})

const getFallbackRect = () => {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const width = Math.min(Math.max(viewportWidth - 40, 0), 480)
  const height = Math.min(viewportHeight * 0.9, 704)
  const left = Math.max((viewportWidth - width) / 2, 0)
  const top = Math.max((viewportHeight - height) / 2, 0)

  return { top, left, width, height }
}

const updatePopupRect = () => {
  const anchor = document.querySelector<HTMLElement>('.leave-feedback-modal-card')
  const fallbackRect = getFallbackRect()
  const targetRect = anchor?.getBoundingClientRect()

  const top = targetRect?.top ?? fallbackRect.top
  const left = targetRect?.left ?? fallbackRect.left
  const width = targetRect?.width ?? fallbackRect.width
  const height = targetRect?.height ?? fallbackRect.height

  popupCardStyle.value = {
    top: `${Math.max(top, 0)}px`,
    left: `${Math.max(left, 0)}px`,
    width: `${Math.max(width, 0)}px`,
    height: `${Math.max(height, 0)}px`
  }
}

watch(
  () => props.show,
  visible => {
    if (!visible) {
      window.removeEventListener('resize', updatePopupRect)
      return
    }

    nextTick(() => {
      updatePopupRect()
      window.addEventListener('resize', updatePopupRect)
    })
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePopupRect)
})
</script>

<style scoped>
.feedback-detail-popup-enter-active,
.feedback-detail-popup-leave-active {
  transition: opacity 0.2s ease;
}

.feedback-detail-popup-enter-from,
.feedback-detail-popup-leave-to {
  opacity: 0;
}

.feedback-detail-popup-enter-active .feedback-detail-popup-card,
.feedback-detail-popup-leave-active .feedback-detail-popup-card {
  transition:
    transform 0.22s ease,
    opacity 0.2s ease;
}

.feedback-detail-popup-enter-from .feedback-detail-popup-card,
.feedback-detail-popup-leave-to .feedback-detail-popup-card {
  transform: translateY(10px) scale(0.96);
  opacity: 0;
}

.feedback-detail-popup-mask {
  position: fixed;
  inset: 0;
  z-index: 100002;
}

.feedback-detail-popup-card {
  position: fixed;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: var(--color-background-level-1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.36);
}
</style>
