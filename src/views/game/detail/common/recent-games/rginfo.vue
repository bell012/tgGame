<template>
  <div class="lg:flex">
    <div class="stats-divider flex-1 flex mt-[12px] pb-[6px] text-[13px]">
      <div class="flex-1 flex flex-col gap-[6px] lg:text-center">
        <div class="text-[var(--color-text-level-2)]">{{ t('gameDetail.houseEdge') }}</div>
        <div class="text-[var(--color-theme-level-1)]">{{ houseEdgeText }}</div>
      </div>
      <div class="flex-1 flex flex-col gap-[6px] lg:text-center">
        <div class="text-[var(--color-text-level-2)]">{{ t('gameDetail.rtpReturnToPlayer') }}</div>
        <div class="text-[var(--color-theme-level-1)]">{{ rtpText }}</div>
      </div>
    </div>
    <div class="stats-divider flex-1 flex mt-[12px] pb-[6px] text-[13px]">
      <div class="flex-1 flex flex-col gap-[6px] lg:text-center">
        <div class="text-[var(--color-text-level-2)]">{{ t('gameDetail.maxWin') }}</div>
        <div class="text-[var(--color-theme-level-1)]">-</div>
      </div>
      <div class="flex-1 flex flex-col gap-[6px] lg:text-center">
        <div class="text-[var(--color-text-level-2)]">{{ t('gameDetail.stakesRange') }}</div>
        <div class="text-[var(--color-text-level-1)]">-</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

type CurrentGameDetail =
  | ({
      rtpMax?: string | number | null
      rtpMin?: string | number | null
    } & Record<string, unknown>)
  | null

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)
const { t } = useI18n()

const randomRtpValue = ref<number | null>(null)

const parseRtpValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

watch(
  () => [currentGameDetail.value?.rtpMin, currentGameDetail.value?.rtpMax] as const,
  ([rtpMinRaw, rtpMaxRaw]) => {
    const rtpMin = parseRtpValue(rtpMinRaw)
    const rtpMax = parseRtpValue(rtpMaxRaw)

    if (rtpMin === null || rtpMax === null) {
      randomRtpValue.value = null
      return
    }

    const min = Math.min(rtpMin, rtpMax)
    const max = Math.max(rtpMin, rtpMax)
    randomRtpValue.value = Math.random() * (max - min) + min
  },
  { immediate: true }
)

const formatPercent = (value: number) => `${value.toFixed(2)}%`

const rtpText = computed(() => {
  if (randomRtpValue.value === null) {
    return '-'
  }
  return formatPercent(randomRtpValue.value)
})

const houseEdgeText = computed(() => {
  if (randomRtpValue.value === null) {
    return '-'
  }
  return formatPercent(100 - randomRtpValue.value)
})
</script>
<style lang="scss" scoped>
.stats-divider {
  border-bottom: 1px solid var(--color-opacity-10);
}
</style>
