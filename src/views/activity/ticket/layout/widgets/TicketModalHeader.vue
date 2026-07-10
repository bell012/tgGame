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
      class="font-[400]"
      :class="themeTokens.subtitleColor ? '' : 'text-common-100'"
      :style="{
        marginTop: `${headerLayout.subtitleMarginTop}px`,
        fontSize: `${headerLayout.subtitleFontSize}px`,
        ...(themeTokens.subtitleColor ? { color: themeTokens.subtitleColor } : {})
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
          gap: `${headerLayout.countdownDigitGap}px`,
          color: themeTokens.countdownDigit ?? themeTokens.countdownColon
        }"
      >
        <template v-for="(char, idx) in countdownChars" :key="idx">
          <span
            v-if="char === ':'"
            class="font-[700]"
            :style="{
              padding: '0 2px',
              fontSize: `${headerLayout.countdownDigitFontSize}px`,
              color: themeTokens.countdownDigit ?? themeTokens.countdownColon
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
          lineHeight: `${headerLayout.expiresLabelFontSize}px`,
          color: themeTokens.expiresLabel
        }"
      >
        <span class="inline-flex items-center justify-center" :style="countdownLabelIconWrapStyle">
          <CountdownAlarmIcon
            class="countdown-label-icon shrink-0"
            :style="countdownLabelIconStyle"
            aria-hidden="true"
          />
        </span>
        <span class="leading-none">{{ expiresLabel }}</span>
      </div>
    </template>
  </header>
</template>

<script setup lang="ts">
import CountdownAlarmIcon from '@/static/img/lucky-spin/countdown-alarm-icon.svg?component'
import { formatTicketActivityCountdown } from '../../shared/utils/ticketActivityCountdown'
import type { TicketModalHeaderData } from '../../shared/types'
import { getTicketModalTheme } from '../../shared/design-tokens'
import { TICKET_PC_LAYOUT } from '../../shared/layout-tokens/ticketPcLayout'
import {
  getTicketMobileHeaderLayout,
  TICKET_MOBILE_LAYOUT
} from '../../shared/layout-tokens/ticketMobileLayout'
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
  props.layout === 'pc' ? TICKET_PC_LAYOUT.header : getTicketMobileHeaderLayout(props.theme)
)
const themeTokens = computed(() => getTicketModalTheme(props.theme))

const titleGradient = computed(() =>
  props.layout === 'pc' ? themeTokens.value.titleGradientPc : themeTokens.value.titleGradient
)

const countdownDigitBoxStyle = computed(() => {
  const layout = headerLayout.value
  const theme = themeTokens.value
  const boxBg =
    theme.countdownBoxBg ??
    (props.layout === 'pc' && 'countdownBoxBg' in layout ? layout.countdownBoxBg : 'transparent')
  const boxBorder =
    theme.countdownBoxBorder ??
    (props.layout === 'pc' && 'countdownBoxBorder' in layout
      ? layout.countdownBoxBorder
      : TICKET_MOBILE_LAYOUT.header.countdownBoxBorder)

  return {
    width: `${layout.countdownBoxSize}px`,
    height: `${layout.countdownBoxSize}px`,
    borderRadius: `${layout.countdownBoxRadius}px`,
    borderColor: boxBorder,
    backgroundColor: boxBg,
    fontSize: `${layout.countdownDigitFontSize}px`,
    color: theme.countdownDigit ?? theme.countdownColon
  }
})

const countdownLabelIconWrapStyle = computed(() => ({
  width: `${headerLayout.value.countdownLabelIconSize}px`,
  height: `${headerLayout.value.expiresLabelFontSize}px`,
  marginLeft: '2px'
}))

const countdownLabelIconStyle = computed(() => {
  const iconSize = headerLayout.value.countdownLabelIconSize

  return {
    width: `${iconSize}px`,
    height: `${iconSize}px`
  }
})

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

<style scoped lang="scss">
.countdown-label-icon {
  display: block;

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
