<template>
  <header
    class="flex flex-col pt-1"
    :class="[align === 'start' ? 'items-start px-0 text-left' : 'items-center px-4 text-center']"
  >
    <h1
      class="bg-clip-text font-[700] text-transparent"
      :style="{
        backgroundImage: themeTokens.titleGradient,
        fontSize: `${headerLayout.titleFontSize}px`,
        lineHeight: `${headerLayout.titleLineHeight}px`
      }"
    >
      {{ title }}
    </h1>
    <p
      class="font-[400] text-common-100"
      :style="{
        marginTop: `${headerLayout.subtitleMarginTop}px`,
        fontSize: `${headerLayout.subtitleFontSize}px`
      }"
    >
      {{ subtitle }}
    </p>

    <template v-if="showCountdown">
      <div
        class="flex items-center"
        :class="align === 'start' ? 'justify-start' : 'justify-center'"
        :style="{
          marginTop: `${headerLayout.subtitleToCountdownGap}px`,
          gap: `${headerLayout.countdownDigitGap}px`
        }"
      >
        <template v-for="(char, idx) in countdownChars" :key="idx">
          <span
            v-if="char === ':'"
            class="font-[700]"
            :style="{
              padding: '0 2px',
              fontSize: `${headerLayout.countdownDigitFontSize}px`,
              color: themeTokens.countdownColon
            }"
          >
            :
          </span>
          <span
            v-else
            class="flex items-center justify-center border font-[700]"
            :style="countdownDigitBoxStyle"
          >
            {{ char }}
          </span>
        </template>
      </div>

      <div
        class="flex items-center font-[400]"
        :class="align === 'start' ? 'justify-start' : 'justify-center'"
        :style="{
          marginTop: `${headerLayout.countdownDigitsToLabelGap}px`,
          gap: `${headerLayout.countdownLabelGap}px`,
          fontSize: `${headerLayout.expiresLabelFontSize}px`,
          color: themeTokens.expiresLabel
        }"
      >
        <svg
          class="shrink-0"
          :style="countdownLabelIconStyle"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2" />
          <path
            d="M7 4v3.5l2 1.2"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
        <span>{{ expiresLabel }}</span>
      </div>
    </template>
  </header>
</template>

<script setup lang="ts">
import { formatTicketActivityCountdown } from '../shared/ticketActivityCountdown'
import type { TicketModalHeaderData } from '../shared/types'
import { getTicketModalTheme } from '../shared/design-tokens'
import { TICKET_MOBILE_LAYOUT } from '../shared/ticketMobileLayout'
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

const headerLayout = TICKET_MOBILE_LAYOUT.header
const themeTokens = computed(() => getTicketModalTheme(props.theme))

const countdownDigitBoxStyle = computed(() => ({
  width: `${headerLayout.countdownBoxSize}px`,
  height: `${headerLayout.countdownBoxSize}px`,
  borderRadius: `${headerLayout.countdownBoxRadius}px`,
  borderColor: headerLayout.countdownBoxBorder,
  backgroundColor: 'transparent',
  fontSize: `${headerLayout.countdownDigitFontSize}px`,
  color: themeTokens.value.countdownColon
}))

const countdownLabelIconStyle = {
  width: `${headerLayout.countdownLabelIconSize}px`,
  height: `${headerLayout.countdownLabelIconSize}px`
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
