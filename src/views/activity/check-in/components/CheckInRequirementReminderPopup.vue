<template>
  <!-- 签到条件提醒遮罩层 -->
  <div
    v-if="props.visible"
    class="fixed inset-0 z-[10010] flex items-center justify-center"
    @click.self="$emit('close')"
  >
    <!-- 签到条件提醒弹窗主体 -->
    <section
      class="relative shrink-0 bg-bg-1"
      :class="panelClass"
      :style="{ height: popupHeight }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="check-in-requirement-title"
    >
      <!-- 签到条件提醒关闭按钮 -->
      <button
        type="button"
        class="absolute z-10 flex items-center justify-center bg-opacity-10"
        :class="closeButtonClass"
        :aria-label="t('checkIn.reminderCloseAriaLabel')"
        @click="$emit('close')"
      >
        <CloseIcon :class="closeIconClass" class="text-text-1" />
      </button>

      <!-- 签到条件提醒内容区 -->
      <div class="absolute flex flex-col" :class="contentClass">
        <!-- 签到条件提醒标题文案组 -->
        <div class="flex flex-col" :class="headerClass">
          <!-- 签到条件提醒标题 -->
          <h2 id="check-in-requirement-title" class="font-[700] text-text-1" :class="titleClass">
            {{ t('checkIn.reminderTitle') }}
          </h2>

          <!-- 签到条件提醒文案 -->
          <p class="font-[400] text-text-2" :class="promptClass">
            {{ promptText }}
          </p>
        </div>

        <!-- 签到条件提醒条件卡片 -->
        <div class="flex flex-col bg-opacity-6" :class="cardClass">
          <!-- 签到条件提醒单行条件 -->
          <div
            v-for="item in visibleItems"
            :key="item.label"
            class="flex items-center justify-between"
            :class="rowClass"
          >
            <span class="font-[400] text-text-1" :class="labelClass">
              {{ t(`checkIn.${item.label}`) }}:
            </span>
            <span class="min-w-0 flex-1 text-right font-[700] text-text-1" :class="valueClass">
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  CheckInPageMode,
  CheckInRequirementReminderItem,
  CheckInRequirementReminderMode
} from '../shared'
import { CHECK_IN_REQUIREMENT_LABEL_DEPOSIT, CHECK_IN_REQUIREMENT_LABEL_VALID_BET } from '../shared'

interface Props {
  visible: boolean
  mode: CheckInRequirementReminderMode
  items: CheckInRequirementReminderItem[]
  pageMode: CheckInPageMode
}

const props = defineProps<Props>()
const { t } = useI18n()

defineEmits<{
  close: []
}>()

// 条件提醒文案 key 映射，由业务 mode 控制。
const PROMPT_TEXT_KEY_MAP: Record<CheckInRequirementReminderMode, string> = {
  all: 'checkIn.reminderPromptAll',
  any: 'checkIn.reminderPromptAny',
  depositOnly: 'checkIn.reminderPromptSingle',
  betOnly: 'checkIn.reminderPromptSingle'
}

// H5 使用 3 倍稿等比缩到 1 倍；PC 按设计稿原值。
const MOBILE_POPUP_HEIGHT_MAP: Record<CheckInRequirementReminderMode, string> = {
  all: '196.33px',
  any: '196.33px',
  depositOnly: '165.33px',
  betOnly: '165.33px'
}

// PC 双条件和单条件的弹窗高度。
const PC_POPUP_HEIGHT_MAP: Record<CheckInRequirementReminderMode, string> = {
  all: '228px',
  any: '228px',
  depositOnly: '192px',
  betOnly: '192px'
}

// 当前模式下的提示文案。
const promptText = computed(() => t(PROMPT_TEXT_KEY_MAP[props.mode]))

// 根据布局模式切换弹窗高度。
const popupHeight = computed(() => {
  return props.pageMode === 'mobile'
    ? MOBILE_POPUP_HEIGHT_MAP[props.mode]
    : PC_POPUP_HEIGHT_MAP[props.mode]
})

// 根据 mode 控制条件行展示，避免为四种状态写重复 DOM。
const visibleItems = computed(() => {
  if (props.mode === 'depositOnly') {
    return props.items.filter(item => item.label === CHECK_IN_REQUIREMENT_LABEL_DEPOSIT)
  }

  if (props.mode === 'betOnly') {
    return props.items.filter(item => item.label === CHECK_IN_REQUIREMENT_LABEL_VALID_BET)
  }

  return props.items
})

// 外层弹窗面板样式。
const panelClass = computed(() => {
  return props.pageMode === 'mobile' ? 'w-[300px] rounded-[14px]' : 'w-[460px] rounded-[24px]'
})

// 关闭按钮样式。
const closeButtonClass = computed(() => {
  return props.pageMode === 'mobile'
    ? 'right-[14px] top-[14px] h-[28px] w-[28px] rounded-[6px]'
    : 'right-[32px] top-[32px] h-[24px] w-[24px] rounded-[4px]'
})

// 关闭图标样式。
const closeIconClass = computed(() => {
  return props.pageMode === 'mobile' ? 'h-[10px] w-[10px]' : 'h-[12px] w-[12px]'
})

// 内容区域样式。
const contentClass = computed(() => {
  return props.pageMode === 'mobile'
    ? 'left-[20px] top-[20px] w-[260px] gap-[30px]'
    : 'left-[32px] top-[32px] w-[396px] gap-[24px]'
})

// 标题文案组间距。
const headerClass = computed(() => {
  return props.pageMode === 'mobile' ? 'gap-[14px]' : 'gap-[16px]'
})

// 标题样式。
const titleClass = computed(() => {
  return props.pageMode === 'mobile'
    ? 'text-[16px] leading-[19.33px]'
    : 'text-[20px] leading-[24px]'
})

// 提示文案样式。
const promptClass = computed(() => {
  return props.pageMode === 'mobile' ? 'text-[14px] leading-[17px]' : 'text-[14px] leading-[20px]'
})

// 条件卡片样式。
const cardClass = computed(() => {
  const gapClass = visibleItems.value.length > 1 ? ' gap-[14px]' : ''

  if (props.pageMode === 'mobile') {
    return `w-[260px] rounded-[8px] py-[14px]${gapClass}`
  }

  return `w-[396px] rounded-[12px] py-[12px]${visibleItems.value.length > 1 ? ' gap-[16px]' : ''}`
})

// 条件行样式。
const rowClass = computed(() => {
  return props.pageMode === 'mobile' ? 'h-[17px] px-[14px]' : 'h-[20px] px-[21px]'
})

// 条件名称样式。
const labelClass = computed(() => {
  return props.pageMode === 'mobile' ? 'text-[14px] leading-[17px]' : 'text-[14px] leading-[20px]'
})

// 条件值样式。
const valueClass = computed(() => {
  return props.pageMode === 'mobile' ? 'text-[14px] leading-[17px]' : 'text-[14px] leading-[17px]'
})
</script>
