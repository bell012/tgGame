<template>
  <teleport to="body">
    <transition name="global-toast-fade">
      <div
        v-if="toastState.visible"
        class="pointer-events-none fixed"
        :class="containerClassName"
        :style="{ zIndex: String(toastState.zIndex) }"
      >
        <div class="flex items-center border border-opacity-10 bg-bg-6" :class="toastClassName">
          <div class="min-w-0 flex-1 break-words mr-3.5" :class="toastMessageName">
            {{ toastState.message }}
          </div>

          <div class="relative size-[16px] shrink-0">
            <svg
              class="h-full w-full"
              style="transform: rotate(-135deg)"
              viewBox="0 0 28 28"
              fill="none"
            >
              <circle
                cx="14"
                cy="14"
                :r="radius"
                stroke="var(--color-opacity-10)"
                stroke-width="3"
              />
              <circle
                cx="14"
                cy="14"
                :r="radius"
                stroke="var(--color-theme-level-1)"
                stroke-linecap="round"
                stroke-width="3"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                :style="progressStyle"
              />
            </svg>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { globalToastState } from '@/utils/toast.ts'

/**
 * 自动识别当前是 PC 还是 H5
 */
const isMobile = useIsMobile()

/**
 * 全局 Toast 的共享状态。
 */
const toastState = globalToastState

/**
 * 圆环进度条的几何参数。
 */
const radius = computed(() => (isMobile.value ? 11 : 12.5))
const circumference = computed(() => 2 * Math.PI * radius.value)
const progressOffset = ref(-circumference.value)

let frameId: number | null = null

/**
 * PC 固定在右上角，H5 固定在顶部居中位置。
 */
const containerClassName = computed(() => {
  return isMobile.value ? 'left-0 right-0 top-[49px] flex justify-center' : 'right-[0px] top-[64px]'
})

const isSingleLineMessage = computed(() => !/[\r\n]/.test(toastState.message))

/**
 * 根据设备类型切换 PC / H5 的内边距和宽度。
 */
const toastClassName = computed(() => {
  if (isMobile.value) {
    return 'w-[347px] px-[14px] py-[16px] rounded-[8px]'
  }

  return isSingleLineMessage.value
    ? 'h-[51px] w-[400px] px-[12px] rounded-[8px]'
    : 'w-[400px] px-[12px] py-[16px] rounded-[8px]'
})

/**
 * 字体
 */
const toastMessageName = computed(() => {
  return isMobile.value ? 'text-sm font-[700] text-text-1' : 'text-base font-[700] text-text-1'
})

/**
 * 让圆环动画时长和 Toast 消失时长保持一致。
 */
const progressStyle = computed(() => ({
  transition: `stroke-dashoffset ${toastState.duration}ms linear`
}))

/**
 * 取消当前动画帧，避免 Toast 连续触发时动画状态错乱。
 */
function cancelProgressAnimation() {
  if (typeof window === 'undefined' || frameId === null) {
    return
  }

  window.cancelAnimationFrame(frameId)
  frameId = null
}

/**
 * 将圆环进度恢复到初始状态，然后重新执行一轮填充动画。
 */
async function restartProgressAnimation() {
  if (typeof window === 'undefined') {
    return
  }

  cancelProgressAnimation()
  progressOffset.value = -circumference.value
  await nextTick()

  frameId = window.requestAnimationFrame(() => {
    progressOffset.value = 0
    frameId = null
  })
}

/**
 * 只要 Toast 显示或被重复触发，就重启动画。
 */
watch(
  [() => toastState.visible, () => toastState.animationKey],
  ([visible]) => {
    if (!visible) {
      cancelProgressAnimation()
      progressOffset.value = -circumference.value
      return
    }

    void restartProgressAnimation()
  },
  { immediate: true }
)

/**
 * 组件卸载前清理动画帧。
 */
onBeforeUnmount(() => {
  cancelProgressAnimation()
})
</script>

<style scoped>
.global-toast-fade-enter-active,
.global-toast-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.global-toast-fade-enter-from,
.global-toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
