<template>
  <PopShell
    :model-value="betSlipOpen"
    transition-type="bottom-sheet"
    @update:model-value="onShellUpdate"
  >
    <section
      ref="panel"
      class="relative flex max-h-[calc(100dvh-40px)] w-screen flex-col overflow-hidden rounded-t-[24px] bg-bg-2 font-inter text-text-1 outline-none [@media(max-height:560px)]:overflow-y-auto"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-busy="result === 'confirming'"
      :inert="editingAmounts"
      tabindex="-1"
      data-testid="sports-betslip-h5"
      :data-state="result === 'idle' ? mode : result"
      @keydown="onKeydown"
    >
      <header class="flex h-12 shrink-0 items-center gap-2 bg-bg-2 px-[13.333px]">
        <h2 :id="titleId" class="min-w-0 flex-1 truncate text-base font-bold">
          {{ !selections.length ? 'Bet Slip' : mode === 'single' ? 'Single Bet' : 'Parlay Bet' }}
        </h2>
        <button
          type="button"
          class="flex h-[30.333px] min-w-0 items-center gap-2 rounded-full bg-bg-5 px-2 text-[15px] font-bold"
          :aria-label="`Refresh balance, ${balanceText}`"
          :disabled="refreshing || busy"
          @click="props.page.refreshBalance"
        >
          <span class="max-w-[140px] truncate tabular-nums">{{ balanceText }}</span>
          <RefreshIcon
            class="h-3.5 w-3.5 shrink-0 text-text-3"
            :class="{ 'animate-spin': refreshing }"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="sr-only text-text-2 focus:not-sr-only focus:absolute focus:right-3 focus:rounded-lg focus:bg-bg-5 focus:p-2"
          aria-label="Close Bet Slip"
          @click="close"
        >
          <CloseIcon class="h-3 w-3" aria-hidden="true" />
        </button>
      </header>

      <div
        class="flex min-h-0 flex-col rounded-t-[15px] bg-bg-3 [@media(max-height:560px)]:shrink-0"
      >
        <!-- 常规高度只滚动赛事区；横屏短屏改为整层滚动，保证键盘和提交按钮始终可达。 -->
        <div
          class="min-h-0 overflow-y-auto overscroll-contain px-[6.667px] py-[6.667px] [scrollbar-width:thin] [@media(max-height:560px)]:shrink-0 [@media(max-height:560px)]:overflow-visible [@media(max-height:560px)]:overscroll-auto"
        >
          <div
            v-if="!selections.length"
            class="flex min-h-[180px] flex-col items-center justify-center gap-3 px-4 text-center"
          >
            <BetIcon class="h-16 w-16 text-theme-primary" aria-hidden="true" />
            <p class="text-sm font-bold">Place Your Bets</p>
            <p class="text-xs text-text-2">Your selections will appear here.</p>
            <button
              type="button"
              class="h-9 rounded-full bg-theme-3 px-5 text-sm text-theme-primary"
              @click="addEvent"
            >
              Add Event
            </button>
          </div>
          <template v-else>
            <ul class="flex flex-col gap-1.5">
              <BetSelection
                v-for="selection in selections"
                :key="selection.id"
                :selection="selection"
                :single="mode === 'single'"
                :currency-symbol="currencySymbol"
                :active="keyboardOpen && activeRow?.id === selection.id"
                :disabled="busy"
                @focus="focusStake(selection.id, 'single')"
                @remove="removeSelection(selection.id)"
              />
            </ul>
            <div v-if="mode === 'parlay'" class="mt-1.5 flex flex-col gap-1.5">
              <div
                v-for="parlay in parlays"
                :key="parlay.id"
                class="flex min-w-0 items-start gap-1.5 rounded-lg bg-bg-2 p-1"
              >
                <div class="flex h-[38px] shrink-0 items-center gap-1.5 pl-1 text-sm">
                  <span>{{ parlay.size }}-Fold</span>
                  <span class="text-theme-primary">@{{ parlay.odds.toFixed(2) }}</span>
                </div>
                <span class="ml-auto flex h-[38px] shrink-0 items-center text-xs text-text-2"
                  >{{ parlay.combinationCount }}x</span
                >
                <StakeField
                  class="min-w-0 flex-1"
                  :value="parlay.stake"
                  :currency-symbol="currencySymbol"
                  :label="`Stake for ${parlay.size}-Fold`"
                  :active="keyboardOpen && activeRow?.id === parlay.id"
                  :error="getH5StakeError(parlay.stake)"
                  :disabled="busy"
                  @focus="focusStake(parlay.id, 'parlay')"
                />
              </div>
              <button
                type="button"
                class="flex h-[38px] items-center justify-center gap-2 rounded-lg bg-theme-3 text-sm text-theme-primary disabled:opacity-50"
                :disabled="busy"
                @click="addEvent"
              >
                <span class="text-2xl leading-none" aria-hidden="true">+</span> Add Event
              </button>
            </div>
          </template>
        </div>

        <BetKeyboard
          v-if="keyboardOpen && selections.length"
          class="mx-[6.667px] shrink-0"
          :amounts="quickAmounts.map(String)"
          :value="activeRow?.stake ?? ''"
          :disabled="busy"
          @key="keyPress"
          @amount="chooseQuickAmount"
          @max="maxStake"
          @hide="hideKeyboard"
          @edit="startEdit"
        />

        <footer
          v-if="selections.length"
          class="shrink-0 px-2.5 pb-[calc(23.333px+env(safe-area-inset-bottom))] pt-2.5"
        >
          <p v-if="submitError" class="mb-2 text-xs text-secondary-2" role="alert">
            {{ submitError }}
          </p>
          <p v-else-if="notice" class="mb-2 text-[10px] text-text-2" role="status">{{ notice }}</p>
          <div class="flex items-center justify-between gap-2 text-xs">
            <p class="min-w-0 text-text-2">
              To Win
              <span class="ml-1 break-all font-bold tabular-nums text-theme-primary">{{
                potentialReturnText
              }}</span>
            </p>
            <label class="flex shrink-0 cursor-pointer items-center gap-1 text-[11px] text-text-2">
              <input
                v-model="acceptBetterOdds"
                type="checkbox"
                class="peer sr-only"
                :disabled="busy"
              />
              <span
                class="flex h-3 w-3 items-center justify-center rounded-full border border-solid border-text-3 text-text-4 peer-checked:border-theme-primary peer-checked:bg-theme-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-theme-primary peer-disabled:opacity-50"
                aria-hidden="true"
              >
                <svg v-if="acceptBetterOdds" viewBox="0 0 12 12" class="h-2.5 w-2.5" fill="none">
                  <path
                    d="m2.5 6 2.2 2.2 4.8-4.8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              Auto-accept better odds
            </label>
          </div>
          <div class="mt-[13.333px] flex items-center gap-2.5">
            <button
              type="button"
              class="h-[44.667px] w-[110px] shrink-0 rounded-full border border-solid border-theme-primary px-2 text-sm text-theme-primary disabled:opacity-50"
              :disabled="busy || editingAmounts"
              @click="changeMode"
            >
              {{ mode === 'single' ? 'Add to Parlay' : 'Single Bet' }}
            </button>
            <button
              type="button"
              class="flex h-[44.667px] min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-theme-primary px-2 text-sm text-text-4 disabled:opacity-60"
              :disabled="busy || editingAmounts"
              :aria-label="`Place bet, total stake ${totalStakeText}`"
              data-testid="sports-h5-submit"
              @click="submit"
            >
              <RefreshIcon
                v-if="result === 'confirming'"
                class="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              <span v-if="result === 'confirming'" class="font-bold">Bet Confirming...</span>
              <span v-else class="min-w-0 text-center leading-4"
                >Total Stake :
                <strong class="whitespace-nowrap text-[15px]">{{ totalStakeText }}</strong></span
              >
            </button>
            <button
              v-if="mode === 'parlay'"
              type="button"
              class="flex h-[44.667px] w-[44.667px] shrink-0 items-center justify-center rounded-full bg-theme-3 text-theme-primary disabled:opacity-50"
              aria-label="Clear Bet Slip"
              :disabled="busy"
              @click="clear"
            >
              <ClearIcon class="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </footer>
        <div v-else class="h-[env(safe-area-inset-bottom)] shrink-0" />
      </div>

      <div
        v-if="result === 'success' || result === 'failed'"
        class="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-8"
        role="status"
        aria-live="polite"
      >
        <div
          class="pointer-events-auto flex w-[190px] flex-col items-center gap-3 rounded-[22px] bg-mask-80-2 px-4 py-6 text-center"
          :class="result === 'success' ? 'text-theme-primary' : 'text-secondary-2'"
        >
          <span
            class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-current text-3xl"
            aria-hidden="true"
            >{{ result === 'success' ? '✓' : '!' }}</span
          >
          <p class="text-base font-bold">
            {{ result === 'success' ? 'Bet placed' : 'Bet failed' }}
          </p>
          <p class="text-[11px] text-text-2">
            {{
              result === 'success'
                ? 'Local simulation. No real bet was placed.'
                : 'This selection could not be accepted. Your stake has been kept.'
            }}
          </p>
          <button
            v-if="result === 'failed'"
            type="button"
            class="h-8 rounded-full bg-bg-3 px-4 text-xs font-semibold text-text-1"
            @click="result = 'idle'"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  </PopShell>
  <QuickAmounts
    :model-value="editingAmounts"
    :amounts="amountDrafts"
    :currency-symbol="currencySymbol"
    :error="editError"
    :disabled="busy"
    @update:model-value="
      opened => {
        if (!opened) cancelEdit()
      }
    "
    @update-amount="updateAmountDraft"
    @reorder="reorderAmountDraft"
    @save="saveEdit"
  />
</template>

<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'
import PopShell from '@/components/withdraw/popShell.vue'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import BetIcon from '@/static/svg/sports/betslip-empty.svg'
import ClearIcon from '@/static/svg/sports/clear-bets.svg'
import CloseIcon from '@/static/svg/close.svg'
import RefreshIcon from '@/static/svg/refresh.svg'
import BetKeyboard from './keyboard.vue'
import BetSelection from './selection.vue'
import StakeField from './stake-field.vue'
import QuickAmounts from './quick-amounts.vue'
import { getH5StakeError, useSportsH5Bet } from './h5'
import type { SportsPageState } from '../../index'

const props = defineProps<{ page: SportsPageState }>()
const panel = ref<HTMLElement | null>(null)
const titleId = useId()
const {
  selections,
  parlays,
  mode,
  betSlipOpen,
  balanceText,
  currencySymbol,
  potentialReturnText,
  totalStakeText,
  refreshing,
  notice
} = props.page
const {
  keyboardOpen,
  quickAmounts,
  editingAmounts,
  amountDrafts,
  editError,
  acceptBetterOdds,
  result,
  busy,
  activeRow,
  submitError,
  close,
  focusStake,
  keyPress,
  maxStake,
  chooseQuickAmount,
  startEdit,
  cancelEdit,
  saveEdit,
  updateAmountDraft,
  reorderAmountDraft,
  addEvent,
  changeMode,
  removeSelection,
  clear,
  submit
} = useSportsH5Bet(props.page)
let previousFocus: HTMLElement | null = null

usePageScrollLock(betSlipOpen)
watch(betSlipOpen, async opened => {
  if (opened) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    if (betSlipOpen.value) panel.value?.focus({ preventScroll: true })
  } else {
    await nextTick()
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
  }
})

// 键盘展开后赛事区会缩短，滚动到当前金额框，避免输入位置被键盘遮住。
watch([keyboardOpen, () => props.page.focusedStakeId.value], async () => {
  if (!keyboardOpen.value) return
  await nextTick()
  panel.value
    ?.querySelector<HTMLElement>('[data-stake-active="true"]')
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
})

function onShellUpdate(opened: boolean) {
  if (!opened) close()
}

function hideKeyboard() {
  cancelEdit()
  keyboardOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  // 快捷金额编辑层使用独立焦点范围，不让底层键盘截获原生输入。
  if (editingAmounts.value) return
  if (event.key === 'Escape') {
    event.stopPropagation()
    event.preventDefault()
    close()
    return
  }
  if (event.key === 'Tab') {
    const focusable = panel.value?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), [tabindex="0"]'
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === panel.value)
    ) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
  if (
    keyboardOpen.value &&
    !event.ctrlKey &&
    !event.metaKey &&
    (/^[\d.]$/.test(event.key) || event.key === 'Backspace')
  ) {
    event.preventDefault()
    keyPress(event.key === 'Backspace' ? 'delete' : event.key)
  }
}
</script>
