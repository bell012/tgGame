<template>
  <p
    class="m-0 flex max-w-full flex-wrap items-center gap-[5px] rounded-[5px] bg-hash-chat-win-frame px-2 py-1 text-[13px] leading-[18px] text-text-1"
  >
    <span aria-hidden="true">🎉</span>
    <span class="font-inter font-medium text-theme-primary">{{ t('hashGame.chatMe') }}</span>
    <span v-if="amount !== null">{{ t('hashGame.chatRoundPayout') }}:</span>
    <strong v-if="amount !== null" class="font-inter font-semibold text-theme-primary">{{
      formattedAmount
    }}</strong>
    <span v-else>{{ (content ?? '').replace(/^\s*(?:我|Me)\s*/iu, '') }}</span>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCurrencySymbol } from '@/utils/locale'

const props = defineProps<{ content?: string; payoutAmount?: number; currency?: string }>()
const { t } = useI18n()
const parsed = computed(() => /([\d,.]+)\s*([A-Za-z]{2,8})\s*$/u.exec(props.content ?? ''))
const amount = computed(() => {
  const value = props.payoutAmount ?? Number(parsed.value?.[1]?.replace(/,/g, ''))
  return Number.isFinite(value) ? value : null
})
const formattedAmount = computed(() => {
  if (amount.value === null) return ''
  const currency = props.currency || parsed.value?.[2] || ''
  const symbol = currency ? getCurrencySymbol(currency).trim() : ''
  return `${symbol} ${amount.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`.trim()
})
</script>
