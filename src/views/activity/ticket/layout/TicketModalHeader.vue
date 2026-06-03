<template>
  <header
    class="flex flex-col pt-1"
    :class="[align === 'start' ? 'items-start px-0 text-left' : 'items-center px-4 text-center']"
  >
    <h1
      class="bg-clip-text text-[24px] font-[700] leading-[30px] text-transparent"
      :style="{ backgroundImage: themeTokens.titleGradient }"
    >
      {{ title }}
    </h1>
    <p class="mt-1 text-[14px] font-[400] text-common-100">
      {{ subtitle }}
    </p>

    <div
      v-if="showCountdown"
      class="mt-4 flex items-center gap-0.5"
      :class="align === 'start' ? 'justify-start' : 'justify-center'"
    >
      <template v-for="(char, idx) in countdownChars" :key="idx">
        <span
          v-if="char === ':'"
          class="px-0.5 text-[18px] font-[700]"
          :style="{ color: themeTokens.countdownColon }"
        >
          :
        </span>
        <span
          v-else
          class="flex items-center justify-center rounded-[6px] border text-[18px] font-[700] text-common-100"
          :style="countdownBoxStyle"
        >
          {{ char }}
        </span>
      </template>
    </div>

    <div
      v-if="showCountdown"
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
import { formatTicketActivityCountdown } from '../shared/ticketActivityCountdown'
import type { TicketModalHeaderData } from '../shared/types'
import { getTicketModalTheme, LUCKY_SPIN_TOKENS } from '../shared/design-tokens'
import { computed, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<
    TicketModalHeaderData & {
      align?: 'center' | 'start'
    }
  >(),
  {
    endTime: undefined,
    theme: 'lucky_spin',
    expiresLabel: '',
    align: 'center'
  }
)

const themeTokens = computed(() => getTicketModalTheme(props.theme))

const countdownBoxStyle = {
  width: `${LUCKY_SPIN_TOKENS.countdownBox.w}px`,
  height: `${LUCKY_SPIN_TOKENS.countdownBox.h}px`,
  borderColor: LUCKY_SPIN_TOKENS.countdownBox.border,
  backgroundColor: LUCKY_SPIN_TOKENS.countdownBox.bg
}

const showCountdown = computed(() => Boolean(props.expiresLabel))

const nowTimestamp = ref(Date.now())
let timer: number | null = null

const countdownChars = computed(() =>
  formatTicketActivityCountdown(props.endTime, nowTimestamp.value).split('')
)

const tickCountdown = () => {
  nowTimestamp.value = Date.now()
}

const startTimer = () => {
  stopTimer()
  tickCountdown()
  timer = window.setInterval(tickCountdown, 1000)
}

const stopTimer = () => {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

watch(
  [showCountdown, () => props.endTime],
  ([visible]) => {
    if (visible) {
      startTimer()
      return
    }
    stopTimer()
  },
  { immediate: true }
)

onUnmounted(stopTimer)
</script>
