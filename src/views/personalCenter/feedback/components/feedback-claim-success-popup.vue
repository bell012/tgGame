<template>
  <transition name="feedback-claim-popup">
    <div v-if="show" class="feedback-claim-popup-mask" @click.self="emit('close')">
      <div class="feedback-claim-popup-card">
        <img :src="feedbackStarIcon" alt="" class="feedback-claim-popup-star" />
        <img :src="feedbackEllipseIcon" alt="" class="feedback-claim-popup-ellipse" />
        <img :src="feedbackBowIcon" alt="bow" class="feedback-claim-popup-bow" />

        <p class="feedback-claim-popup-amount">{{ claimSuccessAmount }}</p>
        <p class="feedback-claim-popup-title">Claim Successful</p>
        <p class="feedback-claim-popup-description">The bonus has been credited to your wallet.</p>

        <button type="button" class="feedback-claim-popup-confirm" @click="emit('close')">
          OK
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
// 成功弹窗：仅负责展示动画与关闭事件。
defineProps<{
  show: boolean
  claimSuccessAmount: string
  feedbackStarIcon: string
  feedbackEllipseIcon: string
  feedbackBowIcon: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.feedback-claim-popup-enter-active,
.feedback-claim-popup-leave-active {
  transition: opacity 0.24s ease;
}

.feedback-claim-popup-enter-from,
.feedback-claim-popup-leave-to {
  opacity: 0;
}

.feedback-claim-popup-enter-active .feedback-claim-popup-card,
.feedback-claim-popup-leave-active .feedback-claim-popup-card {
  transition:
    transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.2s ease;
}

.feedback-claim-popup-enter-from .feedback-claim-popup-card,
.feedback-claim-popup-leave-to .feedback-claim-popup-card {
  transform: translateY(16px) scale(0.92);
  opacity: 0;
}

.feedback-claim-popup-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: rgba(2, 8, 14, 0.7);
  backdrop-filter: blur(2px);
}

.feedback-claim-popup-card {
  position: relative;
  overflow: visible;
  width: min(100%, 340px);
  border-radius: 30px;
  padding: 74px 22px 26px;
  background: linear-gradient(180deg, #24a35a 0%, #17753f 56%, #0d3e2a 100%);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.42),
    0 1px 0 rgba(255, 255, 255, 0.2) inset,
    0 -34px 42px rgba(4, 22, 14, 0.45) inset;
}

.feedback-claim-popup-star {
  pointer-events: none;
  position: absolute;
  z-index: 3;
  left: calc(50% - 66px);
  top: -20px;
  width: 18px;
  height: 18px;
}

.feedback-claim-popup-ellipse {
  pointer-events: none;
  position: absolute;
  z-index: 3;
  left: calc(50% + 54px);
  top: -14px;
  width: 14px;
  height: 14px;
}

.feedback-claim-popup-bow {
  pointer-events: none;
  position: absolute;
  z-index: 2;
  left: 50%;
  top: -20px;
  width: 166px;
  transform: translateX(-50%);
}

.feedback-claim-popup-amount {
  margin: 0;
  text-align: center;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  color: #fff;
}

.feedback-claim-popup-title {
  margin: 18px 0 0;
  text-align: center;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
  color: #fff;
}

.feedback-claim-popup-description {
  margin: 10px 0 0;
  text-align: center;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.68);
}

.feedback-claim-popup-confirm {
  margin-top: 24px;
  display: flex;
  height: 46px;
  width: 100%;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #2ef58f 0%, #68ee7d 100%);
  color: #00140b;
  font-size: 18px;
  font-weight: 700;
}
</style>
