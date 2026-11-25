<template>
  <!-- 结算提示覆盖在开奖区域，按结算队列逐条展示。 -->
  <Transition
    mode="out-in"
    enter-active-class="transition-opacity duration-[240ms]"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-[240ms]"
    leave-to-class="opacity-0"
  >
    <section
      v-if="notice"
      :key="notice.id"
      class="fixed left-0 right-0 top-[93px] z-[1002] mx-auto h-[154px] w-full max-w-[375px] overflow-hidden text-center font-inter"
      role="status"
      aria-live="assertive"
    >
      <!-- 渐隐底框使用设计稿提供的原始遮罩。 -->
      <div
        class="absolute inset-0 bg-bg-2 backdrop-blur-[5px]"
        :style="{ maskImage: `url(${backgroundMask})`, maskSize: '100% 100%' }"
      />

      <!-- 左右礼花使用设计稿原始图片。 -->
      <img
        :src="confettiLeft"
        alt=""
        class="pointer-events-none absolute left-[16px] top-[22px] h-[43px] w-[64px] object-contain"
      />
      <img
        :src="confettiRight"
        alt=""
        class="pointer-events-none absolute right-[22px] top-[28px] h-[29px] w-[44px] object-contain"
      />

      <!-- 当前币种的输赢金额。 -->
      <div
        class="relative flex items-baseline justify-center gap-[5px] whitespace-nowrap pt-[8px] font-semibold leading-none"
      >
        <span class="text-[20px] text-text-1">{{
          t(
            notice.status === 'WIN'
              ? 'hashGame.win'
              : notice.status === 'LOSE'
                ? 'hashGame.lose'
                : notice.status === 'REFUND'
                  ? 'hashGame.betDetailStatus.refund'
                  : 'hashGame.betDetailStatus.error'
          )
        }}</span>
        <span
          class="text-[35px]"
          :class="notice.amount > 0 ? 'text-secondary-4' : 'text-secondary-2'"
        >
          {{ notice.amount > 0 ? '+' : notice.amount < 0 ? '−' : '' }}{{ currencySymbol
          }}{{ formatAmount(Math.abs(displayedAmount)) }}
        </span>
      </div>

      <!-- 有开奖哈希时展示哈希和结果；数据未接入时不编造开奖结果。 -->
      <p
        v-if="notice.drawHash || notice.resultLabel"
        class="relative mt-[8px] whitespace-nowrap text-[13px] leading-normal text-text-2"
      >
        {{ t('hashGame.settlementDrawHash') }}:
        <span class="text-[14px] text-text-1">{{ notice.drawHash || '—' }}</span>
        <span
          v-if="notice.resultLabel"
          class="text-[14px]"
          :class="notice.status === 'WIN' ? 'text-secondary-4' : 'text-secondary-2'"
        >
          ({{ notice.resultLabel }})</span
        >
      </p>

      <!-- 点击提示可提前显示队列中的下一条。 -->
      <button
        type="button"
        class="absolute inset-0 h-full w-full cursor-pointer"
        :aria-label="t('hashGame.settlementClose')"
        @click.stop="emit('dismiss')"
      />
    </section>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCurrencySymbol } from '@/utils/locale'
import type { HashSettlementNotice } from '../chat/types'
import backgroundMask from '@/static/img/hash_game/settlement/background-mask.svg'
import confettiLeft from '@/static/img/hash_game/settlement/confetti-left.png'
import confettiRight from '@/static/img/hash_game/settlement/confetti-right.png'
import settlementSound from '@/static/mp3/hash/zhongjiang.mp3?url'

const props = defineProps<{ notice: HashSettlementNotice | null; soundEnabled?: boolean }>()
const { t } = useI18n()
const playedRounds = new Set<string>()
const displayedAmount = ref(0)
let amountFrame = 0
let audio: HTMLAudioElement | undefined
watch(
  () => [props.notice, props.soundEnabled] as const,
  ([notice, enabled]) => {
    if (!enabled) audio?.pause()
    if (
      !notice ||
      !enabled ||
      !['WIN', 'LOSE'].includes(notice.status) ||
      playedRounds.has(`${notice.gameCode}:${notice.anchorBlockNum}`)
    )
      return
    playedRounds.add(`${notice.gameCode}:${notice.anchorBlockNum}`)
    audio ??= new Audio(settlementSound)
    audio.currentTime = 0
    void audio.play().catch(() => {})
  },
  { immediate: true }
)
const emit = defineEmits<{ dismiss: [] }>()
const currencySymbol = computed(() => getCurrencySymbol(props.notice?.currency))
let dismissTimer: ReturnType<typeof setTimeout> | undefined

/** 同组结算追加时从当前数值滚动到新的净利润。 */
watch(
  () => [props.notice?.id, props.notice?.amount] as const,
  ([id, amount], previous) => {
    if (amountFrame) cancelAnimationFrame(amountFrame)
    if (!id || amount === undefined) {
      displayedAmount.value = 0
      return
    }
    const from = id === previous?.[0] ? displayedAmount.value : 0
    displayedAmount.value = from
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      displayedAmount.value = amount
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1200)
      displayedAmount.value = from + (amount - from) * progress
      if (progress < 1) amountFrame = requestAnimationFrame(tick)
    }
    amountFrame = requestAnimationFrame(tick)
  },
  { immediate: true }
)

/** 与参考组件一致，结算利润显示两位小数。 */
function formatAmount(amount: number) {
  return amount.toFixed(2)
}

/** 当前提示显示 3.6 秒后关闭，继续展示队列中的下一条。 */
watch(
  () => [props.notice?.id, props.notice?.amount] as const,
  ([id]) => {
    if (dismissTimer) clearTimeout(dismissTimer)
    if (id) dismissTimer = setTimeout(() => emit('dismiss'), 3600)
  },
  { immediate: true }
)

/** 组件卸载时清除自动关闭计时器。 */
onBeforeUnmount(() => {
  audio?.pause()
  if (amountFrame) cancelAnimationFrame(amountFrame)
  if (dismissTimer) clearTimeout(dismissTimer)
})
</script>
