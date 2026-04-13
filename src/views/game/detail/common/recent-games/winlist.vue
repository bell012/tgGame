<template>
  <div>
    <div
      v-if="props.loading"
      class="flex items-center justify-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[16px] text-[12px] text-[var(--color-text-level-2)]"
    >
      {{ t('common.loading') }}
    </div>
    <template v-else-if="props.list.length">
      <template v-if="isMobile">
        <div
          v-for="(item, index) in props.list"
          :key="`${index}-${getPlayerName(item)}-${toPlainText(item.payOut)}`"
          class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[12px]"
        >
          <h3 class="win-item-divider flex gap-[8px] pb-[12px]">
            <SmartImage class="size-[20px]" alt="" :src="RackIcon" />
            <div class="text-[12px] font-bold">{{ getPlayerName(item) }}</div>
          </h3>
          <div class="flex justify-between mt-[12px] text-[12px]">
            <div class="text-[var(--color-text-level-2)]">{{ t('gameDetail.payout') }}</div>
            <div class="flex items-center gap-[8px]">
              <SmartImage
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
              <SmartImage
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
      <div v-else class="mt-[12px]">
        <div class="pc-winlist-header">
          <div>{{ t('home.Player') }}</div>
          <div>{{ t('home.Profit') }}</div>
          <div>{{ t('gameDetail.bet') }}</div>
          <div>{{ t('home.Multiplier') }}</div>
        </div>
        <div class="pc-winlist-body">
          <div
            v-for="(item, index) in props.list"
            :key="`${index}-${getPlayerName(item)}-${toPlainText(item.payOut)}`"
            class="pc-winlist-row"
            :class="{ 'pc-winlist-row-alt': index % 2 === 0 }"
          >
            <div class="pc-winlist-player">
              <SmartImage
                v-if="index < rankIcons.length"
                class="size-[24px] shrink-0"
                alt=""
                :src="rankIcons[index]"
              />
              <span class="truncate">{{ getPlayerName(item) }}</span>
            </div>
            <div class="pc-winlist-cell">
              <SmartImage
                class="w-[22px] h-[22px] min-w-[22px] object-contain"
                :alt="currentRequestCurrency"
                :src="currentCurrencyIcon"
              />
              <span class="text-[var(--color-theme-level-1)]">{{ formatPayOut(item.payOut) }}</span>
            </div>
            <div class="pc-winlist-cell">
              <SmartImage
                class="w-[22px] h-[22px] min-w-[22px] object-contain"
                :alt="currentRequestCurrency"
                :src="currentCurrencyIcon"
              />
              <span>{{ formatDecimal(item.wager) }}</span>
            </div>
            <div class="pc-winlist-mult">{{ formatMult(item.mult) }}</div>
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
import RankIcon2 from '@/static/svg/game/detail/rank2.svg?url'
import RankIcon3 from '@/static/svg/game/detail/rank3.svg?url'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { GameRanListItem } from '@/api/interface/game'
import { useLocaleStore } from '@/stores/locale'
import { getCurrencyIconByCode } from '../currency-select-options'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SmartImage from '@/components/common/SmartImage.vue'

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
const isMobile = useIsMobile()
const { actualCurrency } = storeToRefs(localeStore)
const currentRequestCurrency = computed(
  () => toPlainText(actualCurrency.value).toUpperCase() || 'USD'
)
const currentCurrencyIcon = computed(() => getCurrencyIconByCode(currentRequestCurrency.value))
const rankIcons = [RackIcon, RankIcon2, RankIcon3] as const

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
  border-bottom: 1px solid var(--color-opacity-10);
}

.pc-winlist-header {
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr 0.9fr;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  height: 44px;
  color: var(--color-text-level-2);
  font-size: 15px;
  font-weight: 600;
}

.pc-winlist-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pc-winlist-row {
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr 0.9fr;
  align-items: center;
  gap: 12px;
  min-height: 68px;
  border-radius: 10px;
  padding: 0 18px;
}

.pc-winlist-row-alt {
  background: var(--color-input-level-2);
}

.pc-winlist-player {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  min-width: 0;
}

.pc-winlist-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
}

.pc-winlist-mult {
  font-size: 16px;
  font-weight: 700;
}
</style>
