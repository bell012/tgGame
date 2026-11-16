<template>
  <!-- 投注记录 -->
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="visible"
        :class="
          variant === 'pc'
            ? 'fixed inset-0 z-[1000] grid place-items-center bg-mask-60-1 p-[12px]'
            : 'fixed inset-0 z-[1000] flex items-end bg-mask-60-1'
        "
        @click.self="emit('update:visible', false)"
        @keydown.esc.stop.prevent="emit('update:visible', false)"
      >
        <section
          class="bottom-sheet-panel flex flex-col overflow-hidden bg-bg-1 text-text-1"
          :class="
            variant === 'pc'
              ? 'max-h-[90vh] w-full max-w-[480px] rounded-[8px]'
              : 'h-[65vh] w-full rounded-t-[12px] px-[12px] py-[16px]'
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="hash-recent-bets-title"
        >
          <header
            v-if="variant === 'pc'"
            class="grid h-[56px] shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-bg-2 px-[16px]"
          >
            <button
              type="button"
              class="flex items-center gap-[4px] justify-self-start text-[16px] text-text-3"
              @click="openBetHistory"
            >
              {{ t('hashGame.more') }} <RightArrowIcon class="size-[16px] text-icon-3" />
            </button>
            <h2 id="hash-recent-bets-title" class="text-[18px] font-[700] text-text-1">
              {{ t('hashGame.recentBets') }}
            </h2>
            <button
              type="button"
              class="ml-auto grid size-[24px] place-items-center rounded-[4px] bg-opacity-10"
              :aria-label="t('common.close')"
              @click="emit('update:visible', false)"
            >
              <CloseIcon class="size-[12px] text-icon-1" />
            </button>
          </header>
          <div v-else class="mb-[20px] flex shrink-0 items-center justify-between">
            <h2 id="hash-recent-bets-title" class="text-[19px] font-[600] text-text-1">
              {{ t('hashGame.recentBets') }}
            </h2>
            <button
              type="button"
              class="flex items-center gap-[2px] text-[14px] text-text-3"
              @click="openBetHistory"
            >
              {{ t('hashGame.more') }} <RightArrowIcon class="size-[14px] text-text-3" />
            </button>
          </div>

          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[16px]"
            :class="variant === 'pc' ? 'px-[16px] py-[16px]' : ''"
          >
            <div
              :class="variant === 'pc' ? 'mb-[16px] overflow-hidden' : 'mb-[10px] overflow-hidden'"
            >
              <div
                :class="
                  variant === 'pc'
                    ? 'grid grid-cols-4 px-[12px] py-[8px] text-center text-[14px] text-text-2 rounded-t-[12px] bg-bg-3'
                    : 'grid grid-cols-4 px-[12px] py-[6px] text-center text-[11px] text-text-2 rounded-t-[8px] bg-bg-3'
                "
              >
                <span>{{ t('hashGame.currency') }}</span>
                <span>{{ t('hashGame.bets') }}</span>
                <span>{{ t('hashGame.betAmount') }}</span>
                <span>{{ t('hashGame.todayProfitLoss') }}</span>
              </div>
              <div
                :class="
                  variant === 'pc'
                    ? 'grid grid-cols-4 items-center px-[12px] py-[12px] text-center text-[16px] font-[700] text-text-1 rounded-b-[12px] bg-bg-2'
                    : 'grid grid-cols-4 items-center px-[12px] py-[7px] text-center text-[13px] font-[600] text-text-1 rounded-b-[8px] bg-bg-2'
                "
              >
                <span
                  :class="
                    variant === 'pc'
                      ? 'flex items-center justify-center gap-[4px]'
                      : 'flex items-center justify-center gap-[3px]'
                  "
                >
                  <img :src="currencyIcon" :alt="currencyCode" class="size-[18px] object-contain" />
                  {{ currencyCode }}
                </span>
                <span>{{ summary.betCount }}</span>
                <span>{{ currencySymbol }}{{ summary.betAmount.toFixed(2) }}</span>
                <span>{{ formatSignedAmount(summary.todayProfitLoss) }}</span>
              </div>
            </div>

            <div class="overflow-hidden">
              <div
                :class="
                  variant === 'pc'
                    ? 'grid grid-cols-4 px-[12px] py-[8px] text-center text-[14px] text-text-2 rounded-t-[12px] bg-bg-3'
                    : 'grid grid-cols-4 px-[12px] py-[6px] text-center text-[11px] text-text-2 rounded-t-[8px] bg-bg-3'
                "
              >
                <span class="text-left">{{ t('hashGame.betBlock') }}</span>
                <span>{{ t('hashGame.betSelection') }}</span>
                <span>{{ t('hashGame.betAmount') }}</span>
                <span class="text-right">{{ t('hashGame.profitLoss') }}</span>
              </div>
              <div
                :class="variant === 'pc' ? 'rounded-b-[12px] bg-bg-2' : 'rounded-b-[8px] bg-bg-2'"
              >
                <div
                  v-for="(bet, index) in bets"
                  :key="bet.id"
                  :class="
                    variant === 'pc'
                      ? 'grid grid-cols-4 px-[12px] py-[12px] items-center text-center text-[16px] text-text-2 cursor-pointer'
                      : 'grid grid-cols-4 px-[12px] py-[7px] items-center text-center text-[12px] text-text-2 cursor-pointer'
                  "
                  role="button"
                  tabindex="0"
                  @click="openBetDetail(bet)"
                  @keydown.enter.prevent="openBetDetail(bet)"
                  @keydown.space.prevent="openBetDetail(bet)"
                >
                  <span class="text-left">{{ bet.block }}</span>
                  <span>{{ t(`hashGame.${bet.selection}`) }}</span>
                  <span class="whitespace-nowrap"
                    >-{{ currencySymbol }}{{ bet.betAmount.toFixed(2) }}</span
                  >
                  <span
                    class="flex items-center justify-end whitespace-nowrap"
                    :class="bet.profitLoss >= 0 ? 'text-theme-primary' : 'text-secondary-2'"
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
import CloseIcon from '@/static/svg/close.svg?component'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HashGameBetDetail, RecentBetRecord, RecentBetSummary } from '../index'
import { navigateTo } from '@/utils/router'

const props = withDefaults(
  defineProps<{
    visible: boolean
    currencyCode: string
    currencyIcon: string
    balanceText: string
    period: number
    bets: RecentBetRecord[]
    summary: RecentBetSummary
    variant?: 'h5' | 'pc'
    topOffset?: number
  }>(),
  { variant: 'h5', topOffset: 0 }
)

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'select-bet': [bet: HashGameBetDetail]
}>()
const { t } = useI18n()

const currencySymbol = computed(() => {
  const match = props.balanceText.match(/^[^\d\s]+/)
  return match?.[0] ?? `${props.currencyCode} `
})

const formatSignedAmount = (amount: number) =>
  `${amount < 0 ? '-' : '+'}${currencySymbol.value}${Math.abs(amount).toFixed(2)}`

const openBetHistory = () => {
  emit('update:visible', false)
  void navigateTo('/bet-history')
}

const openBetDetail = (bet: RecentBetRecord) => {
  const detail: HashGameBetDetail = {
    ...bet,
    period: props.period,
    currencyCode: props.currencyCode,
    currencyIcon: props.currencyIcon
  }
  emit('update:visible', false)
  if (props.variant === 'pc') {
    emit('select-bet', detail)
    return
  }

  void navigateTo(`/hash-game/bet-details/${bet.id}`, {
    state: {
      hashGameBet: JSON.stringify(detail)
    }
  })
}
</script>
