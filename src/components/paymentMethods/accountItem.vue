<template>
  <div v-if="option" class="swipe-row relative w-full overflow-hidden rounded-xl bg-bg-1">
    <div
      v-if="enableDelete"
      class="absolute inset-y-0 right-0 flex w-[76px] items-center justify-end"
    >
      <button
        type="button"
        class="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-xl bg-secondary-2 text-sm text-common-100"
        @click.stop="doDelete"
      >
        <DeleteIcon class="h-5 w-5" />
        {{ t('common.delete') }}
      </button>
    </div>

    <div
      ref="contentRef"
      class="swipe-row__content relative z-10 flex w-full items-center justify-between rounded-xl bg-bg-2 p-3.5 text-sm"
      :class="{ 'transition-transform duration-200': !isDragging }"
      :style="{
        transform: enableDelete ? `translate3d(${offsetX}px, 0, 0)` : 'translate3d(0, 0, 0)'
      }"
      @click.stop="handleContentClick"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerEnd"
      @pointercancel="handlePointerEnd"
      @lostpointercapture="handlePointerEnd"
    >
      <div class="flex min-w-0 flex-1 items-center">
        <div class="mr-2.5 h-10 w-10 shrink-0 rounded-full">
          <gameErrImg
            :img="{
              src: option.customRoundIcon,
              maintain: false,
              fit: 'contain'
            }"
            class="h-full w-full"
          />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <p class="truncate text-sm leading-normal text-text-2">
            {{ option.accountName }}
          </p>
          <p class="truncate text-sm leading-normal text-text-1">
            {{ option.accountNo }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="shrink-0 flex h-[21px] w-10 items-center rounded-full p-px transition-colors duration-200"
        :class="option.defaultCard === 1 ? 'bg-theme-primary' : 'bg-opacity-6'"
        @click.stop="setDefault"
      >
        <div
          class="h-[15px] w-[15px] rounded-full bg-common-100 transition-transform duration-200"
          :class="option.defaultCard === 1 ? 'translate-x-[21px]' : 'translate-x-0'"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AccountCardOption } from './shared/usePaymentMethodsService'
import gameErrImg from '@/components/common/gameErrImg.vue'
import DeleteIcon from '@/static/svg/del.svg?component'

const ACTION_WIDTH = 76
const OPEN_THRESHOLD = ACTION_WIDTH / 2
const START_THRESHOLD = 6

const props = withDefaults(
  defineProps<{
    option: AccountCardOption
    isActive: boolean
    enableDelete?: boolean
  }>(),
  {
    isActive: false,
    enableDelete: true
  }
)

const emit = defineEmits<{
  select: [value: AccountCardOption]
  delete: [value: AccountCardOption]
  setDefault: [value: AccountCardOption]
}>()

const { t } = useI18n()
const contentRef = ref<HTMLElement | null>(null)
const offsetX = ref(0)
const activePointerId = ref<number | null>(null)
const startX = ref(0)
const startY = ref(0)
const startOffsetX = ref(0)
const isDragging = ref(false)
const isSwiping = ref(false)
const suppressClick = ref(false)

const clampOffset = (value: number) => Math.max(-ACTION_WIDTH, Math.min(0, value))

const closeSwipe = () => {
  offsetX.value = 0
}

const handleContentClick = () => {
  if (!props.enableDelete) {
    emit('select', props.option)
    return
  }

  if (suppressClick.value) {
    suppressClick.value = false
    return
  }

  if (offsetX.value !== 0) {
    closeSwipe()
    return
  }

  emit('select', props.option)
}

const doDelete = () => {
  closeSwipe()
  emit('delete', props.option)
}

const setDefault = () => {
  emit('setDefault', props.option)
}

const resetPointerState = () => {
  activePointerId.value = null
  isDragging.value = false
  isSwiping.value = false
}

const handlePointerDown = (event: PointerEvent) => {
  if (!props.enableDelete) return
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return
  }

  const currentTarget = event.currentTarget

  if (currentTarget instanceof HTMLElement) {
    currentTarget.setPointerCapture(event.pointerId)
  }

  activePointerId.value = event.pointerId
  startX.value = event.clientX
  startY.value = event.clientY
  startOffsetX.value = offsetX.value
  isDragging.value = true
  isSwiping.value = false
  suppressClick.value = false
}

const handlePointerMove = (event: PointerEvent) => {
  if (!props.enableDelete) return
  if (!isDragging.value || activePointerId.value !== event.pointerId) {
    return
  }

  if (event.pointerType === 'mouse' && event.buttons !== 1) {
    handlePointerEnd(event)
    return
  }

  const deltaX = event.clientX - startX.value
  const deltaY = event.clientY - startY.value

  if (!isSwiping.value) {
    if (Math.abs(deltaX) < START_THRESHOLD) {
      return
    }

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      resetPointerState()
      return
    }

    isSwiping.value = true
    suppressClick.value = true
  }

  event.preventDefault()
  offsetX.value = clampOffset(startOffsetX.value + deltaX)
}

const handlePointerEnd = (event: PointerEvent) => {
  if (!props.enableDelete) return
  if (activePointerId.value !== event.pointerId) {
    return
  }

  const currentTarget = event.currentTarget

  if (currentTarget instanceof HTMLElement && currentTarget.hasPointerCapture(event.pointerId)) {
    currentTarget.releasePointerCapture(event.pointerId)
  }

  if (isSwiping.value) {
    offsetX.value = offsetX.value <= -OPEN_THRESHOLD ? -ACTION_WIDTH : 0
  }

  resetPointerState()
}
</script>

<style scoped lang="scss">
.swipe-row {
  touch-action: pan-y;
}

.swipe-row__content {
  touch-action: pan-y;
  user-select: none;
}
</style>
