<template>
  <div class="relative mx-auto flex flex-col items-center" :style="{ width: WHEEL_WIDTH }">
    <div ref="containerRef" class="relative aspect-square w-full">
      <div
        ref="discRef"
        class="absolute z-[25] overflow-hidden rounded-full"
        :style="discInsetStyle"
      >
        <LuckyWheel
          v-if="discSize > 0"
          ref="luckyRef"
          class="lucky-wheel-host block"
          :width="discSize"
          :height="discSize"
          :blocks="blocks"
          :prizes="wheelPrizes"
          :buttons="buttons"
          :default-style="defaultStyle"
          :default-config="defaultConfig"
          @success="handleLuckyReady"
          @end="handleEnd"
        />

        <img
          v-show="showSectorHighlight"
          :src="LUCKY_SPIN_ASSETS.wheel.sectorHighlight"
          alt=""
          class="wheel-sector-highlight pointer-events-none absolute left-1/2 z-[26] select-none"
          :class="{
            'wheel-sector-highlight--active': showSectorHighlight && !sectorHighlightLocked,
            'wheel-sector-highlight--locked': sectorHighlightLocked
          }"
          draggable="false"
        />
      </div>

      <img
        :src="LUCKY_SPIN_ASSETS.wheel.frame"
        alt=""
        class="pointer-events-none absolute inset-0 z-20 h-full w-full select-none object-contain"
        draggable="false"
      />

      <div
        class="pointer-wrap pointer-events-none absolute left-1/2 top-1/2 z-30"
        :class="{ 'pointer-wrap--pressed': isGoPressed }"
        :style="{ width: pointerSize, height: pointerSize }"
      >
        <img
          :src="LUCKY_SPIN_ASSETS.wheel.pointerGo"
          alt=""
          class="h-full w-full select-none object-contain"
          draggable="false"
        />
      </div>

      <button
        type="button"
        class="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-full disabled:opacity-60"
        :style="{ width: goHitSize, height: goHitSize }"
        :disabled="disabled"
        aria-label="GO"
        @click="handleGoClick"
      />
    </div>

    <img
      :src="LUCKY_SPIN_ASSETS.wheel.shadow"
      alt=""
      class="pointer-events-none -mt-[2%] w-[72%] select-none object-contain"
      draggable="false"
    />
  </div>
</template>

<script setup lang="ts">
import type { LuckySpinPrize } from '../../shared/types'
import { useIsMobile } from '@/composables/useMediaQuery'
import { LUCKY_SPIN_ASSETS } from '../../shared/assets'
import { LUCKY_SPIN_TOKENS, TICKET_PC_TOKENS } from '../../shared/design-tokens'
import { LuckyWheel } from '@lucky-canvas/vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  LUCKY_WHEEL_GO_PRESS_MS,
  LUCKY_WHEEL_HIGHLIGHT_DURATION_MS,
  useLuckyWheelConfig
} from './useLuckyWheelConfig'

interface Props {
  prizes: LuckySpinPrize[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  go: []
  spinEnd: []
}>()

type LuckyWheelInstance = InstanceType<typeof LuckyWheel> & {
  play: () => void
  stop: (index?: number) => void
  init: () => void
}

const luckyRef = ref<LuckyWheelInstance | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const discRef = ref<HTMLElement | null>(null)
const discSize = ref(0)
const isGoPressed = ref(false)
const showSectorHighlight = ref(false)
const sectorHighlightLocked = ref(false)

const isMobile = useIsMobile()

const WHEEL_WIDTH = computed(() => {
  if (!isMobile.value) {
    return `${TICKET_PC_TOKENS.wheelSizePc}px`
  }

  const sideMargin = LUCKY_SPIN_TOKENS.wheelSideMargin * 2
  return `calc(100vw - ${sideMargin}px)`
})
const pointerSize = LUCKY_SPIN_TOKENS.wheelPointerSize
const goHitSize = '23%'

const discInsetStyle = computed(() => ({
  inset: LUCKY_SPIN_TOKENS.wheelDiscInset
}))

const { blocks, wheelPrizes, defaultConfig, defaultStyle, buttons } = useLuckyWheelConfig(
  () => props.prizes
)

const updateDiscSize = () => {
  if (!discRef.value) return
  const { width } = discRef.value.getBoundingClientRect()
  const next = Math.round(width)
  if (next > 0 && next !== discSize.value) {
    discSize.value = next
  }
}

let relayoutTimer: ReturnType<typeof setTimeout> | undefined
let goPressTimer: ReturnType<typeof setTimeout> | undefined
let highlightTimer: ReturnType<typeof setTimeout> | undefined
let isHighlightPlaying = false

const relayoutWheel = () => {
  clearTimeout(relayoutTimer)
  relayoutTimer = setTimeout(async () => {
    updateDiscSize()
    await nextTick()
    luckyRef.value?.init()
  }, 100)
}

const handleLuckyReady = () => {
  relayoutWheel()
}

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  updateDiscSize()
  await nextTick()
  relayoutWheel()

  const observeTarget = discRef.value ?? containerRef.value
  if (typeof ResizeObserver !== 'undefined' && observeTarget) {
    resizeObserver = new ResizeObserver(() => {
      void relayoutWheel()
    })
    resizeObserver.observe(observeTarget)
  } else {
    window.addEventListener('resize', relayoutWheel)
  }
})

onUnmounted(() => {
  clearTimeout(relayoutTimer)
  clearTimeout(goPressTimer)
  clearTimeout(highlightTimer)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', relayoutWheel)
})

watch(
  () => props.prizes,
  () => {
    relayoutWheel()
  },
  { deep: true }
)

const triggerGoPress = () => {
  isGoPressed.value = true
  clearTimeout(goPressTimer)
  goPressTimer = setTimeout(() => {
    isGoPressed.value = false
  }, LUCKY_WHEEL_GO_PRESS_MS)
}

const waitHighlightDuration = () =>
  new Promise<void>(resolve => {
    clearTimeout(highlightTimer)
    highlightTimer = setTimeout(resolve, LUCKY_WHEEL_HIGHLIGHT_DURATION_MS)
  })

const clearSectorHighlight = () => {
  showSectorHighlight.value = false
  sectorHighlightLocked.value = false
  isHighlightPlaying = false
}

const handleGoClick = () => {
  if (props.disabled) return
  clearSectorHighlight()
  triggerGoPress()
  luckyRef.value?.play()
  emit('go')
}

const handleEnd = async () => {
  if (isHighlightPlaying) return
  isHighlightPlaying = true
  sectorHighlightLocked.value = false
  showSectorHighlight.value = true
  await waitHighlightDuration()
  sectorHighlightLocked.value = true
  isHighlightPlaying = false
  emit('spinEnd')
}

const stopAt = (index: number) => {
  luckyRef.value?.stop(index)
}

const initWheel = () => {
  clearSectorHighlight()
  luckyRef.value?.init()
}

defineExpose({
  stopAt,
  init: initWheel,
  clearSectorHighlight
})
</script>

<style scoped lang="scss">
.lucky-wheel-host :deep(div[package]) {
  margin: 0 auto;
}

.pointer-wrap {
  transform: translate(-50%, -50%);
  transition:
    transform 180ms ease-out,
    filter 180ms ease-out;
}

.pointer-wrap--pressed {
  transform: translate(-50%, -50%) scale(0.9);
  filter: brightness(1.15);
}

.wheel-sector-highlight {
  bottom: 50%;
  width: 52%;
  height: 52%;
  transform: translateX(-50%);
  transform-origin: center bottom;
  object-fit: contain;
  object-position: center bottom;
  opacity: 0;
}

.wheel-sector-highlight--active {
  animation: wheel-sector-blink 0.4s ease-in-out 3;
  animation-fill-mode: forwards;
}

.wheel-sector-highlight--locked {
  opacity: 1;
  filter: brightness(1.2);
  animation: none;
}

@keyframes wheel-sector-blink {
  0%,
  100% {
    opacity: 0.35;
    filter: brightness(1);
  }

  50% {
    opacity: 1;
    filter: brightness(1.2);
  }
}
</style>
