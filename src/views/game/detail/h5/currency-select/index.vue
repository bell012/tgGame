<template>
  <div
    class="currency-select-trigger relative flex h-[35px] items-center gap-[5px] rounded-lg bg-opacity-6 px-2"
  >
    <button
      type="button"
      class="flex min-w-0 flex-1 items-center gap-[5px] text-[13px] font-semibold text-text-1"
      :aria-label="t('gameDetail.selectedCurrency')"
      :disabled="disabled"
      @click="visible = true"
    >
      <SmartImage
        v-if="selectedData"
        :src="selectedData.icon"
        alt=""
        class="size-5 shrink-0 object-contain"
      />
      <span class="min-w-0 truncate" :title="selectedBalanceText">{{ selectedBalanceText }}</span>
    </button>
    <button
      type="button"
      class="flex h-full shrink-0 items-center text-text-1 disabled:opacity-50"
      :aria-label="t('gameDetail.refreshBalance')"
      :aria-busy="isRefreshBusy"
      :disabled="isRefreshBusy"
      @click="refreshBalance"
    >
      <RefreshIcon
        class="size-[15px] motion-reduce:animate-none"
        :class="{ 'animate-[spin_2s_linear_infinite]': isRefreshBusy }"
        aria-hidden="true"
      />
    </button>
    <button
      type="button"
      class="ml-auto flex h-full shrink-0 items-center pl-1 text-icon-2"
      :aria-label="t('gameDetail.selectCurrencyTitle')"
      :disabled="disabled"
      @click="visible = true"
    >
      <component
        :is="casinoIcons.dropdown_chevron"
        class="size-[10px] fill-current [&_path]:fill-current"
        aria-hidden="true"
      />
    </button>
    <Teleport to="body" v-if="isMobile">
      <popup v-model:visible="visible" :change-currency="changeCurrency" :disabled="disabled" />
    </Teleport>
    <popup
      v-else
      class="absolute left-0 top-[calc(100%+10px)] w-full"
      v-model:visible="visible"
      desktop
      :change-currency="changeCurrency"
      :disabled="disabled"
    />
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import RefreshIcon from '@/static/svg/game/detail/top/refresh.svg?component'
import { casinoIcons } from '@/static/svg/casino'
import { computed, onBeforeUnmount, onDeactivated, provide, ref, watch } from 'vue'
import Popup from './popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import SmartImage from '@/components/common/SmartImage.vue'
import type { CurrencyOptionItem } from '@/components/common/currency-selector/currency-select-options'

const { t } = useI18n()
defineProps<{
  changeCurrency: (value: string) => Promise<boolean>
  disabled: boolean
}>()
const userStore = useUserStore()
const refreshFeedbackActive = ref(false)
const isRefreshBusy = computed(() => userStore.isRefreshingBalance || refreshFeedbackActive.value)
let refreshFeedbackTimer: ReturnType<typeof setTimeout> | undefined

const clearRefreshFeedback = () => {
  clearTimeout(refreshFeedbackTimer)
  refreshFeedbackTimer = undefined
  refreshFeedbackActive.value = false
}

const refreshBalance = () => {
  if (isRefreshBusy.value) return
  // 至少展示一圈动画，不延迟余额请求或结果更新。
  refreshFeedbackActive.value = true
  refreshFeedbackTimer = setTimeout(clearRefreshFeedback, 2000)
  void userStore.refreshBalance()
}
onDeactivated(clearRefreshFeedback)
onBeforeUnmount(clearRefreshFeedback)

const isMobile = useIsMobile()
const visible = ref(false)
const emit = defineEmits<{
  change: [value: CurrencyOptionItem | undefined]
}>()
const {
  currentBalanceAmountText,
  currentCurrencyCode,
  currentCurrencyOption,
  currencyOptions,
  currencySelectOptions,
  setDisplayCurrency
} = useDisplayCurrency()

const selectOptions = computed(() => currencySelectOptions.value)
provide('currency-select-options', selectOptions)
provide('currency-select-balance-options', currencyOptions)

const selectedId = computed(() => currentCurrencyCode.value)
provide('currency-select-selected-id', selectedId)

const selectedData = computed(() => {
  return currentCurrencyOption.value ?? selectOptions.value[0]
})

const selectedBalanceText = computed(() => {
  return currentBalanceAmountText.value
})

const handleSelect = (item: CurrencyOptionItem) => {
  setDisplayCurrency(item.value)
  emit('change', item)
}

provide('currency-select-on-select', handleSelect)

watch(
  selectedData,
  value => {
    emit('change', value)
  },
  { immediate: true }
)
</script>
