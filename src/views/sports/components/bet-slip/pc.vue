<template>
  <aside
    class="fixed bottom-0 right-6 z-30 flex max-h-[min(943px,calc(100dvh-84px))] w-[390px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-t-lg bg-bg-1 font-inter text-text-1 shadow-2xl 2xl:right-[120px]"
    data-testid="sports-betslip"
    :data-state="!props.open ? 'collapsed' : props.selections.length ? props.mode : 'empty'"
    aria-label="Bet Slip"
    @keydown.esc.stop="collapse"
  >
    <!-- 标题栏常驻，收起时保留余额刷新入口。 -->
    <header
      class="btn-primary flex h-[66px] shrink-0 items-center gap-2 px-5 text-text-4 !shadow-none"
    >
      <button
        type="button"
        class="flex h-full min-w-0 flex-1 items-center text-left text-lg font-bold leading-[22px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-4"
        :aria-label="props.open ? 'Collapse Bet Slip' : 'Expand Bet Slip'"
        :aria-expanded="props.open"
        :aria-controls="panelId"
        @click="emit('toggle')"
      >
        <span class="truncate">Bet Slip</span>
        <span class="flex h-[30px] w-[30px] shrink-0 items-center justify-center">
          <CaretIcon
            class="h-3 w-3 transition-transform"
            :class="{ 'rotate-180': props.open }"
            aria-hidden="true"
          />
        </span>
      </button>
      <span
        class="max-w-[55%] truncate text-xl font-bold leading-6 tabular-nums"
        :title="props.balanceText"
      >
        {{ props.balanceText }}
      </span>
      <button
        type="button"
        class="flex h-[30px] w-[18px] shrink-0 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-4 disabled:cursor-wait"
        aria-label="Refresh balance"
        :disabled="props.refreshing"
        @click="emit('refresh')"
      >
        <RefreshIcon
          class="h-[18px] w-[18px]"
          :class="{ 'animate-spin': props.refreshing }"
          aria-hidden="true"
        />
      </button>
    </header>

    <div
      v-show="props.open"
      :id="panelId"
      class="min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:thin]"
    >
      <div
        v-if="!props.selections.length"
        class="flex h-[168px] items-center justify-center gap-[19px] px-5"
      >
        <BetIcon class="h-[84px] w-[84px] shrink-0 text-theme-primary" aria-hidden="true" />
        <div class="w-[143px] min-w-0">
          <p class="text-[13px] font-extrabold leading-4">Place Your Bets</p>
          <p class="mt-1.5 text-xs leading-[15px] text-text-2">Your selections will appear here</p>
        </div>
      </div>

      <div v-else class="pt-[18px]">
        <!-- 投注选项只展示父级传入的数据，不在组件内派生盘口或请求接口。 -->
        <ul class="flex flex-col gap-3 px-[9px]">
          <li
            v-for="selection in props.selections"
            :key="selection.id"
            class="flex min-w-0 overflow-hidden rounded-[9px] bg-bg-5"
          >
            <button
              type="button"
              class="flex w-9 shrink-0 items-center justify-center bg-bg-4 text-text-2 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
              :aria-label="`Remove ${selection.selection}`"
              @click="emit('remove', selection.id)"
            >
              <CloseIcon class="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <div
              class="min-w-0 flex-1 p-2"
              :class="props.mode === 'single' ? 'min-h-[207px]' : 'min-h-[127px]'"
            >
              <div class="flex items-start justify-between gap-2 text-lg font-bold leading-[22px]">
                <span class="min-w-0 break-words">{{ selection.selection }}</span>
                <span class="shrink-0 tabular-nums">@{{ selection.odds.toFixed(2) }}</span>
              </div>
              <p class="mt-3 break-words text-base leading-[19px] text-theme-primary">
                {{ selection.market }}
              </p>
              <p
                class="mt-[9px] break-words text-sm leading-5 text-text-2"
                :class="{ 'min-h-[46px]': props.mode === 'single' }"
              >
                {{ selection.fixture }}
              </p>
              <p class="mt-[9px] break-words text-sm leading-5 text-text-2">
                {{ selection.league }}
              </p>
              <StakeInput
                v-if="props.mode === 'single'"
                class="mt-3"
                :value="selection.stake"
                :currency-symbol="props.currencySymbol"
                :label="`Stake for ${selection.selection}`"
                @update="emit('stake', selection.id, $event)"
                @focus="emit('focusStake', selection.id, 'single')"
                @max="emit('max', selection.id, 'single')"
              />
            </div>
          </li>
        </ul>

        <div v-if="props.mode === 'parlay'" class="mt-[18px] flex flex-col gap-[18px]">
          <div v-for="(parlay, index) in props.parlays" :key="parlay.id" class="min-w-0">
            <div
              class="mx-[9px] flex h-[60px] items-center gap-1.5 rounded-xl bg-bg-4 pl-[9px] pr-1.5"
            >
              <span class="flex shrink-0 items-center gap-3 text-base font-bold">
                {{ parlayLabel(parlay.size) }}
                <span class="tabular-nums">@{{ parlay.odds.toFixed(2) }}</span>
              </span>
              <span class="shrink-0 text-base">{{ parlay.combinationCount }}x</span>
              <StakeInput
                class="flex-1"
                :value="parlay.stake"
                :currency-symbol="props.currencySymbol"
                :label="`Stake for ${parlayLabel(parlay.size)}`"
                @update="emit('parlayStake', parlay.id, $event)"
                @focus="emit('focusStake', parlay.id, 'parlay')"
                @max="emit('max', parlay.id, 'parlay')"
              />
            </div>
            <div
              v-if="props.focusedStakeId === parlay.id || (!focusedParlay && index === 0)"
              class="relative mt-[18px] flex gap-2 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                v-for="amount in parlayQuickAmounts"
                :key="amount"
                type="button"
                :class="[quickAmountClass, amountClass(parlay.stake, amount)]"
                :aria-pressed="Number(parlay.stake) === amount"
                @click="setParlayQuickAmount(parlay.id, amount)"
              >
                {{ amount }}
              </button>
              <button
                type="button"
                :class="quickEditClass"
                @click="emit('unsupported', 'editAmounts')"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="relative mt-[18px] flex gap-2 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            v-for="amount in singleQuickAmounts"
            :key="amount"
            type="button"
            :class="[quickAmountClass, amountClass(focusedSingle?.stake ?? '', amount)]"
            :aria-pressed="Number(focusedSingle?.stake) === amount"
            @click="emit('quickAmount', amount)"
          >
            {{ amount }}
          </button>
          <button type="button" :class="quickEditClass" @click="emit('unsupported', 'editAmounts')">
            Edit
          </button>
        </div>

        <div class="px-3 py-[18px]">
          <div class="flex min-h-5 items-center justify-between gap-3 text-sm leading-5">
            <span class="text-text-2">Winnings</span>
            <span class="min-w-0 break-all text-right font-bold tabular-nums">
              {{ props.potentialReturnText }}
            </span>
          </div>
          <button
            type="button"
            class="mt-[18px] flex min-h-[49px] w-full items-center justify-center gap-2.5 rounded-full bg-theme-primary px-4 py-3 text-sm font-bold text-text-4 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-1 disabled:cursor-not-allowed"
            :disabled="!props.canSubmit"
            @click="emit('submit')"
          >
            <span>Place Bet:</span><span>{{ props.totalStakeText }}</span>
          </button>
          <button
            type="button"
            class="mt-3 min-h-[49px] w-full rounded-full bg-bg-2 px-4 py-3 text-sm font-bold text-text-2 hover:bg-bg-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
            @click="emit('mode', props.mode === 'single' ? 'parlay' : 'single')"
          >
            {{ props.mode === 'single' ? 'Add to Acca' : 'Single Bets' }}
          </button>
        </div>
      </div>

      <p
        v-if="props.notice"
        class="px-[18px] pb-3 text-xs text-text-2"
        role="status"
        aria-live="polite"
      >
        {{ props.notice }}
      </p>
      <footer class="flex gap-3 px-[18px] pb-[18px]">
        <button
          v-if="props.selections.length"
          type="button"
          class="flex h-[42px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-bg-2 text-text-2 hover:bg-bg-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
          aria-label="Clear Bet Slip"
          @click="emit('clear')"
        >
          <ClearIcon class="h-6 w-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-2 px-3 text-[13px] font-extrabold text-text-2 hover:bg-bg-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
          :class="props.selections.length ? 'h-[42px]' : 'h-10'"
          @click="emit('unsupported', 'settings')"
        >
          <SettingsIcon class="h-6 w-6 shrink-0" aria-hidden="true" />
          Odds Settings
        </button>
      </footer>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import BetIcon from '@/static/svg/sports/betslip-empty.svg'
import CaretIcon from '@/static/svg/sports/caret-up.svg'
import ClearIcon from '@/static/svg/sports/clear-bets.svg'
import CloseIcon from '@/static/svg/close.svg'
import RefreshIcon from '@/static/svg/refresh.svg'
import SettingsIcon from '@/static/svg/sports/odds-settings.svg'
import StakeInput from './stake-input.vue'
import type { SportsBetMode, SportsBetSelection, SportsParlay } from '../../index'

const props = defineProps<{
  open: boolean
  mode: SportsBetMode
  selections: SportsBetSelection[]
  parlays: SportsParlay[]
  balanceText: string
  currencySymbol: string
  totalStakeText: string
  potentialReturnText: string
  canSubmit: boolean
  refreshing: boolean
  notice: string
  focusedStakeId?: string
}>()

const emit = defineEmits<{
  toggle: []
  remove: [id: string]
  stake: [id: string, value: string]
  parlayStake: [id: string, value: string]
  focusStake: [id: string, kind: SportsBetMode]
  max: [id: string, kind: SportsBetMode]
  quickAmount: [amount: number]
  mode: [mode: SportsBetMode]
  clear: []
  submit: []
  refresh: []
  unsupported: [action: 'settings' | 'editAmounts']
}>()

const panelId = useId()
const singleQuickAmounts = [10, 20, 50, 100, 200]
const parlayQuickAmounts = [20, 50, 100, 200]
const quickAmountClass =
  'h-9 w-[66px] shrink-0 rounded-xl px-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary'
const quickEditClass = `${quickAmountClass} bg-bg-3 text-text-1 hover:bg-bg-2`

const focusedSingle = computed(
  () =>
    props.selections.find(selection => selection.id === props.focusedStakeId) ?? props.selections[0]
)
const focusedParlay = computed(() =>
  props.parlays.find(parlay => parlay.id === props.focusedStakeId)
)

function amountClass(stake: string, amount: number) {
  return Number(stake) === amount
    ? 'bg-theme-primary text-text-4'
    : 'bg-bg-3 text-text-1 hover:bg-bg-2'
}

function parlayLabel(size: number) {
  if (size === 2) return 'Double'
  if (size === 3) return 'Treble'
  return `${size}-fold`
}

function setParlayQuickAmount(id: string, amount: number) {
  emit('focusStake', id, 'parlay')
  emit('quickAmount', amount)
}

function collapse() {
  if (props.open) emit('toggle')
}
</script>
