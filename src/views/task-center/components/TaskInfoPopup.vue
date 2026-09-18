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
        v-if="props.visible && taskData"
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
          :aria-label="taskData.title"
          class="flex max-h-[637px] w-full min-w-[375px] flex-col overflow-hidden rounded-t-[12px] bg-[#242626] font-['Inter',sans-serif]"
          @click.stop
        >
          <!-- H5 标题栏：375px × 48px。 -->
          <header class="relative h-12 w-full shrink-0">
            <h2
              class="absolute inset-x-12 top-1/2 -translate-y-1/2 truncate text-center text-[16px] font-[700] leading-[19px] text-white"
            >
              {{ taskData.title }}
            </h2>

            <!-- H5 关闭按钮：28px × 28px。 -->
            <button
              type="button"
              :aria-label="t('taskCenter.close')"
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
            <!-- H5 充值或无条件任务的精简进度卡。 -->
            <template v-if="taskData.variant === 'compact'">
              <div class="flex flex-col gap-5">
                <article
                  class="flex w-full flex-col gap-2.5 rounded-lg bg-[#2D3131] p-3.5"
                  :class="taskData.rechargeProgress ? 'min-h-[96px]' : 'h-[72px]'"
                >
                  <div class="flex h-[17px] items-center gap-[3px]">
                    <span class="text-[14px] font-[400] leading-[17px] text-[#B3BEC1]">
                      {{ t('taskCenter.activityProgress') }}
                    </span>
                    <span class="min-w-0 truncate text-[14px] font-[400] leading-[17px] text-white">
                      {{ getDetailCardActionText(taskData.action) }}
                    </span>
                  </div>

                  <!-- 充值任务展示当前充值金额与目标充值金额。 -->
                  <p
                    v-if="taskData.rechargeProgress"
                    class="m-0 truncate text-[13px] font-[400] leading-4 text-[#B3BEC1]"
                  >
                    {{ t('taskCenter.rechargeProgress') }}
                    <span class="text-white">
                      {{
                        `${taskData.rechargeProgress.currentAmount} / ${taskData.rechargeProgress.targetAmount}`
                      }}
                    </span>
                  </p>

                  <div class="flex h-[17px] w-full items-center gap-[11px]">
                    <span
                      class="relative h-2 min-w-0 flex-1 overflow-hidden rounded bg-[rgba(42,238,136,0.15)]"
                    >
                      <i
                        class="absolute inset-y-0 left-0 rounded bg-[#2AEE88]"
                        :style="{ width: `${taskData.progress}%` }"
                      ></i>
                    </span>
                    <span
                      class="shrink-0 text-right text-[14px] font-[400] leading-[17px] text-[#B3BEC1]"
                    >
                      {{ `${taskData.progress}%` }}
                    </span>
                  </div>
                </article>

                <section class="flex w-full flex-col gap-[7px]">
                  <h3 class="m-0 text-[14px] font-[700] leading-[17px] text-white">
                    {{ t('taskCenter.activityDetails') }}
                  </h3>
                  <p
                    class="m-0 whitespace-pre-wrap break-words text-[14px] font-[400] leading-[17px] text-[#B3BEC1]"
                  >
                    {{ taskData.description }}
                  </p>
                </section>
              </div>
            </template>

            <!-- H5 条件型与阶梯型任务的详细进度卡。 -->
            <template v-else>
              <div class="flex flex-col gap-5">
                <article
                  v-for="card in taskData.detailCards"
                  :key="card.id"
                  class="flex min-h-[195px] w-full flex-col gap-5 rounded-lg bg-[#2D3131] p-3.5"
                >
                  <div class="flex h-[17px] items-center gap-[3px]">
                    <span class="text-[14px] font-[400] leading-[17px] text-[#B3BEC1]">
                      {{ t('taskCenter.activityProgress') }}
                    </span>
                    <span class="min-w-0 truncate text-[14px] font-[400] leading-[17px] text-white">
                      {{ getDetailCardActionText(card.action) }}
                    </span>
                  </div>

                  <!-- 阶梯任务每档使用后台返回的 rewardText 展示奖励金额。 -->
                  <p
                    v-if="card.rewardText"
                    class="-mt-2.5 m-0 truncate text-[13px] font-[400] leading-4 text-[#B3BEC1]"
                  >
                    {{ t('taskCenter.reward') }}
                    <span class="text-white">{{ card.rewardText }}</span>
                  </p>

                  <!-- H5 指标区：两列布局，条件数量可由后台动态扩展。 -->
                  <div class="grid grid-cols-2 gap-x-2.5 gap-y-5">
                    <div
                      v-for="(condition, index) in getDetailCardConditions(
                        card.conditions,
                        taskData.reward
                      )"
                      :key="`${condition.code ?? condition.name ?? 'condition'}-${index}`"
                      class="flex min-w-0 flex-col gap-[5px]"
                    >
                      <!-- item块  -->
                      <span class="truncate text-[13px] font-[400] leading-[16px] text-[#B3BEC1]">
                        {{ getTaskConditionLabel(condition) }}
                      </span>
                      <span
                        v-if="isRewardAmountCondition(condition)"
                        class="truncate text-[14px] font-[400] leading-[17px] text-text-1"
                      >
                        {{ formatProgressValue(condition.targetValue) }}
                      </span>
                      <span
                        v-else
                        class="flex min-w-0 items-center whitespace-nowrap text-[14px] font-[400] leading-[17px]"
                      >
                        <span :class="condition.completed ? 'text-theme-primary' : 'text-text-1'">
                          {{ formatCappedConditionCurrentValue(condition) }}
                        </span>
                        <span class="text-text-1">
                          {{ ` / ${formatProgressValue(condition.targetValue)}` }}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div class="flex h-[17px] w-full items-center gap-[11px]">
                    <span
                      class="relative h-2 min-w-0 flex-1 overflow-hidden rounded bg-[rgba(42,238,136,0.15)]"
                    >
                      <i
                        class="absolute inset-y-0 left-0 rounded bg-[#2AEE88]"
                        :style="{ width: `${card.progress}%` }"
                      ></i>
                    </span>
                    <span
                      class="shrink-0 text-right text-[14px] font-[400] leading-[17px] text-[#B3BEC1]"
                    >
                      {{ `${card.progress}%` }}
                    </span>
                  </div>
                </article>

                <section class="flex w-full flex-col gap-[7px]">
                  <h3 class="m-0 text-[14px] font-[700] leading-[17px] text-white">
                    {{ t('taskCenter.activityDetails') }}
                  </h3>
                  <p
                    class="m-0 whitespace-pre-wrap break-words text-[14px] font-[400] leading-[17px] text-[#B3BEC1]"
                  >
                    {{ taskData.description }}
                  </p>
                </section>
              </div>
            </template>

            <!-- H5 底部按钮复用当前外层任务的操作状态。 -->
            <button
              type="button"
              class="mt-[30px] flex h-10 w-full items-center justify-center rounded-lg text-[14px] font-[700] leading-[17px]"
              :class="getActionButtonClass(taskData.action)"
              :disabled="isTaskActionDisabled(taskData.action)"
              @click="handleTaskAction(taskData)"
            >
              <span
                v-if="taskData.action === 'claim' && props.claimLoading"
                class="size-4 animate-spin rounded-full border-2 border-text-4/30 border-t-text-4"
                :aria-label="t('taskCenter.loading')"
              ></span>
              <template v-else>{{ getTaskActionText(taskData.action) }}</template>
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
                  class="m-0 min-w-0 truncate text-[20px] font-[700] capitalize leading-6 text-white"
                >
                  {{ taskData.title }}
                </h2>

                <!-- PC 关闭按钮：24px × 24px。 -->
                <button
                  type="button"
                  :aria-label="t('taskCenter.close')"
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
                <!-- PC 充值或无条件任务的精简进度卡。 -->
                <article
                  v-if="taskData.variant === 'compact'"
                  class="box-border flex w-full flex-col gap-4 rounded-2xl bg-[#2D3131] p-4"
                  :class="taskData.rechargeProgress ? 'min-h-[132px]' : 'min-h-[104px]'"
                >
                  <div class="flex h-5 shrink-0 items-center gap-1">
                    <span class="text-[16px] font-[400] leading-[19px] text-[#B3BEC1]">
                      {{ t('taskCenter.activityProgress') }}
                    </span>
                    <span class="min-w-0 truncate text-[16px] font-[400] leading-[19px] text-white">
                      {{ getDetailCardActionText(taskData.action) }}
                    </span>
                  </div>

                  <p
                    v-if="taskData.rechargeProgress"
                    class="m-0 truncate text-[14px] font-[400] leading-5 text-[#B3BEC1]"
                  >
                    {{ t('taskCenter.rechargeProgress') }}
                    <span class="text-white">
                      {{
                        `${taskData.rechargeProgress.currentAmount} / ${taskData.rechargeProgress.targetAmount}`
                      }}
                    </span>
                  </p>

                  <div class="flex h-5 w-full shrink-0 items-center gap-6">
                    <span
                      class="relative h-3 min-w-0 flex-1 overflow-hidden rounded-lg bg-[rgba(42,238,136,0.15)]"
                    >
                      <i
                        class="absolute -left-px inset-y-0 rounded-lg bg-[#2AEE88]"
                        :style="{ width: `${taskData.progress}%` }"
                      ></i>
                    </span>
                    <span
                      class="w-[44px] shrink-0 text-right text-[14px] font-[400] leading-5 text-[#B3BEC1]"
                    >
                      {{ `${taskData.progress}%` }}
                    </span>
                  </div>
                </article>

                <!-- PC 条件型与阶梯型任务的详细进度卡。 -->
                <template v-else>
                  <article
                    v-for="card in taskData.detailCards"
                    :key="card.id"
                    class="box-border flex min-h-[216px] w-full flex-col gap-5 rounded-2xl bg-[#2D3131] p-4"
                  >
                    <div class="flex h-5 shrink-0 items-center gap-1">
                      <span class="text-[16px] font-[400] leading-[19px] text-[#B3BEC1]">
                        {{ t('taskCenter.activityProgress') }}
                      </span>
                      <span
                        class="min-w-0 truncate text-[16px] font-[400] leading-[19px] text-white"
                      >
                        {{ getDetailCardActionText(card.action) }}
                      </span>
                    </div>

                    <!-- 阶梯任务每档使用后台返回的 rewardText 展示奖励金额。 -->
                    <p
                      v-if="card.rewardText"
                      class="-mt-2.5 m-0 truncate text-[14px] font-[400] leading-5 text-[#B3BEC1]"
                    >
                      {{ t('taskCenter.reward') }}
                      <span class="text-white">{{ card.rewardText }}</span>
                    </p>

                    <!-- PC 指标区：两列布局，条件数量可由后台动态扩展。 -->
                    <div class="grid grid-cols-2 gap-x-5 gap-y-5">
                      <div
                        v-for="(condition, index) in getDetailCardConditions(
                          card.conditions,
                          taskData.reward
                        )"
                        :key="`${condition.code ?? condition.name ?? 'condition'}-${index}`"
                        class="flex min-w-0 flex-col justify-center gap-1"
                      >
                        <span class="truncate text-[16px] font-[400] leading-[19px] text-[#B3BEC1]">
                          {{ getTaskConditionLabel(condition) }}
                        </span>
                        <span
                          v-if="isRewardAmountCondition(condition)"
                          class="truncate text-[16px] font-[400] leading-[19px] text-text-1"
                        >
                          {{ formatProgressValue(condition.targetValue) }}
                        </span>
                        <span
                          v-else
                          class="flex min-w-0 items-center whitespace-nowrap text-[16px] font-[400] leading-[19px]"
                        >
                          <span :class="condition.completed ? 'text-theme-primary' : 'text-text-1'">
                            {{ formatCappedConditionCurrentValue(condition) }}
                          </span>
                          <span class="text-text-1">
                            {{ ` / ${formatProgressValue(condition.targetValue)}` }}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div class="flex h-5 w-full shrink-0 items-center gap-6">
                      <span
                        class="relative h-3 min-w-0 flex-1 overflow-hidden rounded-lg bg-[rgba(42,238,136,0.15)]"
                      >
                        <i
                          class="absolute -left-px inset-y-0 rounded-lg bg-[#2AEE88]"
                          :style="{ width: `${card.progress}%` }"
                        ></i>
                      </span>
                      <span
                        class="w-[44px] shrink-0 text-right text-[14px] font-[400] leading-5 text-[#B3BEC1]"
                      >
                        {{ `${card.progress}%` }}
                      </span>
                    </div>
                  </article>
                </template>

                <section class="flex min-h-[0px] w-full flex-col items-start gap-2">
                  <h3
                    class="m-0 h-[22px] text-[18px] font-[700] capitalize leading-[22px] text-white"
                  >
                    {{ t('taskCenter.activityDetails') }}
                  </h3>
                  <p
                    class="m-0 min-h-[0px] w-full whitespace-pre-wrap break-words text-[16px] font-[400] leading-[25.6px] text-[#B3BEC1]"
                  >
                    {{ taskData.description }}
                  </p>
                </section>
              </div>
            </div>

            <!-- PC 底部按钮复用当前外层任务的操作状态。 -->
            <button
              type="button"
              class="box-border flex h-12 w-full shrink-0 items-center justify-center rounded-lg p-2 text-center text-[14px] font-[700] leading-[17px]"
              :class="getActionButtonClass(taskData.action)"
              :disabled="isTaskActionDisabled(taskData.action)"
              @click="handleTaskAction(taskData)"
            >
              <span
                v-if="taskData.action === 'claim' && props.claimLoading"
                class="size-4 animate-spin rounded-full border-2 border-text-4/30 border-t-text-4"
                :aria-label="t('taskCenter.loading')"
              ></span>
              <template v-else>{{ getTaskActionText(taskData.action) }}</template>
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { TaskConditionProgressItem } from '@/api/interface/task-center'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TaskActionState, TaskInfoPopupData } from '../shared'

interface Props {
  visible: boolean
  mode: 'mobile' | 'pc'
  task: TaskInfoPopupData | null
  claimLoading?: boolean
  claimActionsDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  claimLoading: false,
  claimActionsDisabled: false
})
const { t } = useI18n()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'go-task': [task: TaskInfoPopupData]
  claim: [task: TaskInfoPopupData]
}>()

/** 将当前弹窗任务包装为计算属性，避免弹层关闭后继续访问空数据。 */
const taskData = computed(() => props.task)

/** 根据任务操作状态取得当前语言对应的展示文案。 */
const taskActionText = computed<Record<TaskActionState, string>>(() => ({
  'go-to-task': t('taskCenter.goToTask'),
  claim: t('taskCenter.claimNow'),
  completed: t('taskCenter.completed'),
  'wait-settle': t('taskCenter.waitSettle'),
  expired: t('taskCenter.expired')
}))

/** 任务条件代码与任务中心国际化文案键的固定映射。 */
const taskConditionLabelKeys = {
  betAmount: 'taskCenter.conditionLabels.betAmount',
  winAmount: 'taskCenter.conditionLabels.winAmount',
  lostAmount: 'taskCenter.conditionLabels.lostAmount',
  rewardAmount: 'taskCenter.conditionLabels.rewardAmount'
} as const

/** 根据条件代码获取国际化名称，未知代码保留原代码便于排查后台新增类型。 */
const getTaskConditionLabel = (condition: TaskConditionProgressItem) => {
  const code = String(condition.code ?? '').trim()
  const labelKey = taskConditionLabelKeys[code as keyof typeof taskConditionLabelKeys]

  return labelKey ? t(labelKey) : code
}

/** 在详情条件末尾附加任务卡的奖励金额；该展示项不参与进度计算。 */
const getDetailCardConditions = (
  conditions: TaskConditionProgressItem[],
  reward: string | undefined
) => {
  if (!reward) {
    return conditions
  }

  return [
    ...conditions,
    {
      code: 'rewardAmount',
      targetValue: reward
    }
  ]
}

/** 判断当前详情项是否为仅展示奖励金额的附加条件。 */
const isRewardAmountCondition = (condition: TaskConditionProgressItem) =>
  condition.code === 'rewardAmount'

/** 获取指定任务操作状态的国际化文案。 */
const getTaskActionText = (action: TaskActionState) => taskActionText.value[action]

/** 详细进度卡将未完成任务的操作文案改为进行中的业务状态。 */
const getDetailCardActionText = (action: TaskActionState) =>
  action === 'go-to-task' ? t('taskCenter.inProgress') : getTaskActionText(action)

/** 判断任务操作状态是否需要禁用弹窗底部按钮。 */
const isDisabledAction = (action: TaskActionState) =>
  ['completed', 'wait-settle', 'expired'].includes(action)

/** 已结束任务始终禁用；领取请求期间禁用所有可领取任务，防止重复提交。 */
const isTaskActionDisabled = (action: TaskActionState) =>
  isDisabledAction(action) || (action === 'claim' && props.claimActionsDisabled)

/** 按当前任务操作状态分别上抛跳转或领取事件。 */
const handleTaskAction = (task: TaskInfoPopupData) => {
  if (task.action === 'go-to-task') {
    emit('go-task', task)
    return
  }

  if (task.action === 'claim') {
    emit('claim', task)
  }
}

/** 根据任务操作状态生成与任务卡一致的按钮视觉样式。 */
const getActionButtonClass = (action: TaskActionState) => {
  if (action === 'claim') {
    return 'bg-theme-primary text-text-4'
  }

  if (isDisabledAction(action)) {
    return 'cursor-not-allowed bg-opacity-6 text-text-3'
  }

  return '!border-[0.67px] !border-solid !border-theme-primary bg-transparent text-theme-primary'
}

/** 保留后台条件数值原始精度，缺省时统一展示 0。 */
const formatProgressValue = (value: unknown) => String(value ?? '').trim() || '0'

/** 当前条件值超过目标时显示目标值，避免明细展示超过任务上限。 */
const formatCappedConditionCurrentValue = (condition: TaskConditionProgressItem) => {
  const currentValue = Number(condition.currentValue)
  const targetValue = Number(condition.targetValue)

  if (Number.isFinite(currentValue) && Number.isFinite(targetValue) && currentValue > targetValue) {
    return formatProgressValue(condition.targetValue)
  }

  return formatProgressValue(condition.currentValue)
}

/** 关闭任务说明弹窗。 */
const handleClose = () => {
  emit('update:visible', false)
}
</script>
