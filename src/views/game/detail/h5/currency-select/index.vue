<template>
  <!-- 顶部搜索 -->
  <div class="currency-select-trigger relative rounded-[6px]">
    <div
      class="text-[14px] h-[36px] flex items-center justify-between p-[8px] cursor-pointer gap-[8px] rounded-[6px] bg-opacity-10"
      @click="visible = true"
    >
      <div class="flex gap-[10px] min-w-0">
        <div v-if="selectedData" class="flex gap-[8px] items-center min-w-0">
          <SmartImage alt="" :src="selectedData.icon" class="size-[24px] object-contain" />
          <div class="text-[14px] font-[700] leading-[20px] shrink-0">{{ selectedData.label }}</div>
          <div class="balance-text text-[14px] font-[700] shrink-0">
            <span class="balance-bracket">(</span>
            <span>{{ selectedBalanceText }}</span>
            <span class="balance-bracket">)</span>
          </div>
        </div>
      </div>
      <div class="ml-auto flex items-center gap-[8px] min-w-0">
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
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { computed, provide, ref, watch } from 'vue'
import Popup from './popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import SmartImage from '@/components/common/SmartImage.vue'
import type { CurrencyOptionItem } from '@/components/common/currency-selector/currency-select-options'

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

<style scoped lang="scss">
.desktop-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 100%;
}

.currency-select-trigger {
  border: none;
  background: var(--color-background-level-3);
  box-shadow: none;
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
}

.trigger-arrow-icon :deep(path) {
  fill: #93a0a4;
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
  background: #d9d9d9;
  box-shadow: none;
}

:global(:root.light) .trigger-arrow-bg {
  background: #d5dbe1;
}

:global(:root.light) .trigger-arrow-icon :deep(path) {
  fill: #7f8a8e;
}
</style>
