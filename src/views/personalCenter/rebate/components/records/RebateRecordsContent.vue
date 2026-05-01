<template>
  <section class="rebate-records-content">
    <div
      ref="tabsScrollerRef"
      class="flex cursor-grab gap-2 overflow-x-auto pb-1 scrollbar-none active:cursor-grabbing"
      :class="{ 'select-none': isMouseDragging }"
      @mousedown="handleTabsMouseDown"
    >
      <button
        v-for="tab in recordTabs"
        :key="tab.key"
        :ref="element => setTabButtonRef(tab.key, element)"
        type="button"
        class="shrink-0 rounded-full px-4 font-[600] transition-colors duration-200"
        :class="
          activePeriod === tab.key
            ? 'border border-solid border-theme-primary bg-theme-3 text-text-1'
            : 'border border-transparent bg-bg-3 text-text-2 hover:text-text-1'
        "
        @click="handleTabClick(tab.key)"
      >
        <span :class="panelMode ? 'text-[12px] leading-[28px]' : 'text-[14px] leading-[34px]'">
          {{ tab.label }}
        </span>
      </button>
    </div>

    <section
      class="mt-3 overflow-hidden rounded-[14px] bg-bg-2"
      :class="panelMode ? 'shadow-none' : ''"
    >
      <div class="grid grid-cols-2">
        <div class="border-b border-r border-white/5 px-4 py-5 text-center">
          <p :class="defaultNumberClass">{{ formatAmount(activeSummary.validBets) }}</p>
          <p :class="labelClass">{{ t('rebatePage.records.summary.validBets') }}</p>
        </div>

        <button
          type="button"
          class="border-b border-white/5 px-4 py-5 text-center"
          @click="openTurnoverDeductionPopup"
        >
          <p :class="defaultNumberClass">{{ formatAmount(activeSummary.turnoverDeduction) }}</p>
          <div class="mt-1.5 inline-flex items-center justify-center gap-1 text-text-2">
            <span :class="textClass">{{ t('rebatePage.records.summary.turnoverDeduction') }}</span>
            <ExplainIcon class="h-3.5 w-3.5 opacity-80" />
          </div>
        </button>

        <div class="border-r border-white/5 px-4 py-5 text-center">
          <p :class="defaultNumberClass">{{ formatAmount(activeSummary.eligibleTurnover) }}</p>
          <p :class="labelClass">{{ t('rebatePage.records.summary.eligibleTurnover') }}</p>
        </div>

        <button type="button" class="px-4 py-5 text-center" @click="openRebateAmountPopup">
          <p :class="themeNumberClass">
            {{ formatAmount(activeSummary.rebateAmount) }}
          </p>
          <div class="mt-1.5 inline-flex items-center justify-center gap-1 text-text-2">
            <span :class="textClass">{{ t('rebatePage.records.summary.rebateAmount') }}</span>
            <ExplainIcon class="h-3.5 w-3.5 opacity-80" />
          </div>
        </button>
      </div>
    </section>

    <p v-if="isLoading" class="mt-3 text-center text-[12px] text-text-2">
      {{ t('common.loading') }}
    </p>
    <div v-else-if="activeRecords.length === 0" class="mt-8 flex justify-center">
      <section
        class="rebate-records-empty-card flex w-full max-w-[260px] flex-col items-center rounded-[10px]"
      >
        <ThemedEmptyState
          :dark-image="noDataDarkImg"
          :light-image="noDataLightImg"
          :image-alt="t('common.noData')"
          :message="t('common.noData')"
          container-class="mt-0"
          image-class="h-[182px] w-auto object-contain"
          text-class="mt-0 text-center text-[12px] font-[500] leading-[18px] text-text-1"
        />
        <button
          type="button"
          class="mt-5 h-[40px] w-[200px] rounded-[8px] bg-theme-primary text-[14px] font-[700] text-text-4"
          @click="handleStartPlaying"
        >
          {{ t('rebatePage.goBet') }}
        </button>
      </section>
    </div>

    <RebateReminderDialog
      v-model="showTurnoverDeductionPopup"
      :is-mobile="isMobile"
      :message="turnoverDeductionReminderMessage"
    />

    <RebateReminderDialog
      v-model="showRebateAmountPopup"
      :is-mobile="isMobile"
      :message="rebateAmountReminderMessage"
    />
  </section>
</template>

<script setup lang="ts">
import { useIsMobile } from '@/composables/useMediaQuery'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { navigateTo } from '@/utils/router'
import noDataDarkImg from '@/static/img/personalCenter/noData.png'
import noDataLightImg from '@/static/img/explore/default_white.png'
import ExplainIcon from '@/static/svg/vip/explain.svg?component'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRebateRecords, type RebateRecordsPeriodKey } from '../../useRebateRecords'
import RebateReminderDialog from './RebateReminderDialog.vue'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    panelMode?: boolean
  }>(),
  {
    panelMode: false
  }
)

const {
  activePeriod,
  activeRecords,
  activeSummary,
  formatAmount,
  isLoading,
  recordTabs,
  setActivePeriod
} = useRebateRecords()

const isMobile = useIsMobile()
const tabsScrollerRef = ref<HTMLDivElement | null>(null)
const tabButtonRefs = new Map<RebateRecordsPeriodKey, HTMLButtonElement>()
const dragStartX = ref(0)
const dragStartScrollLeft = ref(0)
const hasDraggedTabs = ref(false)
const shouldSuppressTabClick = ref(false)
const isMouseDragging = ref(false)
let suppressTabClickTimer: number | null = null
const showTurnoverDeductionPopup = ref(false)
const showRebateAmountPopup = ref(false)

const setTabButtonRef = (key: RebateRecordsPeriodKey, element: unknown) => {
  const targetElement =
    element instanceof HTMLButtonElement
      ? element
      : element && typeof element === 'object' && '$el' in element
        ? (element.$el as Element | null)
        : null

  if (targetElement instanceof HTMLButtonElement) {
    tabButtonRefs.set(key, targetElement)
    return
  }

  tabButtonRefs.delete(key)
}

const scrollTabIntoView = (key: RebateRecordsPeriodKey) => {
  const targetButton = tabButtonRefs.get(key)
  const scroller = tabsScrollerRef.value

  if (!targetButton || !scroller) {
    return
  }

  const scrollerRect = scroller.getBoundingClientRect()
  const buttonRect = targetButton.getBoundingClientRect()
  const buttonCenterX =
    buttonRect.left - scrollerRect.left + scroller.scrollLeft + buttonRect.width / 2
  const targetScrollLeft = buttonCenterX - scroller.clientWidth / 2
  const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth)

  scroller.scrollTo({
    left: Math.min(Math.max(targetScrollLeft, 0), maxScrollLeft),
    behavior: 'smooth'
  })
}

const handleTabClick = async (key: RebateRecordsPeriodKey) => {
  if (shouldSuppressTabClick.value) {
    return
  }

  setActivePeriod(key)
  await nextTick()
  scrollTabIntoView(key)
}

const clearSuppressTabClickTimer = () => {
  if (suppressTabClickTimer !== null) {
    window.clearTimeout(suppressTabClickTimer)
    suppressTabClickTimer = null
  }
}

const scheduleSuppressTabClickReset = () => {
  clearSuppressTabClickTimer()
  suppressTabClickTimer = window.setTimeout(() => {
    shouldSuppressTabClick.value = false
    suppressTabClickTimer = null
  }, 0)
}

const handleWindowMouseMove = (event: MouseEvent) => {
  const scroller = tabsScrollerRef.value
  if (!scroller || !isMouseDragging.value) {
    return
  }

  const deltaX = event.clientX - dragStartX.value

  if (Math.abs(deltaX) > 4) {
    hasDraggedTabs.value = true
  }

  if (!hasDraggedTabs.value) {
    return
  }

  scroller.scrollLeft = dragStartScrollLeft.value - deltaX
  event.preventDefault()
}

const stopMouseDragging = () => {
  if (!isMouseDragging.value) {
    return
  }

  window.removeEventListener('mousemove', handleWindowMouseMove)

  if (hasDraggedTabs.value) {
    shouldSuppressTabClick.value = true
    scheduleSuppressTabClickReset()
  }

  isMouseDragging.value = false
  dragStartX.value = 0
  dragStartScrollLeft.value = 0
  hasDraggedTabs.value = false
}

const handleTabsMouseDown = (event: MouseEvent) => {
  if (isMobile.value || event.button !== 0) {
    return
  }

  const scroller = tabsScrollerRef.value
  if (!scroller) {
    return
  }

  clearSuppressTabClickTimer()
  shouldSuppressTabClick.value = false
  isMouseDragging.value = true
  dragStartX.value = event.clientX
  dragStartScrollLeft.value = scroller.scrollLeft
  hasDraggedTabs.value = false

  window.addEventListener('mousemove', handleWindowMouseMove)
  window.addEventListener('mouseup', stopMouseDragging, { once: true })
}

const openTurnoverDeductionPopup = () => {
  showTurnoverDeductionPopup.value = true
}

const openRebateAmountPopup = () => {
  showRebateAmountPopup.value = true
}

const handleStartPlaying = () => {
  navigateTo('/')
}

onMounted(() => {
  scrollTabIntoView(activePeriod.value)
})

watch(
  () => activePeriod.value,
  async nextPeriod => {
    await nextTick()
    scrollTabIntoView(nextPeriod)
  }
)

onBeforeUnmount(() => {
  clearSuppressTabClickTimer()
  window.removeEventListener('mousemove', handleWindowMouseMove)
  window.removeEventListener('mouseup', stopMouseDragging)
})

const textClass = computed(() => {
  return props.panelMode ? 'text-[12px] leading-[16px]' : 'text-[13px] leading-[16px]'
})

const labelClass = computed(() => {
  return `mt-1.5 text-text-2 ${textClass.value}`
})

const defaultNumberClass = computed(() => {
  return props.panelMode
    ? 'text-[15px] font-[700] leading-none text-text-1'
    : 'text-[18px] font-[700] leading-none text-text-1'
})

const themeNumberClass = computed(() => {
  return props.panelMode
    ? 'text-[15px] font-[700] leading-none text-theme-primary'
    : 'text-[18px] font-[700] leading-none text-theme-primary'
})

const turnoverDeductionReminderMessage = computed(() =>
  t('rebatePage.records.turnoverDeductionReminder')
)

const rebateAmountReminderMessage = computed(() => t('rebatePage.records.rebateAmountReminder'))
</script>

<style scoped lang="scss">
.rebate-records-empty-card {
  padding: 18px 14px;
  border: 1px solid var(--color-theme-primary);
}
</style>
