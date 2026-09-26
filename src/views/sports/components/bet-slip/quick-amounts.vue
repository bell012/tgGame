<template>
  <PopShell
    :model-value="props.modelValue"
    transition-type="bottom-sheet"
    @update:model-value="opened => emit('update:modelValue', opened)"
  >
    <section
      ref="panel"
      class="flex max-h-[calc(100dvh-40px)] w-screen flex-col overflow-hidden rounded-t-2xl bg-bg-1 font-inter text-text-1 outline-none"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
      data-testid="sports-quick-amounts-h5"
      @keydown.stop="onKeydown"
    >
      <header class="relative flex h-12 shrink-0 items-center justify-center bg-bg-2 px-12">
        <h2 :id="titleId" class="text-center text-base font-bold">
          {{ t('sports.betSlip.editQuickAmounts') }}
        </h2>
        <button
          type="button"
          class="absolute right-3.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-md border border-solid border-transparent bg-opacity-10 text-text-1"
          :aria-label="t('sports.betSlip.closeQuickAmounts')"
          @click="close"
        >
          <CloseIcon class="h-2.5 w-2.5" aria-hidden="true" />
        </button>
      </header>
      <div
        class="min-h-0 overflow-y-auto overscroll-contain px-3.5 pb-[calc(40px+env(safe-area-inset-bottom))] pt-5"
      >
        <div class="flex items-center justify-between gap-2 leading-[17px]">
          <h3 class="text-sm font-normal leading-[17px]">{{ t('sports.betSlip.customOrder') }}</h3>
          <p class="text-[13px] leading-[17px] text-theme-primary">
            {{ t('sports.betSlip.dragHint') }}
          </p>
        </div>
        <p :id="helpId" class="sr-only">
          {{ t('sports.betSlip.keyboardReorderHint') }}
        </p>
        <ul ref="list" class="mt-2.5 flex flex-col gap-2.5">
          <li
            v-for="(rowId, index) in rowIds"
            :key="rowId"
            class="flex h-[38px] shrink-0 items-center gap-5"
            :class="dragIndex === index ? 'opacity-60' : ''"
            :data-row-index="index"
          >
            <label
              class="group flex h-full min-w-0 flex-1 items-center gap-[6.667px] rounded-md border border-solid bg-input-3 px-2 text-[15px] font-bold text-text-1"
              :class="
                props.error
                  ? 'border-secondary-2'
                  : 'border-opacity-10 focus-within:border-theme-primary focus-within:text-theme-primary'
              "
            >
              <span class="shrink-0">{{ props.currencySymbol }}</span>
              <input
                :value="props.amounts[index]"
                type="text"
                inputmode="decimal"
                maxlength="10"
                autocomplete="off"
                class="h-full min-w-0 flex-1 border-0 border-solid bg-transparent p-0 text-[15px] font-bold text-inherit caret-theme-primary outline-none placeholder:text-xs placeholder:font-normal placeholder:text-text-3"
                :placeholder="t('sports.betSlip.quickAmountPlaceholder')"
                :aria-label="t('sports.betSlip.quickAmountLabel', { count: index + 1 })"
                :aria-invalid="Boolean(props.error)"
                :aria-describedby="props.error ? errorId : undefined"
                :disabled="props.disabled"
                @input="onInput(index, $event)"
              />
            </label>
            <button
              type="button"
              class="flex h-[30px] w-[30px] shrink-0 touch-none select-none items-center justify-center rounded-md border border-solid border-transparent bg-bg-2 text-text-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
              :class="dragIndex === index ? 'cursor-grabbing' : 'cursor-grab'"
              :aria-label="t('sports.betSlip.reorderQuickAmount', { count: index + 1 })"
              :aria-describedby="helpId"
              :data-handle-index="index"
              :disabled="props.disabled"
              @pointerdown="startDrag(index, $event)"
              @pointermove="moveDrag"
              @pointerup="stopDrag"
              @pointercancel="stopDrag"
              @keydown.up.prevent="moveWithKeyboard(index, -1)"
              @keydown.down.prevent="moveWithKeyboard(index, 1)"
              @contextmenu.prevent
            >
              <svg viewBox="0 0 20 20" class="h-[13px] w-[13px]" aria-hidden="true" fill="none">
                <path
                  d="M4 5H16M4 10H16M4 15H16"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </li>
        </ul>
        <p class="sr-only" role="status" aria-live="polite">{{ reorderNotice }}</p>
        <p v-if="props.error" :id="errorId" class="mt-2 text-xs text-secondary-2" role="alert">
          {{ props.error }}
        </p>
        <button
          type="button"
          class="mt-[30px] h-10 w-full rounded-lg border border-solid border-transparent bg-theme-primary text-sm font-bold text-text-4 disabled:opacity-50"
          :disabled="props.disabled"
          @click="emit('save')"
        >
          {{ t('sports.betSlip.save') }}
        </button>
      </div>
    </section>
  </PopShell>
</template>

<script setup lang="ts">
import { nextTick, onScopeDispose, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PopShell from '@/components/withdraw/popShell.vue'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import CloseIcon from '@/static/svg/close.svg'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    amounts: string[]
    currencySymbol: string
    error: string
    disabled?: boolean
  }>(),
  { disabled: false }
)
const { t } = useI18n()
const emit = defineEmits<{
  'update:modelValue': [opened: boolean]
  'update-amount': [index: number, value: string]
  reorder: [fromIndex: number, toIndex: number]
  save: []
}>()
const titleId = useId()
const helpId = useId()
const errorId = useId()
const panel = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const rowIds = ref<string[]>([])
const dragIndex = ref<number | null>(null)
const reorderNotice = ref('')
let previousFocus: HTMLElement | null = null
let holdTimer: ReturnType<typeof setTimeout> | undefined
let pointerHandle: HTMLElement | null = null
let pointerId: number | null = null
let startY = 0

usePageScrollLock(() => props.modelValue)

const close = () => emit('update:modelValue', false)
const onInput = (index: number, event: Event) => {
  if (event.target instanceof HTMLInputElement) emit('update-amount', index, event.target.value)
}

const reorder = (fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex || toIndex < 0 || toIndex >= rowIds.value.length) return
  const next = [...rowIds.value]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  rowIds.value = next
  emit('reorder', fromIndex, toIndex)
  reorderNotice.value = t('sports.betSlip.quickAmountMoved', { count: toIndex + 1 })
}

const stopDrag = () => {
  clearTimeout(holdTimer)
  if (pointerId !== null && pointerHandle?.hasPointerCapture(pointerId))
    pointerHandle.releasePointerCapture(pointerId)
  pointerHandle = null
  pointerId = null
  dragIndex.value = null
}

const startDrag = (index: number, event: PointerEvent) => {
  if (props.disabled || event.button !== 0 || !(event.currentTarget instanceof HTMLElement)) return
  stopDrag()
  pointerHandle = event.currentTarget
  pointerId = event.pointerId
  startY = event.clientY
  pointerHandle.setPointerCapture(event.pointerId)
  // 长按后才开始排序，普通点击不改变顺序。
  holdTimer = setTimeout(() => {
    dragIndex.value = index
  }, 250)
}

const moveDrag = (event: PointerEvent) => {
  if (pointerId !== event.pointerId) return
  if (dragIndex.value === null) {
    if (Math.abs(event.clientY - startY) > 8) stopDrag()
    return
  }
  const container = list.value
  if (!container) return
  const bounds = container.getBoundingClientRect()
  if (event.clientY < bounds.top + 20) container.scrollTop -= 12
  else if (event.clientY > bounds.bottom - 20) container.scrollTop += 12
  const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-row-index]'))
  let closest = dragIndex.value
  let distance = Number.POSITIVE_INFINITY
  rows.forEach((row, index) => {
    const rect = row.getBoundingClientRect()
    const candidate = Math.abs(event.clientY - rect.top - rect.height / 2)
    if (candidate < distance) {
      closest = index
      distance = candidate
    }
  })
  reorder(dragIndex.value, closest)
  dragIndex.value = closest
}

const moveWithKeyboard = async (index: number, direction: number) => {
  if (props.disabled) return
  const destination = index + direction
  if (destination < 0 || destination >= rowIds.value.length) return
  reorder(index, destination)
  await nextTick()
  panel.value?.querySelector<HTMLElement>(`[data-handle-index="${destination}"]`)?.focus()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  } else if (event.key === 'Tab') {
    const focusable = panel.value?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled)'
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === panel.value)
    ) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

watch(
  () => props.modelValue,
  async opened => {
    stopDrag()
    if (opened) {
      rowIds.value = props.amounts.map((_, index) => `${titleId}-${index}`)
      reorderNotice.value = ''
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      if (props.modelValue) panel.value?.focus({ preventScroll: true })
    } else {
      await nextTick()
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  },
  { immediate: true }
)
onScopeDispose(stopDrag)
</script>
