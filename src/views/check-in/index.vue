<template>
  <!-- 开发阶段签到页调试容器 -->
  <div
    class="fixed inset-0 z-[60] flex items-start justify-center overflow-hidden sm:items-center sm:bg-mask-60-1 sm:px-4 sm:py-8 sm:backdrop-blur-[2px]"
    :style="
      isMobile
        ? { background: 'var(--color-mask-60-1, #00000099)', backdropFilter: 'blur(5px)' }
        : undefined
    "
  >
    <!-- H5 调试布局 -->
    <CheckInMobileLayout
      v-if="isMobile"
      @close="handleClose"
      @rules="handleRules"
      @action="handleAction"
    />
    <!-- PC 调试布局 -->
    <PcLayout v-else @close="handleClose" @rules="handleRules" @action="handleAction" />
  </div>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import { navigateToName } from '@/utils/router'
import { useRouter } from 'vue-router'
import CheckInMobileLayout from './mobile-layout.vue'
import PcLayout from './pc-layout.vue'

const router = useRouter()
const isMobile = useIsMobile()

// 关闭开发调试页，优先返回上一页，没有历史记录时回到首页。
const handleClose = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  void navigateToName('Home', { replace: true })
}

// 开发阶段规则按钮仅保留占位交互，后续接入真实规则弹窗。
const handleRules = () => {}

// 开发阶段签到按钮仅保留占位交互，后续接入真实签到逻辑。
const handleAction = () => {}
</script>
