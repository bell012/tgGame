<template>
  <aside
    class="fixed bottom-0 right-6 z-30 flex max-h-[min(915px,calc(100dvh-84px))] w-[390px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-t-lg bg-bg-1 font-inter text-text-1 shadow-2xl 2xl:right-[120px]"
    data-testid="sports-betslip"
    :data-state="panelState"
    :aria-label="t('sports.betSlip.title')"
    @keydown.esc.stop="collapse"
  >
    <header
      class="btn-primary flex h-[66px] shrink-0 items-center gap-2 px-5 text-text-4 !shadow-none"
      :inert="oddsSettingsOpen"
    >
      <button
        type="button"
        class="flex h-full min-w-0 flex-1 items-center text-left text-lg font-bold leading-[22px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-4"
        :aria-label="t(props.open ? 'sports.betSlip.collapse' : 'sports.betSlip.expand')"
        :aria-expanded="props.open"
        :aria-controls="panelId"
        @click="emit('toggle')"
      >
        <span class="truncate">{{ t('sports.betSlip.title') }}</span>
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
        :aria-label="t('sports.betSlip.refreshBalance')"
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
      class="flex min-h-0 flex-col"
      :aria-busy="isSubmitting"
      :inert="oddsSettingsOpen"
    >
      <BetResult
        v-if="props.result"
        :state="props.result"
        :reusing="props.reusing"
        class="min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        @dismiss="emit('dismissResult')"
        @history="emit('history')"
        @reuse="emit('reuse')"
      />
      <fieldset v-else class="contents" :disabled="isSubmitting">
        <div
          v-if="!props.selections.length"
          class="flex h-[168px] items-center justify-center gap-[19px] px-5"
        >
          <BetIcon class="h-[84px] w-[84px] shrink-0 text-theme-primary" aria-hidden="true" />
          <div class="w-[143px] min-w-0">
            <p class="text-[13px] font-extrabold leading-4">{{ t('sports.betSlip.emptyTitle') }}</p>
            <p class="mt-1.5 text-xs leading-[15px] text-text-2">
              {{ t('sports.betSlip.emptyDescription') }}
            </p>
          </div>
        </div>

        <div
          v-else
          class="min-h-0 overflow-y-auto overscroll-contain pt-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul class="flex flex-col gap-[10px] px-[9px]">
            <li
              v-for="selection in props.selections"
              :key="selection.id"
              class="flex min-w-0 overflow-hidden rounded-[9px] bg-bg-5"
            >
              <button
                type="button"
                class="flex w-9 shrink-0 items-center justify-center bg-bg-4 text-text-2 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
                :aria-label="
                  t('sports.betSlip.removeSelection', { selection: selection.selection })
                "
                @click="emit('remove', selection.id)"
              >
                <RemoveIcon class="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
              <div class="min-w-0 flex-1 p-2">
                <div
                  class="flex items-start justify-between gap-2 text-lg font-bold leading-[22px]"
                >
                  <span class="min-w-0 break-words">{{ selection.selection }}</span>
                  <span
                    class="flex shrink-0 items-center gap-[3px] tabular-nums"
                    :class="
                      selection.trend === 'up'
                        ? 'text-theme-primary'
                        : selection.trend === 'down'
                          ? 'text-secondary-2'
                          : ''
                    "
                  >
                    @{{ selection.odds.toFixed(2) }}
                    <OddsDownIcon
                      v-if="selection.trend"
                      class="h-5 w-5"
                      :class="{ 'rotate-180': selection.trend === 'up' }"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <p class="mt-3 break-words text-base leading-[19px] text-theme-primary">
                  {{ selection.market }}
                </p>
                <div
                  class="mt-[9px] flex flex-wrap items-start gap-x-1.5 gap-y-1.5 break-words font-['PingFang_SC',sans-serif] text-sm leading-5 text-text-2"
                >
                  <span class="min-w-0 max-w-full">{{ selection.homeTeam }}</span>
                  <span>{{ t('sports.betSlip.versus') }}</span>
                  <span class="min-w-0 max-w-full">{{ selection.awayTeam }}</span>
                </div>
                <p
                  v-if="selection.league && !(props.mode === 'single' && selection.stakeError)"
                  class="mt-[9px] break-words font-['PingFang_SC',sans-serif] text-sm leading-5 text-text-2"
                >
                  {{ selection.league }}
                </p>
                <p
                  v-if="
                    props.mode === 'parlay' &&
                    selection.stakeError &&
                    selection.betStatus !== 'open'
                  "
                  class="mt-2 text-xs text-secondary-2"
                  role="alert"
                >
                  {{ selection.stakeError }}
                </p>
                <StakeInput
                  v-if="props.mode === 'single'"
                  class="mt-3"
                  :value="selection.stake"
                  :currency-symbol="props.currencySymbol"
                  :label="t('sports.betSlip.stakeFor', { selection: selection.selection })"
                  :error="selection.stakeError"
                  :placeholder="selection.limitText"
                  :disabled="isSubmitting"
                  @update="emit('stake', selection.id, $event)"
                  @focus="emit('focusStake', selection.id, 'single')"
                  @max="emit('max', selection.id, 'single')"
                />
              </div>
            </li>
          </ul>

          <div v-if="props.mode === 'parlay'" class="mt-[10px] flex flex-col gap-[10px]">
            <div v-for="parlay in props.parlays" :key="parlay.id" class="min-w-0">
              <div
                class="mx-[9px] flex min-h-[60px] items-center gap-3 rounded-xl bg-bg-4 py-[9px] pl-[9px] pr-1.5"
              >
                <span class="flex shrink-0 items-center gap-3 text-base font-bold">
                  {{ parlay.label }}
                  <span v-if="parlay.odds !== undefined" class="tabular-nums text-theme-primary"
                    >@{{ parlay.odds.toFixed(2) }}</span
                  >
                </span>
                <div class="flex min-w-0 flex-1 items-center gap-1.5">
                  <span class="shrink-0 text-base">{{ parlay.combinationCount }}x</span>
                  <StakeInput
                    class="flex-1"
                    :value="parlay.stake"
                    :currency-symbol="props.currencySymbol"
                    :label="t('sports.betSlip.stakeFor', { selection: parlay.label })"
                    :error="parlay.stakeError"
                    :placeholder="parlay.limitText"
                    :disabled="isSubmitting"
                    @update="emit('parlayStake', parlay.id, $event)"
                    @focus="emit('focusStake', parlay.id, 'parlay')"
                    @max="emit('max', parlay.id, 'parlay')"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="props.selections.length"
          class="relative flex shrink-0 gap-2 overflow-x-auto px-3 py-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          :class="props.mode === 'parlay' ? 'mt-[9px]' : 'mt-[17px]'"
        >
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            :class="[quickAmountClass, amountClass(activeStake, amount)]"
            :aria-pressed="Number(activeStake) === amount"
            @click="setQuickAmount(amount)"
          >
            {{ amount }}
          </button>
          <button type="button" :class="quickEditClass" @click="editingAmounts = true">
            {{ t('sports.betSlip.edit') }}
          </button>
        </div>

        <div v-if="props.selections.length" class="shrink-0 px-3 pb-[18px] pt-[17px]">
          <div class="flex min-h-5 items-center justify-between gap-3 text-sm leading-5">
            <span class="text-text-2">{{ t('sports.betSlip.winnings') }}</span>
            <span class="min-w-0 break-all text-right font-bold tabular-nums">
              {{ props.potentialReturnText }}
            </span>
          </div>
          <button
            type="button"
            class="mt-[18px] flex min-h-[49px] w-full items-center justify-center rounded-full bg-theme-primary px-4 py-3 text-sm font-bold text-text-4 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-1 disabled:cursor-not-allowed"
            :class="isSubmitting ? 'gap-[5px]' : 'gap-2.5'"
            :disabled="!props.canSubmit || isSubmitting"
            :aria-busy="isSubmitting"
            data-testid="sports-pc-submit"
            @click="emit('submit')"
          >
            <Loading
              v-if="isSubmitting"
              type="spinner"
              size="20"
              color="currentColor"
              aria-hidden="true"
            />
            <span v-if="isSubmitting" role="status">{{ t('sports.betSlip.confirming') }}</span>
            <template v-else>
              <span>{{ t('sports.betSlip.placeBet') }}</span>
              <span>{{ props.totalStakeText }}</span>
            </template>
          </button>
          <button
            type="button"
            class="mt-3 min-h-[49px] w-full rounded-full bg-bg-2 px-4 py-3 text-sm font-bold text-text-2 hover:bg-bg-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
            @click="emit('mode', props.mode === 'single' ? 'parlay' : 'single')"
          >
            {{
              t(props.mode === 'single' ? 'sports.betSlip.addToAcca' : 'sports.betSlip.singleBets')
            }}
          </button>
        </div>

        <footer class="flex shrink-0 gap-3 px-[18px] pb-[18px]">
          <button
            v-if="props.selections.length"
            type="button"
            class="flex h-[42px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-bg-2 text-text-2 hover:bg-bg-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
            :aria-label="t('sports.betSlip.clear')"
            @click="emit('clear')"
          >
            <ClearIcon class="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            ref="oddsSettingsTrigger"
            type="button"
            class="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-2 px-3 text-[13px] font-extrabold text-text-2 hover:bg-bg-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
            :class="props.selections.length ? 'h-[42px]' : 'h-10'"
            :aria-expanded="oddsSettingsOpen"
            :aria-controls="oddsSettingsId"
            @click="oddsSettingsOpen = !oddsSettingsOpen"
          >
            <SettingsIcon class="h-6 w-6 shrink-0" aria-hidden="true" />
            {{ t('sports.betSlip.oddsSettings') }}
          </button>
        </footer>
      </fieldset>
    </div>
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out [&>section]:transition-transform [&>section]:duration-200 [&>section]:ease-out"
      enter-from-class="opacity-0 [&>section]:translate-y-full"
      enter-to-class="opacity-100 [&>section]:translate-y-0"
      leave-active-class="transition-opacity duration-150 ease-in [&>section]:transition-transform [&>section]:duration-150 [&>section]:ease-in"
      leave-from-class="opacity-100 [&>section]:translate-y-0"
      leave-to-class="opacity-0 [&>section]:translate-y-full"
    >
      <div
        v-if="oddsSettingsOpen"
        class="absolute inset-0 z-20 flex items-end bg-mask-60-1 p-2"
        data-testid="sports-pc-odds-mask"
        @click.self="closeOddsSettings"
      >
        <section
          :id="oddsSettingsId"
          ref="oddsSettingsPanel"
          class="relative w-full rounded-xl bg-bg-2 p-4 shadow-xl outline-none"
          role="dialog"
          :aria-label="t('sports.betSlip.oddsSettings')"
          tabindex="-1"
          data-testid="sports-pc-odds-settings"
          @keydown.esc.stop="closeOddsSettings"
          @keydown.tab="trapOddsSettingsFocus"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-1.5">
              <h3 class="text-sm font-bold">{{ t('sports.betSlip.oddsSettings') }}</h3>
              <button
                type="button"
                class="flex h-6 w-6 items-center justify-center rounded-full text-text-3 hover:text-text-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
                :aria-label="t('sports.betSlip.oddsSettingsHelp')"
                :aria-describedby="oddsInfoOpen ? oddsInfoId : undefined"
                @mouseenter="oddsInfoOpen = true"
                @mouseleave="oddsInfoOpen = false"
                @focus="oddsInfoOpen = true"
                @blur="oddsInfoOpen = false"
                @click="oddsInfoOpen = true"
              >
                <InfoIcon class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded text-text-3 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
              :aria-label="t('sports.betSlip.closeOddsSettings')"
              @click="closeOddsSettings"
            >
              <CloseIcon class="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
          <p
            v-if="oddsInfoOpen"
            :id="oddsInfoId"
            role="tooltip"
            class="pointer-events-none absolute inset-x-3 bottom-full mb-2 rounded-lg bg-bg-3 px-3 py-2 text-xs leading-5 text-text-2 shadow-lg"
          >
            {{ t('sports.betSlip.oddsSettingsDescription') }}
          </p>
          <button
            type="button"
            role="checkbox"
            :aria-checked="props.acceptAnyOdds"
            :disabled="isSubmitting"
            class="mt-2 flex min-h-9 w-full items-center gap-2 text-left text-sm text-text-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
            @click="emit('acceptAnyOdds', !props.acceptAnyOdds)"
          >
            <component
              :is="props.acceptAnyOdds ? CheckedIcon : UncheckedIcon"
              class="h-4 w-4 shrink-0"
              :class="props.acceptAnyOdds ? 'text-theme-primary' : 'text-text-2'"
              aria-hidden="true"
            />
            {{ t('sports.betSlip.autoAcceptBetterOdds') }}
          </button>
        </section>
      </div>
    </Transition>
  </aside>
  <Teleport to="body">
    <div
      v-if="isSubmitting"
      class="pointer-events-none fixed right-0 top-16 z-[999999] flex min-h-12 w-[400px] max-w-full items-center gap-3 rounded-lg border border-opacity-10 bg-bg-6 px-3 py-4 text-base font-bold leading-4 text-text-1"
      role="status"
      aria-live="polite"
    >
      <span class="min-w-0 flex-1">{{ t('sports.betSlip.confirming') }}</span>
      <span
        class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-theme-primary border-r-transparent"
        aria-hidden="true"
      />
    </div>
  </Teleport>
  <AmountsDialog
    v-if="editingAmounts"
    :amounts="quickAmounts"
    :currency-symbol="props.currencySymbol"
    @close="editingAmounts = false"
    @save="saveQuickAmounts"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onDeactivated, ref, useId, watch } from 'vue'
import { Loading } from 'vant'
import BetIcon from '@/static/svg/sports/betslip-empty.svg'
import CaretIcon from '@/static/svg/sports/caret-up.svg'
import ClearIcon from '@/static/svg/sports/clear-bets.svg'
import CloseIcon from '@/static/svg/close.svg'
import RemoveIcon from '@/static/svg/sports/bet-slip/remove.svg'
import OddsDownIcon from '@/static/svg/sports/bet-slip/odds-down.svg'
import RefreshIcon from '@/static/svg/refresh.svg'
import SettingsIcon from '@/static/svg/sports/odds-settings.svg'
import InfoIcon from '@/static/svg/info.svg'
import CheckedIcon from '@/static/svg/sports/bet-slip/checked.svg'
import UncheckedIcon from '@/static/svg/sports/bet-slip/unchecked.svg'
import StakeInput from './stake-input.vue'
import AmountsDialog from './amounts-dialog.vue'
import BetResult from './pc-result.vue'
import { useI18n } from 'vue-i18n'
import type { SportsBetMode, SportsBetSelection, SportsParlay } from '../../shared/types'

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
  focusedStakeId?: string
  submitting: boolean
  acceptAnyOdds: boolean
  result?: 'success' | 'failed' | null
  reusing?: boolean
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
  acceptAnyOdds: [value: boolean]
  refresh: []
  dismissResult: []
  history: []
  reuse: []
  unsupported: [action: 'settings' | 'history' | 'share']
}>()

const panelId = useId()
const oddsSettingsId = useId()
const oddsSettingsOpen = ref(false)
const oddsInfoOpen = ref(false)
const oddsInfoId = useId()
const oddsSettingsTrigger = ref<HTMLButtonElement | null>(null)
const oddsSettingsPanel = ref<HTMLElement | null>(null)
onDeactivated(() => {
  oddsSettingsOpen.value = false
})
watch(oddsSettingsOpen, async opened => {
  oddsInfoOpen.value = false
  if (!opened) return
  await nextTick()
  // 滑入时只移动焦点，避免浏览器滚动投注单。
  if (oddsSettingsOpen.value) oddsSettingsPanel.value?.focus({ preventScroll: true })
})
const { t } = useI18n()
const singleQuickAmounts = ref([10, 20, 50, 100, 200])
const parlayQuickAmounts = ref([20, 50, 100, 200])
const quickAmounts = computed(() =>
  props.mode === 'single' ? singleQuickAmounts.value : parlayQuickAmounts.value
)
const editingAmounts = ref(false)
const isSubmitting = computed(() => props.submitting)
const panelState = computed(() =>
  !props.open
    ? 'collapsed'
    : isSubmitting.value
      ? 'submitting'
      : (props.result ?? (props.selections.length ? props.mode : 'empty'))
)
const quickAmountClass =
  'h-9 w-[66px] shrink-0 rounded-xl px-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary'
const quickEditClass = `${quickAmountClass} bg-bg-3 text-text-1 hover:bg-bg-2`

const focusedSingle = computed(
  () =>
    props.selections.find(selection => selection.id === props.focusedStakeId) ?? props.selections[0]
)
const focusedParlay = computed(
  () => props.parlays.find(parlay => parlay.id === props.focusedStakeId) ?? props.parlays[0]
)
const activeStake = computed(
  () => (props.mode === 'single' ? focusedSingle.value?.stake : focusedParlay.value?.stake) ?? ''
)
watch(
  [() => props.open, () => props.currencySymbol, () => props.submitting, () => props.mode],
  () => {
    editingAmounts.value = false
    oddsSettingsOpen.value = false
  }
)

function saveQuickAmounts(amounts: number[]) {
  if (props.mode === 'single') singleQuickAmounts.value = amounts
  else parlayQuickAmounts.value = amounts
  editingAmounts.value = false
}

function amountClass(stake: string, amount: number) {
  return Number(stake) === amount
    ? 'bg-theme-primary text-text-4'
    : 'bg-bg-3 text-text-1 hover:bg-bg-2'
}

function setQuickAmount(amount: number) {
  const target = props.mode === 'single' ? focusedSingle.value : focusedParlay.value
  if (isSubmitting.value) return
  if (target) emit('focusStake', target.id, props.mode)
  emit('quickAmount', amount)
}

function collapse() {
  if (oddsSettingsOpen.value) {
    closeOddsSettings()
    return
  }
  if (props.open) emit('toggle')
}

async function closeOddsSettings() {
  oddsSettingsOpen.value = false
  await nextTick()
  oddsSettingsTrigger.value?.focus({ preventScroll: true })
}

function trapOddsSettingsFocus(event: KeyboardEvent) {
  const buttons =
    oddsSettingsPanel.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
  if (!buttons?.length) return
  const first = buttons[0]
  const last = buttons[buttons.length - 1]
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === oddsSettingsPanel.value)) {
    event.preventDefault()
    last.focus({ preventScroll: true })
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus({ preventScroll: true })
  }
}
</script>
