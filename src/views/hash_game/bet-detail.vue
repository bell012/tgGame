<template>
  <div class="fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1">
    <H5Header
      :title="t('betDetails.title')"
      :show-sort="true"
      :right-icon="KefuIcon"
      @sort="openKefuPopup"
    />

    <main v-if="bet" class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-[14px]">
      <section class="rounded-[8px] bg-bg-2 px-[14px] pb-[14px] pt-[30px]">
        <div class="mb-[30px] flex flex-col items-center">
          <img
            :src="bet.currencyIcon"
            :alt="bet.currencyCode"
            class="mb-[10px] size-[50px] object-contain"
          />
          <strong
            class="text-[25px] font-bold"
            :class="bet.profitLoss >= 0 ? 'text-theme-primary' : 'text-secondary-2'"
          >
            {{ bet.profitLoss >= 0 ? '+' : '-' }}{{ Math.abs(bet.profitLoss).toFixed(2) }}
          </strong>
          <span class="mt-[5px] text-[14px] text-text-1">
            {{ t(bet.profitLoss >= 0 ? 'betHistory.win' : 'betHistory.loss') }}
          </span>
        </div>

        <div class="space-y-[20px] rounded-[8px] bg-bg-4 p-[14px]">
          <div class="flex items-center justify-between gap-3">
            <span class="shrink-0 text-[14px] text-text-3">{{ t('hashGame.game') }}</span>
            <span class="text-[14px] text-text-1">{{ bet.period }}s hash</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="shrink-0 text-[14px] text-text-3">{{ t('hashGame.betId') }}</span>
            <div class="flex min-w-0 items-center gap-1 text-[14px] text-text-1">
              <span class="min-w-0 truncate">{{ bet.id }}</span>
              <button type="button" class="shrink-0" @click="copyValue(bet.id)">
                <CopyIcon class="size-[16px] text-icon-2" />
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="shrink-0 text-[14px] text-text-3">{{ t('hashGame.betSelection') }}</span>
            <span
              class="flex size-[20px] items-center justify-center rounded-full bg-[#22A89A] text-[12px] text-text-1"
            >
              {{ t(`hashGame.${bet.selection}Mark`) }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="shrink-0 text-[14px] text-text-3">{{ t('hashGame.betAmount') }}</span>
            <span class="text-[14px] text-text-1"
              >{{ bet.betAmount.toFixed(2) }} {{ bet.currencyCode }}</span
            >
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="shrink-0 text-[14px] text-text-3">{{ t('hashGame.resultBlock') }}</span>
            <div class="flex min-w-0 items-center gap-1 text-[14px] text-text-1">
              <span class="min-w-0 truncate">{{ bet.block }}</span>
              <button type="button" class="shrink-0" @click="copyValue(bet.block)">
                <CopyIcon class="size-[16px] text-icon-2" />
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="shrink-0 text-[14px] text-text-3">{{ t('hashGame.blockHash') }}</span>
            <div class="flex min-w-0 items-center gap-1 text-[14px]">
              <span class="min-w-0 truncate text-text-1">{{ bet.blockHash }}</span>
              <button type="button" class="shrink-0" @click="copyValue(bet.blockHash)">
                <CopyIcon class="size-[16px] text-icon-2" />
              </button>
              <button type="button" class="shrink-0 text-theme-primary">
                {{ t('hashGame.verify') }}
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="shrink-0 text-[14px] text-text-3">{{ t('hashGame.betTime') }}</span>
            <span class="text-right text-[14px] text-text-1">{{ bet.betTime }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import KefuIcon from '@/static/svg/vip/kefu.svg?component'
import CopyIcon from '@/static/svg/copy.svg?component'
import { useOnlineCustomerService } from '@/composables/useOnlineCustomerService'
import { globalShowToast } from '@/utils/toast'
import type { RecentBetRecord } from './index'

type HashGameBetDetail = RecentBetRecord & {
  period: number
  currencyCode: string
  currencyIcon: string
}

const { t } = useI18n()
const router = useRouter()
const { open: openOnlineCustomer } = useOnlineCustomerService()
const bet = ref<HashGameBetDetail | null>(null)

onMounted(() => {
  const state = history.state as { hashGameBet?: string }
  if (!state.hashGameBet) {
    router.back()
    return
  }

  try {
    bet.value = JSON.parse(state.hashGameBet) as HashGameBetDetail
  } catch {
    router.back()
  }
})

const openKefuPopup = () => openOnlineCustomer()

const copyValue = async (value: string) => {
  await navigator.clipboard.writeText(value)
  globalShowToast(t('betDetails.copy'))
}
</script>
