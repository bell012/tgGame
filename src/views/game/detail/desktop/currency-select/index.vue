<template>
  <!-- 顶部搜索 -->
  <div class="relative bg-[var(--color-input-level-2)] rounded-[10px]">
    <div
      class="text-[14px] h-[36px] flex items-center justify-between p-[8px] cursor-pointer"
      @click="visible = true"
    >
      <div class="flex gap-[10px]">
        <div v-if="selectedData" class="flex gap-[8px] items-center">
          <img alt="" :src="selectedData.icon" class="size-[24px] object-contain" />
          <div class="text-[14px]">{{ selectedData.label }}</div>
        </div>
      </div>
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
    <!-- 搜索类型弹窗 -->
    <Teleport to="body" v-if="isMobile">
      <popup v-model:visible="visible" />
    </Teleport>
    <popup v-else class="desktop-popup" v-model:visible="visible" desktop />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
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
