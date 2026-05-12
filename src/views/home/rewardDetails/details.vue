<template>
  <main class="relative z-10 px-3.5 py-3.5 text-[#f6fafc] sm:px-4.5 sm:pt-4">
    <section class="relative overflow-hidden rounded-[18px] bg-bg-2 px-[14px] pb-[14px] pt-5">
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-top bg-no-repeat bg-[length:100%_auto]"
        :style="{ backgroundImage: `url(${ellipseBg})` }"
      />
      <div class="relative z-10">
        <p class="m-0 text-center text-lg font-bold">{{ $t('home.Profit') }}</p>
        <p
          class="mt-[10px] flex items-center justify-center gap-2 font-bold leading-[1.1] text-[#22dd87]"
        >
          <span
            class="inline-flex h-[14px] w-[22px] items-center justify-center rounded-[2px] bg-[linear-gradient(90deg,#213fca_0_50%,#c93f46_50%_100%)] text-[14px] font-bold tracking-[0.3px] text-white"
            >PH</span
          >
          <span class="text-[23px]">{{ display.profit }}</span>
        </p>

        <div
          class="mt-5 flex justify-between rounded-[14px] bg-white/5 px-[14px] py-4 text-center text-[14px]"
        >
          <div class="metric-item">
            <p class="m-0 text-sm text-text-2">{{ $t('home.BetAmount') }}</p>
            <p class="mt-1.5 flex items-center justify-center gap-[5px] font-bold">
              <span
                class="inline-flex h-[14px] w-[22px] items-center justify-center rounded-[2px] bg-[linear-gradient(90deg,#213fca_0_50%,#c93f46_50%_100%)] text-[14px] font-bold tracking-[0.3px] text-white"
                >PH</span
              >
              <span>{{ display.betAmount }}</span>
            </p>
          </div>
          <div class="metric-item">
            <p class="m-0 text-sm text-text-2">{{ $t('home.Multiplier') }}</p>
            <p class="mt-1.5 font-bold">{{ display.multiplier }}</p>
          </div>
        </div>

        <div
          aria-hidden="true"
          class="relative mx-[-14px] mt-[14px] border-t border-dashed border-[rgba(228,238,246,0.2)] before:absolute before:left-[-8px] before:top-0 before:h-4 before:w-4 before:-translate-y-1/2 before:rounded-full before:bg-bg-1 before:content-[''] after:absolute after:right-[-8px] after:top-0 after:h-4 after:w-4 after:-translate-y-1/2 after:rounded-full after:bg-bg-1 after:content-['']"
        ></div>

        <div class="mt-[14px] flex items-center gap-[10px]">
          <img
            v-if="display.vipAvatarUrl"
            :src="display.vipAvatarUrl"
            alt=""
            class="h-[52px] w-[52px] shrink-0 rounded-full border-2 border-white/20 object-cover"
          />
          <div
            v-else
            class="h-[52px] w-[52px] shrink-0 rounded-full border-2 border-white/20 bg-[radial-gradient(circle_at_40%_25%,#7f5cf8,#48295d_63%,#291d35)]"
          />
          <div class="min-w-0 flex-1">
            <div class="flex justify-between gap-3 text-[15px] leading-[1.4]">
              <span class="shrink-0 text-[#9ca7b1]">{{ $t('home.Player') }}</span>
              <span class="truncate text-right text-[#f5f8fc]">{{ display.userName }}</span>
            </div>
            <div class="flex justify-between gap-3 text-[15px] leading-[1.4]">
              <span class="shrink-0 text-[#9ca7b1]">Time</span>
              <span class="truncate text-right text-[#f5f8fc]">{{ display.betTime }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="mt-4 flex w-full items-center rounded-[14px] border-0 bg-white/5 p-[10px]"
        >
          <img
            :src="display.gameCover"
            alt=""
            class="h-[52px] w-[52px] shrink-0 rounded-[12px] object-cover"
          />
          <div class="ml-[10px] min-w-0 flex-1 text-left">
            <p class="m-0 truncate text-sm font-bold lowercase">{{ display.gameName }}</p>
            <p class="mt-0.5 truncate text-[15px] text-[#b2bcc4]">{{ display.gameType }}</p>
          </div>
          <span class="mr-1 shrink-0 text-[13px] text-[#d7dee4]">{{
            $t('gameDetail.playNow')
          }}</span>
          <ArrowRight2Icon class="h-3 w-3 shrink-0" />
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ArrowRight2Icon from '@/static/svg/arrow_right2.svg?component'
import placeholderImg from '@/static/img/home/errImg1.png'
import ellipseBg from '@/views/home/img/Ellipse.png'
import type { RewardDetailsState } from './types'

const props = withDefaults(
  defineProps<{
    rewardData?: RewardDetailsState | null
  }>(),
  {
    rewardData: null
  }
)

const parseFromHistory = (): RewardDetailsState | null => {
  if (typeof history === 'undefined') {
    return null
  }
  const raw = (history.state as { rewardDetails?: string } | undefined)?.rewardDetails
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as RewardDetailsState
  } catch {
    return null
  }
}

const FALLBACK: RewardDetailsState = {
  profit: '0.00',
  betAmount: '--',
  multiplier: '--',
  userName: '--',
  betTime: '--',
  gameName: '--',
  gameType: 'Slots',
  gameCover: placeholderImg
}

const display = computed(() => props.rewardData ?? parseFromHistory() ?? FALLBACK)
</script>
