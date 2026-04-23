<template>
  <div class="font-['Inter']">
    <div
      v-if="orderItem?.status === 'processing'"
      class="w-full rounded-xl bg-bg-2 px-4 pt-4 pb-4 sm:px-4 sm:pt-8"
    >
      <div class="flex items-center border-b border-input-1 p-3 text-text-1">
        <ProcessingIcon class="mr-4 h-5 w-5 shrink-0" />
        <div class="min-w-0 flex-1 overflow-hidden">
          <p class="withdraw-order-status-marquee whitespace-nowrap text-sm sm:text-base">
            {{ statusTitle }}
          </p>
        </div>
      </div>
      <div class="pt-6">
        <div class="flex items-end justify-center">
          <p class="text-text-1 text-xl font-bold leading-none capitalize sm:text-[40px]">
            {{ amountValue }}
          </p>
          <p class="text-text-1 text-base font-bold leading-none capitalize sm:text-lg">
            {{ amountCurrency }}
          </p>
        </div>
        <p class="mt-2 text-center text-sm leading-normal text-text-1 sm:text-base">
          {{ t('withdraw.amount') }}
        </p>
      </div>
      <div class="mt-8 grid gap-5 sm:gap-4 rounded-lg bg-bg-4 px-5 py-3">
        <div
          v-for="item in processingDetailRows"
          :key="item.label"
          class="flex items-center justify-between font-['Inter']"
        >
          <p class="text-sm text-text-3 sm:text-base">{{ item.label }}</p>
          <div class="flex items-center text-sm text-text-1 sm:text-base">
            <div
              v-if="item.type === 'method'"
              class="mr-1 flex aspect-square w-5 items-center justify-center rounded-full text-common-100"
            >
              <img
                v-if="methodIcon"
                :src="methodIcon"
                class="h-5 w-5 rounded-full object-contain"
              />
              <span v-else class="text-[10px] font-bold">{{ methodBadge }}</span>
            </div>
            <span :class="item.type === 'orderNo' ? 'max-w-[180px] truncate' : ''">
              {{ item.value }}
            </span>
            <button
              v-if="item.copyValue"
              type="button"
              class="ml-3 w-[18px]"
              @click="copyText(item.copyValue)"
            >
              <CopyIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="w-full rounded-xl bg-bg-2 px-4 pt-10 pb-8">
      <div class="flex flex-col items-center font-['Inter']">
        <div class="h-[60px] w-[60px] sm:h-[76px] sm:w-[76px]">
          <OrderCancelledIcon
            v-if="orderItem?.status === 'cancelled'"
            class="h-[60px] w-[60px] sm:h-[76px] sm:w-[76px] text-common-100"
          />
          <OrderCompletedIcon
            v-else
            class="h-[60px] w-[60px] sm:h-[76px] sm:w-[76px] text-common-100"
          />
        </div>
        <p class="mt-4 text-sm font-bold leading-normal text-text-1 sm:text-base">
          {{ resultStatusText }}
        </p>
      </div>
      <div class="mt-6 grid gap-5 sm:gap-4 rounded-lg bg-bg-4 px-5 py-3">
        <div
          v-for="item in detailRows"
          :key="item.label"
          class="flex items-center justify-between font-['Inter']"
        >
          <p class="text-sm text-text-3 sm:text-base">{{ item.label }}</p>
          <div class="flex items-center text-sm text-text-1 sm:text-base">
            <div
              v-if="item.type === 'method'"
              class="mr-1 flex aspect-square w-5 items-center justify-center rounded-full text-common-100"
            >
              <img
                v-if="methodIcon"
                :src="methodIcon"
                class="h-5 w-5 rounded-full object-contain"
              />
              <span v-else class="text-[10px] font-bold">{{ methodBadge }}</span>
            </div>
            <span :class="item.type === 'orderNo' ? 'max-w-[180px] truncate' : ''">
              {{ item.value }}
            </span>
            <button
              v-if="item.copyValue"
              type="button"
              class="ml-3 w-[18px]"
              @click="copyText(item.copyValue)"
            >
              <CopyIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 rounded-lg bg-bg-2 p-5 text-sm font-normal sm:text-base sm:leading-normal">
      <p class="text-[#F44854]">{{ t('withdraw.reminder') }}</p>
      <p class="mt-4 text-text-3">
        · {{ t('withdraw.order_help_text') }}
        <button type="button" class="text-[#ff9d2b]">
          {{ t('withdraw.chat_with_us') }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import type { WithdrawOrderViewData } from './shared/useWithdrawFlow'
import CopyIcon from '@/static/svg/copy.svg?component'
import ProcessingIcon from '@/static/svg/deposit/record.svg?component'
import OrderCancelledIcon from '@/static/svg/withdraw/order_cancelled.svg?component'
import OrderCompletedIcon from '@/static/svg/withdraw/order_completed.svg?component'

interface Props {
  orderItem?: WithdrawOrderViewData
}

const props = defineProps<Props>()
const { t } = useI18n()

const statusTitle = computed(() =>
  props.orderItem?.status === 'completed'
    ? t('withdraw.order_completed_title')
    : t('withdraw.order_processing_title')
)
const resultStatusText = computed(() =>
  props.orderItem?.status === 'cancelled'
    ? t('withdraw.order_cancelled')
    : t('withdraw.order_completed')
)

const methodBadge = computed(() => props.orderItem?.methodLabel.slice(0, 1).toUpperCase())
const methodIcon = computed(() => String(props.orderItem?.methodIcon ?? '').trim())
const amountParts = computed(() => {
  const value = String(props.orderItem?.amountText || '').trim()
  const match = value.match(/^([\d.,]+)\s*([A-Za-z]+)?$/)

  if (!match) {
    return { value, currency: '' }
  }

  return {
    value: match[1] ?? value,
    currency: match[2] ?? ''
  }
})

const amountValue = computed(() => amountParts.value.value)
const amountCurrency = computed(() => amountParts.value.currency)
const detailRows = computed(() => [
  {
    label: t('withdraw.amount'),
    value: props.orderItem?.amountText,
    type: 'amount' as const
  },
  {
    label: t('withdraw.order_no'),
    value: props.orderItem?.orderNo,
    copyValue: props.orderItem?.orderNo,
    type: 'orderNo' as const
  },
  {
    label: t('withdraw.created_at'),
    value: props.orderItem?.createdAt,
    type: 'createdAt' as const
  },
  {
    label: t('withdraw.withdraw_method'),
    value: props.orderItem?.methodLabel,
    type: 'method' as const
  }
])
const processingDetailRows = computed(() => detailRows.value.slice(1))

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    showToast({
      message: t('betDetails.copy'),
      type: 'success'
    })
  } catch {
    showToast({
      message: t('common.error'),
      type: 'fail'
    })
  }
}
</script>
<style scoped>
.withdraw-order-status-marquee {
  display: inline-block;
  min-width: 100%;
  padding-left: 100%;
  animation: withdraw-order-status-marquee 10s linear infinite;
}

@keyframes withdraw-order-status-marquee {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-100%);
  }
}
</style>
