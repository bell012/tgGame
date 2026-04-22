<template>
  <!-- 顶部搜索 -->
  <div class="currency-select-trigger relative bg-[var(--color-input-level-2)] rounded-[10px]">
    <div
      class="text-[14px] h-[36px] flex items-center justify-between p-[8px] cursor-pointer gap-[8px]"
      @click="visible = true"
    >
      <div class="flex gap-[10px] min-w-0">
        <div v-if="selectedData" class="flex gap-[8px] items-center min-w-0">
          <SmartImage alt="" :src="selectedData.icon" class="size-[24px] object-contain" />
          <div class="text-[14px] leading-[20px] shrink-0">{{ selectedData.label }}</div>
          <div class="balance-text text-[14px] font-semibold shrink-0">
            <span class="balance-bracket">(</span>
            <span>{{ selectedBalanceText }}</span>
            <span class="balance-bracket">)</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-[8px] min-w-0">
        <div class="trigger-arrow-bg">
          <ArrowDownIcon class="trigger-arrow-icon" />
        </div>
      </div>
    </div>
    <!-- 搜索类型弹窗 -->
    <Teleport to="body" v-if="isMobile">
      <popup v-model:visible="visible" />
    </Teleport>
    <popup v-else class="desktop-popup" v-model:visible="visible" desktop />
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { QueryAcctInfoResult } from '@/api/interface/user'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { computed, onMounted, provide, ref, watch } from 'vue'
import Popup from './popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import SmartImage from '@/components/common/SmartImage.vue'
import {
  getCurrencySelectOptionsFromCache,
  type CurrencyOptionItem
} from '@/components/common/currency-selector/currency-select-options'

const isMobile = useIsMobile()
const visible = ref(false)

const localeStore = useLocaleStore()
const siteConfigStore = useSiteConfigStore()
const userStore = useUserStore()
const { config } = storeToRefs(siteConfigStore)
const { currentCurrency } = storeToRefs(localeStore)
const { userInfo } = storeToRefs(userStore)
const acctInfo = ref<QueryAcctInfoResult | null>(null)
const isLoggedIn = computed(() => Boolean(userInfo.value?.tradeToken))

const selectOptions = computed(() => getCurrencySelectOptionsFromCache(config.value))
provide('currency-select-options', selectOptions)

const selectedId = ref('')
provide('currency-select-selected-id', selectedId)

const selectedData = computed(() => {
  return selectOptions.value.find(i => i.value === selectedId.value) ?? selectOptions.value[0]
})

const normalizeCurrencyCode = (value: string | null | undefined) => {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

const balanceFieldMap = {
  BRL: 'balanceBrl',
  CNY: 'balanceCny',
  IDR: 'balanceIdr',
  INR: 'balanceInr',
  JPY: 'balanceJpy',
  KRW: 'balanceKrw',
  MXN: 'balanceMxn',
  MYR: 'balanceMyr',
  PHP: 'balancePhp',
  SGD: 'balanceSgd',
  USD: 'balanceUsd',
  USDT: 'balanceUsdt',
  VND: 'balanceVnd'
} as const

type BalanceFieldKey = (typeof balanceFieldMap)[keyof typeof balanceFieldMap]
type BalanceCarrier = Partial<Record<BalanceFieldKey, number>> & { balance?: number }

const getBalanceByCurrency = (data: BalanceCarrier | null | undefined, currencyCode: string) => {
  if (!data || !currencyCode) {
    return undefined
  }

  const balanceKey = balanceFieldMap[currencyCode as keyof typeof balanceFieldMap]
  if (balanceKey && typeof data[balanceKey] === 'number') {
    return data[balanceKey]
  }

  const dynamicBalanceKey = `balance${currencyCode.charAt(0)}${currencyCode.slice(1).toLowerCase()}`
  const dynamicBalanceValue = (data as Record<string, unknown>)[dynamicBalanceKey]
  if (typeof dynamicBalanceValue === 'number') {
    return dynamicBalanceValue
  }

  return typeof data.balance === 'number' ? data.balance : undefined
}

const formatBalance = (value: number | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0.00'
  }
  return value.toFixed(2)
}

const selectedBalanceText = computed(() => {
  const currencyCode = normalizeCurrencyCode(selectedData.value?.value)
  const balance = getBalanceByCurrency(acctInfo.value as BalanceCarrier | null, currencyCode)
  return formatBalance(balance)
})

const findValidCurrency = (code: string) => {
  if (!code || code === 'NONE') {
    return ''
  }
  return selectOptions.value.some(option => option.value === code) ? code : ''
}

const syncSelectedCurrency = () => {
  const selectedCode = findValidCurrency(normalizeCurrencyCode(selectedId.value))
  if (selectedCode) {
    selectedId.value = selectedCode
    return
  }

  const storedCode = findValidCurrency(normalizeCurrencyCode(currentCurrency.value))
  if (storedCode) {
    selectedId.value = storedCode
    return
  }

  selectedId.value = selectOptions.value[0]?.value ?? ''
}

const handleSelect = (item: CurrencyOptionItem) => {
  selectedId.value = item.value
  localeStore.setCurrency(item.value)
}

watch(selectOptions, syncSelectedCurrency, { immediate: true })
watch(currentCurrency, syncSelectedCurrency)

provide('currency-select-on-select', handleSelect)

const readCachedAcctInfo = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const cached = window.localStorage.getItem('acctInfo')
  if (!cached) {
    return null
  }

  try {
    return JSON.parse(cached) as QueryAcctInfoResult
  } catch (error) {
    console.error(error)
    return null
  }
}

const fetchAcctInfo = async () => {
  if (!isLoggedIn.value) {
    acctInfo.value = null
    return
  }

  try {
    const response = await Api.user.queryAcctInfo(
      {},
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )
    if (response?.result) {
      acctInfo.value = response.result
      return
    }
  } catch (error) {
    console.error('fetchAcctInfo failed', error)
  }

  acctInfo.value = readCachedAcctInfo()
}

onMounted(() => {
  if (isLoggedIn.value) {
    acctInfo.value = readCachedAcctInfo()
    void fetchAcctInfo()
    return
  }

  acctInfo.value = null
})
</script>

<style scoped lang="scss">
.desktop-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 100%;
}

.currency-select-trigger {
  border: none;
  background: var(--color-background-level-3) !important;
  box-shadow: inset 0 1px 0 var(--color-opacity-5);
}

.trigger-arrow-bg {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-opacity-10);
}

.trigger-arrow-icon {
  width: 14px;
  height: 14px;
  fill: none;
}

.balance-text {
  height: 20px;
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.balance-bracket {
  line-height: 1;
  position: relative;
  top: -0.5px;
}

:global(:root.light) .currency-select-trigger {
  background: #e8eef7 !important;
  box-shadow:
    0 2px 6px rgba(24, 38, 64, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}
</style>
