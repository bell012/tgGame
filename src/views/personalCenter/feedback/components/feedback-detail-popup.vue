<template>
  <transition name="feedback-detail-popup">
    <div v-if="show" class="feedback-detail-popup-mask">
      <div class="feedback-detail-popup-card">
        <FeedbackDetailPage embedded :record-id="recordId" @back="emit('close')" />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import FeedbackDetailPage from '../detail/index.vue'

// 详情弹窗：复用移动端详情页，父组件只管开关和记录 id。
defineProps<{
  show: boolean
  recordId: string
}>()

const emit = defineEmits<{
  close: []
}>()
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
  position: absolute;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 10, 18, 0.72);
}

.feedback-detail-popup-card {
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: inherit;
  background: var(--color-background-level-1);
}
</style>
