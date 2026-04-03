<template>
  <div>
    <div
      v-if="props.loading"
      class="flex items-center justify-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[16px] text-[12px] text-[var(--color-text-level-2)]"
    >
      {{ t('common.loading') }}
    </div>
    <template v-else-if="props.list.length">
      <div
        v-for="(item, index) in props.list"
        :key="`${index}-${getPlayerName(item)}-${toPlainText(item.payOut)}`"
        class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[12px]"
      >
        <h3 class="win-item-divider flex gap-[8px] pb-[12px]">
          <img class="size-[20px]" alt="" :src="RackIcon" />
          <div class="text-[12px] font-bold">{{ getPlayerName(item) }}</div>
        </h3>
        <div class="flex justify-between mt-[12px] text-[12px]">
          <div class="text-[var(--color-text-level-2)]">{{ t('gameDetail.payout') }}</div>
          <div class="flex items-center gap-[8px]">
            <img
              class="w-[20px] h-[20px] min-w-[20px] object-contain"
              :alt="currentRequestCurrency"
              :src="currentCurrencyIcon"
            />
            <div class="text-[var(--color-theme-level-1)]">{{ formatPayOut(item.payOut) }}</div>
          </div>
        </div>
        <div class="flex justify-between mt-[12px] text-[12px]">
          <div class="text-[var(--color-text-level-2)]">{{ t('gameDetail.wager') }}</div>
          <div class="flex items-center gap-[8px]">
            <img
              class="w-[20px] h-[20px] min-w-[20px] object-contain"
              :alt="currentRequestCurrency"
              :src="currentCurrencyIcon"
            />
            <div>{{ formatDecimal(item.wager) }}</div>
          </div>
        </div>
        <div class="flex justify-between mt-[12px] text-[12px]">
          <div class="text-[var(--color-text-level-2)]">{{ t('gameDetail.mult') }}</div>
          <div class="flex items-center gap-[8px]">
            <div>{{ formatMult(item.mult) }}</div>
          </div>
        </div>
      </div>
    </template>
    <div
      v-else
      class="flex items-center justify-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[16px] text-[12px] text-[var(--color-text-level-2)]"
    >
      {{ t('gameDetail.noData') }}
    </div>
  </div>
</template>
<script setup lang="ts">
import RackIcon from '@/static/svg/game/detail/rank1.svg?url'
import type { GameRanListItem } from '@/api/interface/game'
import { useLocaleStore } from '@/stores/locale'
import { getCurrencyIconByCode } from '../currency-select-options'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    list?: GameRanListItem[]
    loading?: boolean
  }>(),
  {
    list: () => [],
    loading: false
  }
)

const toPlainText = (value: unknown) => String(value ?? '').trim()
const { t } = useI18n()
const localeStore = useLocaleStore()
const { actualCurrency } = storeToRefs(localeStore)
const currentRequestCurrency = computed(
  () => toPlainText(actualCurrency.value).toUpperCase() || 'USD'
)
const currentCurrencyIcon = computed(() => getCurrencyIconByCode(currentRequestCurrency.value))

const formatDecimal = (value: unknown) => {
  const valueText = toPlainText(value)
  if (!valueText) {
    return '0.00'
  }

  const parsed = Number(valueText)
  return Number.isFinite(parsed) ? parsed.toFixed(2) : valueText
}

const formatPayOut = (value: unknown) => {
  const valueText = formatDecimal(value)
  if (!valueText) {
    return '+0.00'
  }
  if (/^[+-]/.test(valueText)) {
    return valueText
  }
  return `+${valueText}`
}

const formatMult = (value: unknown) => {
  const valueText = toPlainText(value)
  if (!valueText) {
    return '0.00x'
  }
  if (/x$/i.test(valueText)) {
    return valueText
  }
  const parsed = Number(valueText)
  return Number.isFinite(parsed) ? `${parsed.toFixed(2)}x` : `${valueText}x`
}

const getPlayerName = (item: GameRanListItem) => {
  return (
    toPlainText(item.memberName) ||
    toPlainText(item.userName) ||
    toPlainText(item.memberId) ||
    t('gameDetail.anonymous')
  )
}
</script>
<style lang="scss" scoped>
.win-item-divider {
  border-bottom: 1px solid #d8e0ec;
}

:global(:root.light) .win-item-divider,
:global(html.light) .win-item-divider {
  border-bottom-color: #d8e0ec !important;
}

:global(:root.dark) .win-item-divider,
:global(html.dark) .win-item-divider {
  border-bottom-color: rgba(255, 255, 255, 0.3) !important;
}
</style>
