<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="visible"
        class="fixed inset-0 z-[1000] flex items-end bg-mask-60-1"
        @click.self="emit('update:visible', false)"
        @keydown.esc.stop.prevent="emit('update:visible', false)"
      >
        <section
          class="bottom-sheet-panel flex h-[65vh] w-full flex-col overflow-hidden rounded-t-[12px] bg-bg-1 px-[12px] py-[16px] text-text-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hash-recent-bets-title"
        >
          <div class="mb-[20px] flex shrink-0 items-center justify-between">
            <h2 id="hash-recent-bets-title" class="text-[19px] font-[600] text-text-1">
              {{ t('hashGame.recentBets') }}
            </h2>
            <button
              type="button"
              class="flex items-center gap-[2px] text-[14px] text-text-3"
              @click="emit('update:visible', false)"
            >
              {{ t('hashGame.more') }} <RightArrowIcon class="size-[14px] text-text-3" />
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[10px]">
            <div class="mb-[10px] overflow-hidden">
              <div
                class="grid grid-cols-4 px-[12px] py-[6px] text-center text-[11px] text-text-2 rounded-t-[8px] bg-bg-3"
              >
                <span>{{ t('hashGame.currency') }}</span>
                <span>{{ t('hashGame.bets') }}</span>
                <span>{{ t('hashGame.betAmount') }}</span>
                <span>{{ t('hashGame.todayProfitLoss') }}</span>
              </div>
              <div
                class="grid grid-cols-4 items-center px-[12px] py-[7px] text-center text-[13px] font-[600] text-text-1 rounded-b-[8px] bg-bg-2"
              >
                <span class="flex items-center justify-center gap-[3px]">
                  <img :src="currencyIcon" :alt="currencyCode" class="size-[18px] object-contain" />
                  {{ currencyCode }}
                </span>
                <span>{{ summary.betCount }}</span>
                <span>{{ currencySymbol }}{{ summary.betAmount.toFixed(2) }}</span>
                <span>{{ currencySymbol }}{{ summary.todayProfitLoss.toFixed(2) }}</span>
              </div>
            </div>

            <div class="overflow-hidden">
              <div
                class="grid grid-cols-4 px-[12px] py-[6px] text-center text-[11px] text-text-2 rounded-t-[8px] bg-bg-3"
              >
                <span>{{ t('hashGame.betBlock') }}</span>
                <span>{{ t('hashGame.betSelection') }}</span>
                <span>{{ t('hashGame.betAmount') }}</span>
                <span>{{ t('hashGame.profitLoss') }}</span>
              </div>
              <div class="rounded-b-[8px] bg-bg-2">
                <div
                  v-for="(bet, index) in bets"
                  :key="`${bet.block}-${index}`"
                  class="grid grid-cols-4 px-[12px] py-[7px] items-center text-center text-[12px] text-text-2"
                >
                  <span class="text-left">{{ bet.block }}</span>
                  <span>{{ t(`hashGame.${bet.selection}`) }}</span>
                  <span class="whitespace-nowrap"
                    >-{{ currencySymbol }}{{ bet.betAmount.toFixed(2) }}</span
                  >
                  <span
                    class="flex items-center justify-end whitespace-nowrap"
                    :class="bet.profitLoss >= 0 ? 'text-theme-primary' : 'text-assistRed'"
                  >
                    {{ bet.profitLoss >= 0 ? '+' : '-' }}{{ currencySymbol
                    }}{{ Math.abs(bet.profitLoss).toFixed(2) }}
                    <RightArrowIcon class="ml-[1px] size-[14px] text-text-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import RightArrowIcon from '@/static/svg/hash_game/jiantou_you2.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RecentBetRecord, RecentBetSummary } from '../index'

const props = withDefaults(
  defineProps<{
    visible: boolean
    currencyCode: string
    currencyIcon: string
    balanceText: string
    bets: RecentBetRecord[]
    summary: RecentBetSummary
    topOffset?: number
  }>(),
  { topOffset: 0 }
)

const emit = defineEmits<{ 'update:visible': [visible: boolean] }>()
const { t } = useI18n()

const currencySymbol = computed(() => {
  const match = props.balanceText.match(/^[^\d\s]+/)
  return match?.[0] ?? `${props.currencyCode} `
})
</script>
