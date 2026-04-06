<template>
  <div class="font-['Inter']">
    <div
      v-if="status === 'processing'"
      class="w-full rounded-xl bg-bg-2 px-4 pt-4 pb-4 sm:px-4 sm:pt-8"
    >
      <div class="flex items-center border-b border-input-1 p-3 text-text-1">
        <ProcessingIcon class="mr-4 h-5 w-5 shrink-0" />
        <p class="overflow-hidden whitespace-nowrap text-sm sm:text-base">
          {{ statusTitle }}
        </p>
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
          v-for="item in detailRows"
          :key="item.label"
          class="flex items-center justify-between font-['Inter']"
        >
          <p class="text-sm text-text-3 sm:text-base">{{ item.label }}</p>
          <div class="flex items-center text-sm text-text-1 sm:text-base">
            <div
              v-if="item.type === 'method'"
              class="mr-1 flex aspect-square w-5 items-center justify-center rounded-full bg-theme-primary text-common-100"
            >
              <span class="text-[10px] font-bold">{{ methodBadge }}</span>
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
        <div class="h-[76px] w-[76px]">
          <CheckIcon class="h-[76px] w-[76px] text-[#7BE36A]" />
        </div>
        <p class="mt-4 text-sm font-bold leading-normal text-text-1 sm:text-base">
          {{ t('withdraw.order_completed') }}
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
              class="mr-1 flex aspect-square w-5 items-center justify-center rounded-full bg-theme-primary text-common-100"
            >
              <span class="text-[10px] font-bold">{{ methodBadge }}</span>
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
import type { WithdrawOrderStatus } from './shared/types'
import CopyIcon from '@/static/svg/copy.svg?component'
import ProcessingIcon from '@/static/svg/deposit/record.svg?component'
import CheckIcon from '@/static/svg/login/check.svg?component'

interface Props {
  status: WithdrawOrderStatus
  amountText: string
  orderNo: string
  createdAt: string
  methodLabel: string
}

const props = defineProps<Props>()
const { t } = useI18n()

const statusTitle = computed(() =>
  props.status === 'completed'
    ? t('withdraw.order_completed_title')
    : t('withdraw.order_processing_title')
)

const methodBadge = computed(() => props.methodLabel.slice(0, 1).toUpperCase())
const amountParts = computed(() => {
  const value = String(props.amountText || '').trim()
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
    value: props.amountText,
    type: 'amount' as const
  },
  {
    label: t('withdraw.order_no'),
    value: props.orderNo,
    copyValue: props.orderNo,
    type: 'orderNo' as const
  },
  {
    label: t('withdraw.created_at'),
    value: props.createdAt,
    type: 'createdAt' as const
  },
  {
    label: t('withdraw.withdraw_method'),
    value: props.methodLabel,
    type: 'method' as const
  }
])

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
