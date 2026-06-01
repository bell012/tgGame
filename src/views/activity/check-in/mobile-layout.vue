<template>
  <!-- H5 全局签到弹窗舞台 -->
  <div class="relative h-[100dvh] w-screen overflow-hidden">
    <!-- H5 设计稿缩放容器 -->
    <div class="absolute left-1/2 top-0 h-[812px] w-[375px] origin-top" :style="mobileStageStyle">
      <!-- H5 签到页面内容 -->
      <CheckInPageContent
        mode="mobile"
        :view-data="props.viewData"
        @close="$emit('close')"
        @rules="$emit('rules')"
        @action="$emit('action')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type CSSProperties } from 'vue'
import CheckInPageContent from './components/CheckInPageContent.vue'
import type { CheckInViewData } from './shared'

interface Props {
  viewData: CheckInViewData
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  rules: []
  action: []
}>()

const DESIGN_WIDTH = 375
const DESIGN_HEIGHT = 812

const viewportWidth = ref(DESIGN_WIDTH)
const viewportHeight = ref(DESIGN_HEIGHT)

// 同步 H5 全局弹窗视口尺寸，用于保持设计稿等比缩放。
const syncViewportSize = () => {
  viewportWidth.value = window.innerWidth || DESIGN_WIDTH
  viewportHeight.value = window.innerHeight || DESIGN_HEIGHT
}

const mobileStageStyle = computed<CSSProperties>(() => {
  const scale = Math.min(viewportWidth.value / DESIGN_WIDTH, viewportHeight.value / DESIGN_HEIGHT)

  return {
    transform: `translateX(-50%) scale(${scale})`
  }
})

onMounted(() => {
  syncViewportSize()
  window.addEventListener('resize', syncViewportSize)
  window.addEventListener('orientationchange', syncViewportSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', syncViewportSize)
  window.removeEventListener('orientationchange', syncViewportSize)
})
</script>
