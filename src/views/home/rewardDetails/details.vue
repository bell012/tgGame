<template>
  <main class="relative z-10 px-3.5 py-3.5 text-[#f6fafc] sm:px-4.5 sm:pt-4">
    <section class="relative overflow-hidden rounded-[18px] bg-bg-2 px-[14px] pb-[14px] pt-5">
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-top bg-no-repeat bg-[length:100%_auto]"
        :style="{ backgroundImage: `url(${ellipseBg})` }"
      />
      <div class="relative z-10">
        <button
          type="button"
          class="absolute right-0 top-0 z-20 flex h-9 w-9 items-center justify-center rounded-lg text-text-1 transition"
          :aria-label="$t('rewardDetails.shareDialogAria')"
          @click="showShareModal = true"
        >
          <img :src="shareTriggerImg" alt="" class="h-6 w-6 object-contain" />
        </button>
        <p class="m-0 text-center text-lg text-text-1 font-bold">{{ $t('home.Profit') }}</p>
        <p
          class="mt-[10px] flex items-center justify-center gap-2 font-bold leading-[1.1] text-theme-primary"
        >
          <img :src="currencyIconUrl" alt="" class="h-[18px] w-[18px] shrink-0 object-contain" />
          <span class="text-[23px]">{{ row?.winAmount ?? '--' }}</span>
        </p>

        <div
          class="mt-5 flex justify-between rounded-[14px] bg-white/5 px-[14px] py-4 text-center text-[14px]"
        >
          <div class="metric-item">
            <p class="m-0 text-sm text-text-2">{{ $t('home.BetAmount') }}</p>
            <p class="mt-1.5 flex items-center justify-center gap-[5px] font-bold">
              <img
                :src="currencyIconUrl"
                alt=""
                class="h-[18px] w-[18px] shrink-0 object-contain"
              />
              <span class="text-text-1">{{ betAmountDisplay }}</span>
            </p>
          </div>
          <div class="metric-item">
            <p class="m-0 text-sm text-text-2">{{ $t('home.Multiplier') }}</p>
            <p class="mt-1.5 font-bold text-text-1">{{ row?.multiple ?? '--' }}</p>
          </div>
        </div>

        <div
          aria-hidden="true"
          class="relative mx-[-14px] mt-[14px] border-t border-dashed border-[rgba(228,238,246,0.2)] before:absolute before:left-[-8px] before:top-0 before:h-4 before:w-4 before:-translate-y-1/2 before:rounded-full before:bg-bg-1 before:content-[''] after:absolute after:right-[-8px] after:top-0 after:h-4 after:w-4 after:-translate-y-1/2 after:rounded-full after:bg-bg-1 after:content-['']"
        ></div>

        <div class="mt-[14px] flex items-center gap-[10px]">
          <img
            v-if="row?.avatar"
            :src="row.avatar"
            alt=""
            class="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
          />
          <div
            v-else
            class="h-[52px] w-[52px] shrink-0 rounded-full border-2 border-white/20 bg-[radial-gradient(circle_at_40%_25%,#7f5cf8,#48295d_63%,#291d35)]"
          />
          <div class="min-w-0 flex-1">
            <div class="flex justify-between gap-3 text-[15px] leading-[1.4]">
              <span class="shrink-0 text-text-2">{{ $t('home.Player') }}</span>
              <span class="truncate text-right text-text-2">{{ row?.nickName ?? '--' }}</span>
            </div>
            <div class="flex justify-between gap-3 text-[15px] leading-[1.4]">
              <span class="shrink-0 text-text-2">{{ $t('home.time') }}</span>
              <span class="truncate text-right text-text-2">{{ betTimeDisplay }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="mt-4 flex w-full cursor-pointer items-center rounded-[14px] border-0 bg-white/5 p-[10px] text-left transition hover:bg-white/10"
          @click="playGame"
        >
          <img
            :src="row?.src || placeholderImg"
            alt=""
            class="h-[52px] w-[52px] shrink-0 rounded-[12px] object-cover"
          />
          <div class="ml-[10px] min-w-0 flex-1 text-left">
            <p class="m-0 truncate text-sm font-bold lowercase">{{ row?.gameName ?? '--' }}</p>
            <p class="mt-0.5 truncate text-[15px] text-text-1">
              {{ row?.sysGameTypeName ?? '--' }}
            </p>
          </div>
          <span class="mr-1 shrink-0 text-[13px] text-text-1">{{ $t('gameDetail.playNow') }}</span>
          <ArrowRight2Icon class="h-3 w-3 shrink-0" />
        </button>
      </div>
    </section>
    <RewardShareModal v-model="showShareModal" :game-subtitle="String(row?.gameName ?? '')" />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ArrowRight2Icon from '@/static/svg/arrow_right2.svg?component'
import shareTriggerImg from '@/static/svg/coin/share.svg?url'
import placeholderImg from '@/static/img/home/errImg1.png'
import ellipseBg from '@/views/home/img/Ellipse.png'
import { getCurrencyIconByCode } from '@/components/common/currency-selector/currency-select-options'
import { formatUsDateTime12h } from '@/utils/date'
import { deriveBetAmountFromWinAndMultiplier } from '@/stores/deriveBetAmount'
import { navigateToName } from '@/utils/router'
import RewardShareModal from './RewardShareModal.vue'
import type { RewardDetailsRawItem } from './types'

const showShareModal = ref(false)

const props = withDefaults(
  defineProps<{
    rewardData?: RewardDetailsRawItem | null
  }>(),
  {
    rewardData: null
  }
)

const parseFromHistory = (): RewardDetailsRawItem | null => {
  if (typeof history === 'undefined') {
    return null
  }
  const raw = (history.state as { rewardDetailsRaw?: string } | undefined)?.rewardDetailsRaw
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as RewardDetailsRawItem
  } catch {
    return null
  }
}

const row = computed(() => props.rewardData ?? parseFromHistory())

const currencyIconUrl = computed(() => getCurrencyIconByCode(row.value?.currency))

const betTimeDisplay = computed(() => {
  const item = row.value
  if (!item) {
    return '--'
  }
  const raw = item.betTime ?? item.createTime ?? item.gameTime
  if (raw == null || String(raw).trim() === '') {
    return '--'
  }
  return formatUsDateTime12h(raw as string | number)
})

const betAmountDisplay = computed(() => {
  const item = row.value
  if (!item) {
    return '--'
  }
  const derived = deriveBetAmountFromWinAndMultiplier(item.winAmount, item.multiple)
  if (derived != null) {
    return Number(derived).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  const fallback = item.betAmount ?? item.gameAmount
  if (fallback == null || String(fallback).trim() === '') {
    return '--'
  }
  return String(fallback)
})
const playGame = () => {
  const item = row.value
  if (!item) {
    return
  }
  const rowId = item.gameId
  navigateToName('gameDetail', { params: { rowId } })
}
</script>
