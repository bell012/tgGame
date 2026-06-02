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
      </div>

      <img
        :src="LUCKY_SPIN_ASSETS.wheel.frame"
        alt=""
        class="pointer-events-none absolute inset-0 z-20 h-full w-full select-none object-contain"
        draggable="false"
      />

      <img
        :src="LUCKY_SPIN_ASSETS.wheel.pointerGo"
        alt=""
        class="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 select-none object-contain"
        :style="{ width: pointerSize, height: pointerSize }"
        draggable="false"
      />

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
import { useLuckyWheelConfig } from './useLuckyWheelConfig'

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

const isMobile = useIsMobile()

const WHEEL_WIDTH = computed(() =>
  isMobile.value
    ? `min(${LUCKY_SPIN_TOKENS.wheelSize}px, 80.27vw)`
    : `${TICKET_PC_TOKENS.wheelSizePc}px`
)
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

const handleGoClick = () => {
  if (props.disabled) return
  luckyRef.value?.play()
  emit('go')
}

const handleEnd = () => {
  emit('spinEnd')
}

const stopAt = (index: number) => {
  luckyRef.value?.stop(index)
}

const initWheel = () => {
  luckyRef.value?.init()
}

defineExpose({
  stopAt,
  init: initWheel
})
</script>

<style scoped lang="scss">
.lucky-wheel-host :deep(div[package]) {
  margin: 0 auto;
}
</style>
