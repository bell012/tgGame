<template>
  <li class="min-w-0 rounded-[15px] bg-bg-2 px-2.5 pb-2.5 pt-[13.333px]">
    <div class="flex items-start justify-between gap-2 font-bold">
      <span class="min-w-0 break-words text-[15px] leading-[18px]">{{
        props.selection.selection
      }}</span>
      <span
        class="shrink-0 text-lg leading-[22px] tabular-nums"
        :class="
          !props.single && props.selection.trend
            ? props.selection.trend === 'up'
              ? 'text-theme-primary'
              : 'text-secondary-2'
            : ''
        "
      >
        @{{ props.selection.odds.toFixed(2) }}
        <span
          v-if="!props.single && props.selection.trend"
          :aria-label="props.selection.trend === 'up' ? 'Odds increased' : 'Odds decreased'"
          >{{ props.selection.trend === 'up' ? '↑' : '↓' }}</span
        >
      </span>
    </div>
    <p
      class="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-xs font-medium leading-[15px] text-theme-primary"
    >
      <span v-if="props.selection.live" class="text-secondary-7">Live</span>
      <span v-if="props.selection.live" class="h-3 w-px bg-opacity-10" aria-hidden="true" />
      <span>{{ props.selection.marketTitle }}</span>
      <span class="h-3 w-px bg-opacity-10" aria-hidden="true" />
      <span>Decimal Odds</span>
    </p>
    <div class="mt-2 flex flex-col gap-1.5 break-words text-xs leading-[15px] text-text-2">
      <p>{{ props.selection.homeTeam }} <span class="ml-1">VS</span></p>
      <p>{{ props.selection.awayTeam }}</p>
    </div>
    <div class="mt-2 flex items-center justify-between gap-2">
      <p class="min-w-0 break-words text-xs leading-4 text-text-2">{{ props.selection.league }}</p>
      <button
        type="button"
        class="-my-1 flex h-6 w-6 shrink-0 items-center justify-center text-text-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-primary"
        :aria-label="`Remove ${props.selection.selection} from ${props.selection.fixture}`"
        :disabled="props.disabled"
        @click="emit('remove')"
      >
        <ClearIcon class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
    <p
      v-if="props.selection.mockBetStatus === 'closed'"
      class="mt-1 text-xs text-secondary-2"
      role="alert"
    >
      This market is closed. Remove it to continue.
    </p>
    <SportsH5StakeField
      v-if="props.single"
      class="mt-2.5"
      :value="props.selection.stake"
      :currency-symbol="props.currencySymbol"
      :label="`Stake for ${props.selection.selection}`"
      :active="props.active"
      :error="getH5StakeError(props.selection.stake)"
      :disabled="props.disabled || props.selection.mockBetStatus === 'closed'"
      @focus="emit('focus')"
    />
  </li>
</template>

<script setup lang="ts">
import ClearIcon from '@/static/svg/sports/clear-bets.svg'
import SportsH5StakeField from './SportsH5StakeField.vue'
import { getH5StakeError } from '../h5-bet'
import type { SportsBetSelection } from '../index'

const props = defineProps<{
  selection: SportsBetSelection
  single: boolean
  currencySymbol: string
  active: boolean
  disabled: boolean
}>()
const emit = defineEmits<{ remove: []; focus: [] }>()
</script>
