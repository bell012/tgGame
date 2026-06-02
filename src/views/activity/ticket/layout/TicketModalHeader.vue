<template>
  <header class="flex flex-col items-center px-4 pt-1 text-center">
    <h1
      class="bg-clip-text text-[24px] font-[700] leading-[30px] text-transparent"
      :style="{ backgroundImage: themeTokens.titleGradient }"
    >
      {{ title }}
    </h1>
    <p class="mt-1 text-[14px] font-[400] text-common-100">
      {{ subtitle }}
    </p>

    <div v-if="endTime" class="mt-4 flex items-center justify-center gap-1">
      <template v-for="(segment, segmentIndex) in countdownSegments" :key="segmentIndex">
        <span
          v-if="segmentIndex > 0"
          class="px-0.5 text-[18px] font-[700]"
          :style="{ color: themeTokens.countdownColon }"
        >
          :
        </span>
        <div class="flex gap-1">
          <span
            v-for="(digit, digitIndex) in segment"
            :key="`${segmentIndex}-${digitIndex}`"
            class="flex items-center justify-center rounded-[6px] border text-[18px] font-[700] text-common-100"
            :style="countdownBoxStyle"
          >
            {{ digit }}
          </span>
        </div>
      </template>
    </div>

    <div
      v-if="endTime"
      class="mt-2 flex items-center gap-1 text-[12px] font-[400]"
      :style="{ color: themeTokens.expiresLabel }"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2" />
        <path d="M7 4v3.5l2 1.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
      </svg>
      <span>{{ expiresLabel }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { TicketModalHeaderData } from '../shared/types'
import { getTicketModalTheme, LUCKY_SPIN_TOKENS } from '../shared/design-tokens'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<TicketModalHeaderData>(), {
  endTime: undefined,
  theme: 'lucky_spin',
  expiresLabel: ''
})

const themeTokens = computed(() => getTicketModalTheme(props.theme))

const countdownBoxStyle = {
  width: `${LUCKY_SPIN_TOKENS.countdownBox.w}px`,
  height: `${LUCKY_SPIN_TOKENS.countdownBox.h}px`,
  borderColor: LUCKY_SPIN_TOKENS.countdownBox.border,
  backgroundColor: LUCKY_SPIN_TOKENS.countdownBox.bg
}

const remainingSeconds = ref(0)
let timer: number | null = null

const pad2 = (value: number) => String(Math.max(0, value)).padStart(2, '0')

const countdownSegments = computed(() => {
  const total = remainingSeconds.value
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return [pad2(hours), pad2(minutes), pad2(seconds)].map(part => part.split(''))
})

const syncRemaining = () => {
  if (!props.endTime) {
    remainingSeconds.value = 0
    return
  }
  remainingSeconds.value = Math.max(0, Math.floor((props.endTime - Date.now()) / 1000))
}

const startTimer = () => {
  stopTimer()
  syncRemaining()
  timer = window.setInterval(syncRemaining, 1000)
}

const stopTimer = () => {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

watch(
  () => props.endTime,
  () => startTimer(),
  { immediate: true }
)

onMounted(startTimer)
onUnmounted(stopTimer)
</script>
