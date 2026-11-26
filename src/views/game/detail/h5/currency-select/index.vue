<template>
  <div
    class="currency-select-trigger relative flex items-center gap-2"
    :class="
      floating
        ? 'h-[34px] rounded-[10px] border border-[var(--game-floating-border)] bg-[var(--game-floating-bg)] px-[7px]'
        : 'h-[35px] rounded-lg bg-opacity-6 px-2'
    "
  >
    <button
      type="button"
      class="flex min-w-0 flex-1 items-center gap-[5px] text-[13px]"
      :class="floating ? 'font-medium text-common-100' : 'font-semibold text-text-1'"
      :aria-label="t('gameDetail.selectedCurrency')"
      :disabled="disabled"
      @click="visible = true"
    >
      <SmartImage
        v-if="selectedData"
        :src="selectedData.icon"
        alt=""
        class="shrink-0 object-contain"
        :class="floating ? 'size-[15px]' : 'size-5'"
      />
      <span class="min-w-0 truncate" :title="selectedBalanceText">{{ selectedBalanceText }}</span>
      <DropdownIcon v-if="floating" class="size-2.5 shrink-0 text-icon-2" aria-hidden="true" />
    </button>
    <div class="flex h-full shrink-0 items-center gap-2">
      <button
        v-if="!floating"
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
        v-if="!floating"
        type="button"
        class="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-opacity-10 text-icon-2"
        :aria-label="t('gameDetail.selectCurrencyTitle')"
        :disabled="disabled"
        @click="visible = true"
      >
        <DropdownIcon class="size-[10px]" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="flex size-5 shrink-0 items-center justify-center bg-theme-primary text-text-4"
        :class="floating ? 'rounded-[5px]' : 'rounded'"
        :aria-label="t('deposit.title')"
        @click="navigateTo('/deposit')"
      >
        <DepositPlusIcon :class="floating ? 'size-2.5' : 'size-3'" aria-hidden="true" />
      </button>
    </div>
    <Teleport to="body" v-if="isMobile || floating">
      <popup
        v-model:visible="visible"
        :fullscreen="floating"
        :change-currency="changeCurrency"
        :disabled="disabled"
      />
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
import DropdownIcon from '@/static/svg/game/detail/top/currency-dropdown.svg?component'
import DepositPlusIcon from '@/static/svg/game/detail/top/deposit-plus.svg?component'
import { navigateTo } from '@/utils/router'
import { computed, onBeforeUnmount, onDeactivated, provide, ref, watch } from 'vue'
import Popup from './popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import SmartImage from '@/components/common/SmartImage.vue'
import type { CurrencyOptionItem } from '@/components/common/currency-selector/currency-select-options'

const { t } = useI18n()
defineProps<{
  floating?: boolean
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
  currentCompactBalanceText,
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
  return currentCompactBalanceText.value
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
