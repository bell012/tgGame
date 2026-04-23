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
            ? 'border border-theme-primary bg-theme-3 text-text-1'
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
          <p :class="labelClass">Valid Bets</p>
        </div>

        <button
          type="button"
          class="border-b border-white/5 px-4 py-5 text-center"
          @click="openTurnoverDeductionPopup"
        >
          <p :class="defaultNumberClass">{{ formatAmount(activeSummary.turnoverDeduction) }}</p>
          <div class="mt-1.5 inline-flex items-center justify-center gap-1 text-text-2">
            <span :class="textClass">Turnover Deduction</span>
            <InfoIcon class="h-3.5 w-3.5 opacity-80" />
          </div>
        </button>

        <div class="border-r border-white/5 px-4 py-5 text-center">
          <p :class="defaultNumberClass">{{ formatAmount(activeSummary.eligibleTurnover) }}</p>
          <p :class="labelClass">Eligible Turnover</p>
        </div>

        <button type="button" class="px-4 py-5 text-center" @click="openRebateAmountPopup">
          <p :class="themeNumberClass">
            {{ formatAmount(activeSummary.rebateAmount) }}
          </p>
          <div class="mt-1.5 inline-flex items-center justify-center gap-1 text-text-2">
            <span :class="textClass">Rebate Amount</span>
            <InfoIcon class="h-3.5 w-3.5 opacity-80" />
          </div>
        </button>
      </div>
    </section>

    <p v-if="isLoading" class="mt-3 text-center text-[12px] text-text-2">Loading...</p>

    <popShell
      v-model="showTurnoverDeductionPopup"
      transition-type="modal"
      @close="closeTurnoverDeductionPopup"
    >
      <section
        class="bg-bg-2 text-text-1"
        :class="
          isMobile
            ? 'mx-auto w-[328px] rounded-[18px] px-5 pb-5 pt-4 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
            : 'mx-auto w-[346px] rounded-[18px] px-5 pb-5 pt-4 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
        "
      >
        <div class="relative">
          <h3 class="pr-10 text-[18px] font-[700] leading-[22px] text-text-1">Kind Reminder</h3>
          <button
            type="button"
            class="absolute right-0 top-0 flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-bg-3 text-text-1"
            @click="closeTurnoverDeductionPopup"
          >
            <CloseIcon class="h-4 w-4" />
          </button>
        </div>

        <p
          class="mt-5 text-text-2"
          :class="isMobile ? 'text-[14px] leading-[22px]' : 'text-[14px] leading-[22px]'"
        >
          Valid bets from some promotions are not eligible for rebate. Please check the promotion
          page for details.
        </p>

        <div v-if="isMobile" class="mt-6 space-y-3">
          <button
            type="button"
            class="h-[40px] w-full rounded-[8px] bg-theme-primary text-[16px] font-[700] text-text-4"
            @click="closeTurnoverDeductionPopup"
          >
            Confirm
          </button>
          <button
            type="button"
            class="h-[40px] w-full rounded-[8px] bg-bg-3 text-[16px] font-[500] text-text-2"
            @click="closeTurnoverDeductionPopup"
          >
            Cancel
          </button>
        </div>

        <div v-else class="mt-5 grid grid-cols-2 gap-4">
          <button
            type="button"
            class="h-[36px] rounded-[8px] bg-bg-3 text-[14px] font-[600] text-text-2"
            @click="closeTurnoverDeductionPopup"
          >
            Cancel
          </button>
          <button
            type="button"
            class="h-[36px] rounded-[8px] bg-theme-primary text-[14px] font-[700] text-text-4"
            @click="closeTurnoverDeductionPopup"
          >
            Confirm
          </button>
        </div>
      </section>
    </popShell>

    <popShell
      v-model="showRebateAmountPopup"
      transition-type="modal"
      @close="closeRebateAmountPopup"
    >
      <section
        class="bg-bg-2 text-text-1"
        :class="
          isMobile
            ? 'mx-auto w-[328px] rounded-[18px] px-5 pb-5 pt-4 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
            : 'mx-auto w-[346px] rounded-[18px] px-5 pb-5 pt-4 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
        "
      >
        <div class="relative">
          <h3 class="pr-10 text-[18px] font-[700] leading-[22px] text-text-1">Kind Reminder</h3>
          <button
            type="button"
            class="absolute right-0 top-0 flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-bg-3 text-text-1"
            @click="closeRebateAmountPopup"
          >
            <CloseIcon class="h-4 w-4" />
          </button>
        </div>

        <p class="mt-5 text-[14px] leading-[22px] text-text-2">
          The amount must not exceed the daily rebate limit.
        </p>

        <div v-if="isMobile" class="mt-6 space-y-3">
          <button
            type="button"
            class="h-[40px] w-full rounded-[8px] bg-theme-primary text-[16px] font-[700] text-text-4"
            @click="closeRebateAmountPopup"
          >
            Confirm
          </button>
          <button
            type="button"
            class="h-[40px] w-full rounded-[8px] bg-bg-3 text-[16px] font-[500] text-text-2"
            @click="closeRebateAmountPopup"
          >
            Cancel
          </button>
        </div>

        <div v-else class="mt-5 grid grid-cols-2 gap-4">
          <button
            type="button"
            class="h-[36px] rounded-[8px] bg-bg-3 text-[14px] font-[600] text-text-2"
            @click="closeRebateAmountPopup"
          >
            Cancel
          </button>
          <button
            type="button"
            class="h-[36px] rounded-[8px] bg-theme-primary text-[14px] font-[700] text-text-4"
            @click="closeRebateAmountPopup"
          >
            Confirm
          </button>
        </div>
      </section>
    </popShell>
  </section>
</template>

<script setup lang="ts">
import popShell from '@/components/withdraw/popShell.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import CloseIcon from '@/static/svg/close.svg?component'
import InfoIcon from '@/static/svg/info.svg?component'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRebateRecords, type RebateRecordsPeriodKey } from '../useRebateRecords'

const props = withDefaults(
  defineProps<{
    panelMode?: boolean
  }>(),
  {
    panelMode: false
  }
)

const { activePeriod, activeSummary, formatAmount, isLoading, recordTabs, setActivePeriod } =
  useRebateRecords()

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

  const buttonLeft = targetButton.offsetLeft
  const buttonRight = buttonLeft + targetButton.offsetWidth
  const visibleLeft = scroller.scrollLeft
  const visibleRight = visibleLeft + scroller.clientWidth

  if (buttonLeft >= visibleLeft && buttonRight <= visibleRight) {
    return
  }

  targetButton.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
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

const closeTurnoverDeductionPopup = () => {
  showTurnoverDeductionPopup.value = false
}

const openRebateAmountPopup = () => {
  showRebateAmountPopup.value = true
}

const closeRebateAmountPopup = () => {
  showRebateAmountPopup.value = false
}

onMounted(() => {
  scrollTabIntoView(activePeriod.value)
})

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
</script>

<style scoped lang="scss"></style>
