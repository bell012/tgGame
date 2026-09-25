<template>
  <PopShell
    :model-value="betSlipOpen"
    transition-type="bottom-sheet"
    @update:model-value="onShellUpdate"
  >
    <section
      ref="panel"
      class="relative flex max-h-[min(670.667px,calc(100dvh-40px))] w-screen flex-col overflow-hidden rounded-t-[24px] bg-bg-2 font-inter text-text-1 outline-none [@media(max-height:560px)]:overflow-y-auto"
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
        <!-- 短屏时滚动整个弹层，避免键盘和按钮被裁掉。 -->
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
            <ul class="flex flex-col gap-[5px]">
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
            <div v-if="mode === 'parlay'" class="mt-[5px] flex flex-col gap-[5px]">
              <div
                v-for="parlay in parlays"
                :key="parlay.id"
                class="min-w-0 rounded-lg bg-bg-2 py-[3.333px] pl-2.5 pr-[3.333px]"
              >
                <div class="flex min-w-0 items-start gap-2.5">
                  <div class="flex h-[38px] shrink-0 items-center gap-2.5 text-[15px]">
                    <span>{{ parlay.label }}</span>
                    <span v-if="parlay.odds !== undefined" class="text-theme-primary"
                      >@{{ parlay.odds.toFixed(2) }}</span
                    >
                  </div>
                  <span class="ml-auto flex h-[38px] shrink-0 items-center text-sm text-text-2"
                    >{{ parlay.combinationCount }}x</span
                  >
                  <StakeField
                    class="min-w-0 flex-1"
                    :value="parlay.stake"
                    :currency-symbol="currencySymbol"
                    :label="`Stake for ${parlay.label}`"
                    :active="keyboardOpen && activeRow?.id === parlay.id"
                    :error="parlay.stakeError ?? ''"
                    :placeholder="parlay.limitText"
                    :hide-error="true"
                    :disabled="busy"
                    @focus="focusStake(parlay.id, 'parlay')"
                  />
                </div>
                <p
                  v-if="parlay.stakeError"
                  class="pb-[3.333px] pt-[6.667px] text-[11px] leading-[13.333px] text-secondary-2"
                  role="alert"
                >
                  {{ parlay.stakeError }}
                </p>
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
          class="relative shrink-0 px-2.5 pb-[calc(23.333px+env(safe-area-inset-bottom))] pt-2.5"
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
            <span class="text-[11px] text-text-2">{{ t('sports.betOddsAutoUpdate') }}</span>
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
              :disabled="!props.page.canSubmit.value || busy || editingAmounts"
              :aria-label="t('sports.betSubmitUnavailable')"
              data-testid="sports-h5-submit"
              @click="submit"
            >
              <RefreshIcon
                v-if="result === 'confirming'"
                class="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              <span v-if="result === 'confirming'" class="font-bold">Confirming ...</span>
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
          <p
            class="absolute bottom-[calc(4px+env(safe-area-inset-bottom))] inset-x-2.5 text-center text-[10px] leading-3 text-text-3"
          >
            {{ t('sports.betSubmitUnavailable') }}
          </p>
        </footer>
        <div v-else class="h-[env(safe-area-inset-bottom)] shrink-0" />
      </div>

      <div
        v-if="result === 'success' || result === 'failed'"
        class="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-8"
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          class="pointer-events-auto relative flex h-[138px] w-[160px] flex-col items-center rounded-[20px] bg-mask-60-1 pt-[30px] text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
          :class="result === 'success' ? 'text-theme-primary' : 'text-secondary-2'"
          :aria-label="
            result === 'success'
              ? 'Local simulation completed. Close result'
              : 'Local simulation failed. Dismiss result and edit stake'
          "
          @click="result === 'success' ? close() : (result = 'idle')"
        >
          <svg
            viewBox="0 0 50 50"
            class="h-[50px] w-[50px] shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="25" cy="25" r="24" />
            <path
              v-if="result === 'success'"
              d="m13 25 9 9 16-19"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path v-else d="m17 17 16 16m0-16L17 33" stroke-linecap="round" />
          </svg>
          <span class="mt-2.5 text-[15px] font-bold leading-[18px]">
            {{ result === 'success' ? 'Bet placed' : 'Bet failed' }}
          </span>
          <span class="absolute inset-x-1 bottom-2 text-[9px] leading-3 text-text-2"
            >Local simulation</span
          >
        </button>
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
import { useSportsH5Bet } from './h5'
import type { SportsPageState } from '../../index'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ page: SportsPageState }>()
const { t } = useI18n()
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

// 展开键盘后，将当前金额框滚入可见区域。
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
  // 编辑快捷金额时，让输入框接收按键。
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
