<template>
  <div class="lg:flex">
    <div class="stats-divider flex-1 flex mt-[20px] pb-[6px] text-[13px]">
      <div class="flex-1 flex flex-col gap-[6px] lg:text-center">
        <div class="stats-label text-[var(--color-text-level-2)]">
          {{ t('gameDetail.houseEdge') }}
        </div>
        <div class="stats-value text-[var(--color-theme-level-1)]">{{ houseEdgeText }}</div>
      </div>
      <div class="flex-1 flex flex-col gap-[6px] lg:text-center">
        <div class="stats-label text-[var(--color-text-level-2)]">
          {{ t('gameDetail.rtpReturnToPlayer') }}
        </div>
        <div class="stats-value text-[var(--color-theme-level-1)]">{{ rtpText }}</div>
      </div>
    </div>
    <div class="stats-divider flex-1 flex mt-[20px] pb-[6px] text-[13px]">
      <div class="flex-1 flex flex-col gap-[6px] lg:text-center">
        <div class="stats-label text-[var(--color-text-level-2)]">{{ t('gameDetail.maxWin') }}</div>
        <div class="stats-value text-[var(--color-theme-level-1)]">{{ maxWinText }}</div>
      </div>
      <div class="flex-1 flex flex-col gap-[6px] lg:text-center">
        <div class="stats-label text-[var(--color-text-level-2)]">
          {{ t('gameDetail.stakesRange') }}
        </div>
        <div class="stats-value text-[var(--color-text-level-1)]">{{ stakesRangeText }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { resolveGameMaxWinValue } from '@/views/game/detail/shared'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

type CurrentGameDetail =
  | ({
      rtpMax?: string | number | null
      rtpMin?: string | number | null
      maxWin?: string | number | null
      maxWinMax?: string | number | null
      maxWinMin?: string | number | null
      stakesRangeMin?: string | number | null
      stakesRangeMax?: string | number | null
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

const parseDisplayValue = (value: unknown) => {
  const text = String(value ?? '').trim()
  return text.length > 0 ? text : null
}

const formatNumberText = (value: unknown) => {
  const text = parseDisplayValue(value)
  if (!text) {
    return null
  }

  const normalizedText = text.replace(/,/g, '')
  const numericValue = Number(normalizedText)
  if (!Number.isFinite(numericValue)) {
    return text
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8
  }).format(numericValue)
}

const formatStakeText = (value: unknown) => {
  const text = formatNumberText(value)
  if (!text) {
    return null
  }

  return text.startsWith('$') ? text : `$${text}`
}

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

const maxWinText = computed(() => {
  const text = formatNumberText(resolveGameMaxWinValue(currentGameDetail.value))
  return text ?? '-'
})

const stakesRangeText = computed(() => {
  const minText = formatStakeText(currentGameDetail.value?.stakesRangeMin)
  const maxText = formatStakeText(currentGameDetail.value?.stakesRangeMax)

  if (!minText || !maxText) {
    return '-'
  }

  return `${minText} to ${maxText}`
})
</script>
<style lang="scss" scoped>
.stats-divider {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.stats-label {
  font-weight: 650;
}

.stats-value {
  font-weight: 700;
}

:global(:root.light .stats-divider) {
  border-bottom-color: rgba(17, 17, 17, 0.08);
}
</style>
