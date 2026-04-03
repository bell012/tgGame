<template>
  <!-- 顶部搜索 -->
  <div class="relative bg-[var(--color-input-level-2)] rounded-[10px]">
    <div
      class="text-[14px] h-[36px] flex items-center justify-between p-[8px] cursor-pointer gap-[8px]"
      @click="visible = true"
    >
      <div class="flex gap-[10px] min-w-0">
        <div v-if="selectedData" class="flex gap-[8px] items-center min-w-0">
          <img alt="" :src="selectedData.icon" class="size-[24px] object-contain" />
          <div class="text-[14px] shrink-0">{{ selectedData.label }}</div>
          <div class="text-[14px] font-semibold truncate">({{ selectedBalanceText }})</div>
        </div>
      </div>
      <div class="ml-auto flex items-center gap-[8px] min-w-0">
        <div class="bg-[var(--color-text-level-3)] rounded-md">
          <div class="icon transition-all -rotate-90">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
              ></path>
            </svg>
          </div>
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
import { computed, onMounted, provide, ref, watch } from 'vue'
import Popup from './popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useLocaleStore } from '@/stores/locale'
import { storeToRefs } from 'pinia'
import {
  getCurrencySelectOptionsFromCache,
  type CurrencyOptionItem
} from '../../common/currency-select-options'

const isMobile = useIsMobile()
const visible = ref(false)

const localeStore = useLocaleStore()
const siteConfigStore = useSiteConfigStore()
const { config } = storeToRefs(siteConfigStore)
const { currentCurrency } = storeToRefs(localeStore)
const acctInfo = ref<QueryAcctInfoResult | null>(null)

const selectOptions = computed(() => getCurrencySelectOptionsFromCache(config.value))
provide('currency-select-options', selectOptions)

const selectedId = ref('')
provide('currency-select-selected-id', selectedId)

const selectedData = computed(() => {
  return selectOptions.value.find(i => i.value === selectedId.value) ?? selectOptions.value[0]
})

const emit = defineEmits<{
  change: [value: CurrencyOptionItem | undefined]
}>()

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
  emit('change', item)
}

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
  try {
    const response = await Api.user.queryAcctInfo({})
    if (response?.result) {
      acctInfo.value = response.result
      return
    }
  } catch (error) {
    console.error('fetchAcctInfo failed', error)
  }

  acctInfo.value = readCachedAcctInfo()
}

watch(selectOptions, syncSelectedCurrency, { immediate: true })
watch(currentCurrency, syncSelectedCurrency)
watch(
  selectedData,
  value => {
    emit('change', value)
  },
  { immediate: true }
)

onMounted(() => {
  acctInfo.value = readCachedAcctInfo()
  void fetchAcctInfo()
})
</script>

<style scoped lang="scss">
.desktop-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 100%;
}
.icon {
  width: 20px;
  height: 20px;
  padding: 2px;
  fill: currentColor;
}
</style>
