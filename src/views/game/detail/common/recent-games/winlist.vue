<template>
  <div>
    <div
      v-if="props.loading"
      class="flex items-center justify-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[16px] text-[12px] text-[var(--color-text-level-2)]"
    >
      Loading...
    </div>
    <template v-else-if="props.list.length">
      <div
        v-for="(item, index) in props.list"
        :key="`${index}-${getPlayerName(item)}-${toPlainText(item.payOut)}`"
        class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[12px]"
      >
        <h3 class="flex gap-[8px] border-b border-[var(--color-opacity-30)] pb-[12px]">
          <img class="size-[20px]" alt="" :src="RackIcon" />
          <div class="text-[12px] font-bold">{{ getPlayerName(item) }}</div>
        </h3>
        <div class="flex justify-between mt-[12px] text-[12px]">
          <div class="text-[var(--color-text-level-2)]">Payout</div>
          <div class="flex items-center gap-[8px]">
            <section class="relative w-[20px] h-[20px] overflow-hidden">
              <img
                class="w-[20px] min-w-[20px] absolute"
                alt="countries"
                src="@/static/img/explore/countries.png"
                :style="`top: -20px`"
              />
            </section>
            <div class="text-[var(--color-theme-level-1)]">{{ formatPayOut(item.payOut) }}</div>
          </div>
        </div>
        <div class="flex justify-between mt-[12px] text-[12px]">
          <div class="text-[var(--color-text-level-2)]">Wager</div>
          <div class="flex items-center gap-[8px]">
            <section class="relative w-[20px] h-[20px] overflow-hidden">
              <img
                class="w-[20px] min-w-[20px] absolute"
                alt="countries"
                src="@/static/img/explore/countries.png"
                :style="`top: -20px`"
              />
            </section>
            <div>{{ formatDecimal(item.wager) }}</div>
          </div>
        </div>
        <div class="flex justify-between mt-[12px] text-[12px]">
          <div class="text-[var(--color-text-level-2)]">Mult</div>
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
      No data
    </div>
  </div>
</template>
<script setup lang="ts">
import RackIcon from '@/static/svg/game/detail/rank1.svg?url'
import type { GameRanListItem } from '@/api/interface/game'

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
    'Anonymous'
  )
}
</script>
<style lang="scss" scoped></style>
