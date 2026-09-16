<template>
  <!-- 任务说明弹窗挂载到 body，避免被任务页滚动容器裁剪。 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <!-- 弹窗遮罩层。 -->
      <div
        v-if="props.visible"
        class="fixed inset-0 z-[10030] flex bg-black/60"
        :class="
          props.mode === 'mobile' ? 'items-end justify-center' : 'items-center justify-center p-4'
        "
        @click.self="handleClose"
      >
        <!-- H5 底部任务说明弹层。 -->
        <section
          v-if="props.mode === 'mobile'"
          role="dialog"
          aria-modal="true"
          :aria-label="popupTitle"
          class="flex max-h-[637px] w-full min-w-[375px] flex-col overflow-hidden rounded-t-[12px] bg-[#242626] font-['Inter',sans-serif]"
          @click.stop
        >
          <!-- H5 标题栏：375px × 48px。 -->
          <header class="relative h-12 w-full shrink-0">
            <h2
              class="absolute inset-x-12 top-1/2 -translate-y-1/2 truncate text-center text-[16px] font-[700] leading-[19px] text-white"
            >
              {{ popupTitle }}
            </h2>

            <!-- H5 关闭按钮：28px × 28px。 -->
            <button
              type="button"
              aria-label="Close"
              class="absolute right-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-white/10"
              @click="handleClose"
            >
              <span class="relative h-2.5 w-2.5">
                <span
                  class="absolute left-1/2 top-1/2 h-[1.4px] w-[11px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white"
                ></span>
                <span
                  class="absolute left-1/2 top-1/2 h-[1.4px] w-[11px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-white"
                ></span>
              </span>
            </button>
          </header>

          <!-- H5 内容区域超出时独立纵向滚动。 -->
          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 pb-[30px] pt-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <!-- H5 精简进度卡静态结构。 -->
            <template v-if="props.variant === 'compact'">
              <div class="flex flex-col gap-5">
                <article
                  class="flex h-[72px] w-full flex-col gap-2.5 rounded-lg bg-[#2D3131] p-3.5"
                >
                  <div class="flex h-[17px] items-center gap-[3px]">
                    <span class="text-[14px] font-[400] leading-[17px] text-[#B3BEC1]">
                      Activity Progress：
                    </span>
                    <span class="text-[14px] font-[400] leading-[17px] text-white"
                      >In Progress</span
                    >
                  </div>

                  <div class="flex h-[17px] w-full items-center gap-[11px]">
                    <span
                      class="relative h-2 min-w-0 flex-1 overflow-hidden rounded bg-[rgba(42,238,136,0.15)]"
                    >
                      <i class="absolute inset-y-0 left-0 w-full rounded bg-[#2AEE88]"></i>
                    </span>
                    <span
                      class="shrink-0 text-right text-[14px] font-[400] leading-[17px] text-[#B3BEC1]"
                    >
                      100%
                    </span>
                  </div>
                </article>

                <section class="flex w-full flex-col gap-[7px]">
                  <h3 class="m-0 text-[14px] font-[700] leading-[17px] text-white">
                    Daily Betting Activity Rules
                  </h3>
                  <p class="m-0 text-[14px] font-[400] leading-[17px] text-[#B3BEC1]">
                    Complete the daily designated betting tasks to receive rewards.
                  </p>
                </section>
              </div>
            </template>

            <!-- H5 详细进度卡静态结构。 -->
            <template v-else>
              <div class="flex flex-col gap-5">
                <article
                  v-for="card in detailedCards"
                  :key="card.id"
                  class="flex h-[195px] w-full flex-col gap-5 rounded-lg bg-[#2D3131] p-3.5"
                >
                  <div class="flex h-[17px] items-center gap-[3px]">
                    <span class="text-[14px] font-[400] leading-[17px] text-[#B3BEC1]">
                      Activity Progress：
                    </span>
                    <span class="text-[14px] font-[400] leading-[17px] text-white"
                      >In Progress</span
                    >
                  </div>

                  <!-- H5 指标区：两列、两行。 -->
                  <div class="grid h-[93px] grid-cols-2 gap-x-2.5 gap-y-5">
                    <div
                      v-for="metric in card.metrics"
                      :key="metric.label"
                      class="flex h-[36px] min-w-0 flex-col gap-[5px]"
                    >
                      <span class="truncate text-[13px] font-[400] leading-[16px] text-[#B3BEC1]">
                        {{ metric.label }}
                      </span>
                      <span
                        class="truncate text-[13px] font-[400] leading-[16px]"
                        :class="metric.highlighted ? 'text-[#2AEE88]' : 'text-white'"
                      >
                        {{ metric.value }}
                      </span>
                    </div>
                  </div>

                  <div class="flex h-[17px] w-full items-center gap-[11px]">
                    <span
                      class="relative h-2 min-w-0 flex-1 overflow-hidden rounded bg-[rgba(42,238,136,0.15)]"
                    >
                      <i class="absolute inset-y-0 left-0 w-[22%] rounded bg-[#2AEE88]"></i>
                    </span>
                    <span
                      class="shrink-0 text-right text-[14px] font-[400] leading-[17px] text-[#B3BEC1]"
                    >
                      {{ card.progress }}%
                    </span>
                  </div>
                </article>

                <section class="flex w-full flex-col gap-[7px]">
                  <h3 class="m-0 text-[14px] font-[700] leading-[17px] text-white">
                    Activity Details
                  </h3>
                  <p class="m-0 text-[14px] font-[400] leading-[17px] text-[#B3BEC1]">
                    This activity is a humanitarian rescue and emergency relief activity.
                  </p>
                </section>
              </div>
            </template>

            <!-- H5 底部静态操作按钮。 -->
            <button
              type="button"
              class="mt-[30px] flex h-10 w-full items-center justify-center rounded-lg bg-[#2AEE88] text-[14px] font-[700] leading-[17px] text-black"
            >
              TEXT
            </button>
          </div>
        </section>

        <!-- PC 居中任务说明弹窗。 -->
        <section
          v-else
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-info-popup-title"
          class="box-border max-h-[704px] w-[464px] overflow-y-auto overscroll-contain rounded-[24px] bg-[#242626] p-8 font-['Inter',sans-serif] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          @click.stop
        >
          <div class="flex w-[400px] flex-col gap-8">
            <div class="flex w-full flex-col gap-6">
              <!-- PC 标题栏：400px × 24px。 -->
              <header class="flex h-6 w-full items-start justify-between">
                <h2
                  id="task-info-popup-title"
                  class="m-0 text-[20px] font-[700] capitalize leading-6 text-white"
                >
                  Relief Bonus
                </h2>

                <!-- PC 关闭按钮：24px × 24px。 -->
                <button
                  type="button"
                  aria-label="Close"
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/10"
                  @click="handleClose"
                >
                  <span class="relative h-3 w-3">
                    <span
                      class="absolute left-1/2 top-1/2 h-[1.4px] w-[13px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white"
                    ></span>
                    <span
                      class="absolute left-1/2 top-1/2 h-[1.4px] w-[13px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-white"
                    ></span>
                  </span>
                </button>
              </header>

              <div class="flex w-full flex-col gap-6">
                <!-- PC 详细进度卡：400px × 216px。 -->
                <article
                  v-for="card in detailedCards"
                  :key="card.id"
                  class="box-border flex h-[216px] w-full flex-col gap-5 rounded-2xl bg-[#2D3131] p-4"
                >
                  <div class="flex h-5 shrink-0 items-center gap-1">
                    <span class="text-[16px] font-[400] leading-[19px] text-[#B3BEC1]">
                      Activity Progress：
                    </span>
                    <span class="text-[16px] font-[400] leading-[19px] text-white"
                      >In Progress</span
                    >
                  </div>

                  <!-- PC 指标区：两列、两行。 -->
                  <div class="grid h-[104px] shrink-0 grid-cols-2 gap-x-5 gap-y-5">
                    <div
                      v-for="metric in card.metrics"
                      :key="metric.label"
                      class="flex h-[42px] min-w-0 flex-col justify-center gap-1"
                    >
                      <span class="truncate text-[16px] font-[400] leading-[19px] text-[#B3BEC1]">
                        {{ metric.label }}
                      </span>
                      <span
                        class="truncate text-[16px] font-[400] leading-[19px]"
                        :class="metric.highlighted ? 'text-[#2AEE88]' : 'text-white'"
                      >
                        {{ metric.value }}
                      </span>
                    </div>
                  </div>

                  <div class="flex h-5 w-full shrink-0 items-center gap-6">
                    <span
                      class="relative h-3 min-w-0 flex-1 overflow-hidden rounded-lg bg-[rgba(42,238,136,0.15)]"
                    >
                      <i class="absolute -left-px inset-y-0 w-[125px] rounded-lg bg-[#2AEE88]"></i>
                    </span>
                    <span
                      class="w-[31px] shrink-0 text-right text-[14px] font-[400] leading-5 text-[#B3BEC1]"
                    >
                      {{ card.progress }}%
                    </span>
                  </div>
                </article>

                <!-- PC 说明区保持 Figma 654px 最小高度。 -->
                <section class="flex min-h-[654px] w-full flex-col items-start gap-2">
                  <h3
                    class="m-0 h-[22px] text-[18px] font-[700] capitalize leading-[22px] text-white"
                  >
                    Activity Details
                  </h3>
                  <p
                    class="m-0 min-h-[624px] w-full text-[16px] font-[400] leading-[25.6px] text-[#B3BEC1]"
                  >
                    This activity is a humanitarian rescue and emergency relief activity.
                  </p>
                </section>
              </div>
            </div>

            <!-- PC 底部静态操作按钮：400px × 48px。 -->
            <button
              type="button"
              class="box-border flex h-12 w-full shrink-0 items-center justify-center rounded-lg border border-[#2AEE88] bg-[#2AEE88] p-2 text-center text-[14px] font-[700] leading-[17px] text-black"
            >
              TEXT
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type TaskInfoPopupVariant = 'compact' | 'detailed'

interface TaskInfoMetric {
  label: string
  value: string
  highlighted: boolean
}

interface TaskInfoCard {
  id: number
  progress: number
  metrics: TaskInfoMetric[]
}

interface Props {
  visible: boolean
  mode: 'mobile' | 'pc'
  variant?: TaskInfoPopupVariant
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'detailed'
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

/** 静态详细进度卡数据，后续由任务详情接口替换。 */
const detailedCards: TaskInfoCard[] = Array.from({ length: 3 }, (_, index) => ({
  id: index + 1,
  progress: 22,
  metrics: [
    { label: 'Bet：', value: '100/1000', highlighted: true },
    { label: 'Profit：', value: '100/1000', highlighted: true },
    { label: 'Loss：', value: '100/1000', highlighted: true },
    { label: 'Bonus Amount：', value: '1000', highlighted: false }
  ]
}))

/** 根据 H5 静态弹窗形态返回对应标题。 */
const popupTitle = computed(() =>
  props.variant === 'compact' ? 'Slots – Bet 5,000' : 'Relief Bonus'
)

/** 关闭任务说明弹窗。 */
const handleClose = () => {
  emit('update:visible', false)
}
</script>
