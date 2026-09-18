<template>
  <!-- 任务中心领取成功提示独立挂载到 body，避免受页面滚动容器裁剪。 -->
  <Teleport to="body">
    <Transition name="task-claim-success-toast-fade">
      <!-- PC 提示条固定在右上角，H5 固定在顶部居中。 -->
      <div
        v-if="props.visible"
        role="status"
        aria-live="polite"
        class="pointer-events-none fixed z-[10050] box-border border border-opacity-10 bg-bg-6 font-inter"
        :class="
          props.mode === 'pc'
            ? 'right-0 top-16 flex h-[109px] w-[400px] flex-col items-start gap-2.5 rounded-lg px-3 py-4'
            : 'left-1/2 top-[107px] h-[94.333px] w-[347px] -translate-x-1/2 rounded-lg border-[0.667px]'
        "
      >
        <!-- PC 文字内容与倒计时圆环。 -->
        <div
          v-if="props.mode === 'pc'"
          class="flex h-[77px] w-full shrink-0 items-center justify-between"
        >
          <div class="flex h-[77px] w-[348px] shrink-0 flex-col items-start justify-center gap-3">
            <p
              class="m-0 flex h-[19px] w-full shrink-0 items-center text-[16px] font-[700] leading-[19px] text-text-1"
            >
              {{ t('taskCenter.claimSuccessToast.title') }}
            </p>
            <p
              class="m-0 flex h-[17px] w-full shrink-0 items-center text-[14px] font-[400] leading-[17px] text-text-2"
            >
              {{ t('taskCenter.claimSuccessToast.bonusReceived', { amount: props.bonusAmount }) }}
            </p>
            <p
              v-if="props.activityPoints"
              class="m-0 flex h-[17px] w-full shrink-0 items-center text-[14px] font-[400] leading-[17px] text-text-2"
            >
              {{
                t('taskCenter.claimSuccessToast.activityPointsEarned', {
                  points: props.activityPoints
                })
              }}
            </p>
          </div>
          <TaskToastCountdown
            :duration="props.duration"
            :progress-offset="progressOffset"
            :radius="countdownRadius"
          />
        </div>

        <!-- H5 文字内容与倒计时圆环。 -->
        <template v-else>
          <div
            class="absolute left-3.5 top-3.5 flex h-[66.333px] w-[289px] flex-col items-start gap-2.5"
          >
            <p
              class="m-0 flex h-[17px] w-[262px] shrink-0 items-center text-[14px] font-[500] leading-[17px] text-text-1"
            >
              {{ t('taskCenter.claimSuccessToast.title') }}
            </p>
            <p
              class="m-0 flex h-[14.667px] w-[262px] shrink-0 items-center text-[12px] font-[500] leading-[14.667px] text-text-2"
            >
              {{ t('taskCenter.claimSuccessToast.bonusReceived', { amount: props.bonusAmount }) }}
            </p>
            <p
              v-if="props.activityPoints"
              class="m-0 flex h-[14.667px] w-[262px] shrink-0 items-center text-[12px] font-[500] leading-[14.667px] text-text-2"
            >
              {{
                t('taskCenter.claimSuccessToast.activityPointsEarned', {
                  points: props.activityPoints
                })
              }}
            </p>
          </div>
          <div class="absolute right-3.5 top-1/2 -translate-y-1/2">
            <TaskToastCountdown
              :duration="props.duration"
              :progress-offset="progressOffset"
              :radius="countdownRadius"
            />
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const DEFAULT_TASK_CLAIM_SUCCESS_TOAST_DURATION = 3000

interface Props {
  visible: boolean
  mode: 'mobile' | 'pc'
  bonusAmount: string
  activityPoints?: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: DEFAULT_TASK_CLAIM_SUCCESS_TOAST_DURATION
})
const { t } = useI18n()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

/** 根据当前端类型计算与全局 Toast 一致的圆环半径。 */
const countdownRadius = computed(() => (props.mode === 'mobile' ? 11 : 12.5))

/** 计算 SVG 圆环的完整周长。 */
const countdownCircumference = computed(() => 2 * Math.PI * countdownRadius.value)

/** 控制 SVG 倒计时圆环的当前偏移量。 */
const progressOffset = ref(-countdownCircumference.value)

let hideTimer: ReturnType<typeof setTimeout> | null = null
let frameId: number | null = null

/** 清理自动关闭定时器。 */
const clearHideTimer = () => {
  if (!hideTimer) {
    return
  }

  clearTimeout(hideTimer)
  hideTimer = null
}

/** 清理用于触发 SVG 圆环动画的下一帧任务。 */
const cancelProgressAnimation = () => {
  if (typeof window === 'undefined' || frameId === null) {
    return
  }

  window.cancelAnimationFrame(frameId)
  frameId = null
}

/** 重置圆环并开始一轮与 Toast 时长同步的倒计时动画。 */
const restartProgressAnimation = async () => {
  if (typeof window === 'undefined') {
    return
  }

  cancelProgressAnimation()
  progressOffset.value = -countdownCircumference.value
  await nextTick()

  frameId = window.requestAnimationFrame(() => {
    progressOffset.value = 0
    frameId = null
  })
}

/** 关闭任务中心领取成功提示。 */
const handleClose = () => {
  clearHideTimer()
  emit('update:visible', false)
}

/** 根据显示状态与新奖励数据重置自动关闭和倒计时动画。 */
watch(
  [
    () => props.visible,
    () => props.bonusAmount,
    () => props.activityPoints,
    () => props.duration,
    () => props.mode
  ],
  ([visible]) => {
    clearHideTimer()
    cancelProgressAnimation()

    if (!visible) {
      progressOffset.value = -countdownCircumference.value
      return
    }

    void restartProgressAnimation()
    hideTimer = setTimeout(handleClose, props.duration)
  },
  { immediate: true }
)

/** 组件卸载前释放倒计时与动画帧。 */
onBeforeUnmount(() => {
  clearHideTimer()
  cancelProgressAnimation()
})

/** 复用全局 Toast 的 16px SVG 圆环倒计时视觉。 */
const TaskToastCountdown = defineComponent({
  name: 'TaskToastCountdown',
  props: {
    duration: {
      type: Number,
      required: true
    },
    progressOffset: {
      type: Number,
      required: true
    },
    radius: {
      type: Number,
      required: true
    }
  },
  setup(countdownProps) {
    const circumference = 2 * Math.PI * countdownProps.radius

    return () =>
      h(
        'div',
        { class: 'relative size-4 shrink-0' },
        h(
          'svg',
          {
            class: 'h-full w-full',
            style: { transform: 'rotate(-135deg)' },
            viewBox: '0 0 28 28',
            fill: 'none'
          },
          [
            h('circle', {
              cx: '14',
              cy: '14',
              r: countdownProps.radius,
              stroke: 'var(--color-opacity-10)',
              'stroke-width': '3'
            }),
            h('circle', {
              cx: '14',
              cy: '14',
              r: countdownProps.radius,
              stroke: 'var(--color-theme-level-1)',
              'stroke-linecap': 'round',
              'stroke-width': '3',
              'stroke-dasharray': circumference,
              'stroke-dashoffset': countdownProps.progressOffset,
              style: {
                transition: `stroke-dashoffset ${countdownProps.duration}ms linear`
              }
            })
          ]
        )
      )
  }
})
</script>

<style scoped>
.task-claim-success-toast-fade-enter-active,
.task-claim-success-toast-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.task-claim-success-toast-fade-enter-from,
.task-claim-success-toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
