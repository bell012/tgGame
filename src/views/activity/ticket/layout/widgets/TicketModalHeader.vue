<template>
  <header
    class="flex flex-col"
    :class="[
      layout === 'pc' ? '' : 'pt-1',
      align === 'start' ? 'items-start px-0 text-left' : 'items-center px-4 text-center'
    ]"
  >
    <h1
      class="bg-clip-text font-[700] text-transparent"
      :style="{
        backgroundImage: titleGradient,
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
import { formatTicketActivityCountdown } from '../../shared/utils/ticketActivityCountdown'
import type { TicketModalHeaderData } from '../../shared/types'
import { getTicketModalTheme } from '../../shared/design-tokens'
import { TICKET_PC_LAYOUT } from '../../shared/layout-tokens/ticketPcLayout'
import { TICKET_MOBILE_LAYOUT } from '../../shared/layout-tokens/ticketMobileLayout'
import { computed, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<
    TicketModalHeaderData & {
      align?: 'center' | 'start'
      layout?: 'mobile' | 'pc'
    }
  >(),
  {
    endTime: undefined,
    theme: 'lucky_spin',
    expiresLabel: '',
    align: 'center',
    layout: 'mobile'
  }
)

const headerLayout = computed(() =>
  props.layout === 'pc' ? TICKET_PC_LAYOUT.header : TICKET_MOBILE_LAYOUT.header
)
const themeTokens = computed(() => getTicketModalTheme(props.theme))

const titleGradient = computed(() =>
  props.layout === 'pc' ? themeTokens.value.titleGradientPc : themeTokens.value.titleGradient
)

const countdownDigitBoxStyle = computed(() => {
  const layout = headerLayout.value
  const boxBg =
    props.layout === 'pc' && 'countdownBoxBg' in layout ? layout.countdownBoxBg : 'transparent'
  const boxBorder =
    props.layout === 'pc' && 'countdownBoxBorder' in layout
      ? layout.countdownBoxBorder
      : 'rgba(255, 255, 255, 0.2)'

  return {
    width: `${layout.countdownBoxSize}px`,
    height: `${layout.countdownBoxSize}px`,
    borderRadius: `${layout.countdownBoxRadius}px`,
    borderColor: boxBorder,
    backgroundColor: boxBg,
    fontSize: `${layout.countdownDigitFontSize}px`,
    color: themeTokens.value.countdownColon
  }
})

const countdownLabelIconStyle = computed(() => ({
  width: `${headerLayout.value.countdownLabelIconSize}px`,
  height: `${headerLayout.value.countdownLabelIconSize}px`
}))

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
