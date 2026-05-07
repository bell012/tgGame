<template>
  <div>
    <div v-if="showSearch" :class="searchWrapperClass">
      <SearchIcon :class="searchIconClass" />
      <input v-model="keyword" :placeholder="resolvedSearchPlaceholder" :class="searchInputClass" />
    </div>

    <div :class="listClass">
      <div v-if="sectionLabel" :class="sectionLabelClass">
        {{ sectionLabel }}
      </div>

      <button
        v-for="option in filteredOptions"
        :key="option.value"
        type="button"
        :class="[itemClass, isSelected(option) ? selectedItemClass : '']"
        @click="chageCurrency(option.value)"
      >
        <div class="flex min-w-0 items-center gap-[10px]">
          <SmartImage :src="option.icon" :alt="option.label" :class="iconClass" />
          <div :class="labelClass">{{ option.label }}</div>
        </div>

        <template v-if="mode === 'radio'">
          <ChecedIcon v-if="isSelected(option)" class="h-5 w-5 cursor-pointer" />
          <UnchecedIcon v-else class="h-5 w-5 cursor-pointer" />
        </template>
        <div v-else :class="trailingClass">{{ option.trailingText || '' }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import ChecedIcon from '@/static/svg/explore/radio-checked2.svg?component'
import UnchecedIcon from '@/static/svg/radio-unchecked.svg?component'
import SmartImage from '@/components/common/SmartImage.vue'

export type CurrencySelectorMode = 'balance' | 'radio'

export type CurrencySelectorOption = {
  value: string
  label: string
  icon: string
  trailingText?: string
  searchKeywords?: string[]
}

const props = withDefaults(
  defineProps<{
    visible?: boolean
    options: CurrencySelectorOption[]
    selectedValue: string
    mode?: CurrencySelectorMode
    showSearch?: boolean
    searchPlaceholder?: string
    sectionLabel?: string
    listClass?: string
    sectionLabelClass?: string
    itemClass?: string
    selectedItemClass?: string
    labelClass?: string
    trailingClass?: string
    iconClass?: string
    searchWrapperClass?: string
    searchInputClass?: string
    searchIconClass?: string
  }>(),
  {
    visible: false,
    mode: 'balance',
    showSearch: false,
    searchPlaceholder: '',
    sectionLabel: '',
    listClass: '',
    sectionLabelClass: 'mb-2.5 text-xs font-[700] text-text-2',
    itemClass:
      'mb-2.5 flex h-[42px] w-full items-center justify-between rounded-lg px-2.5 text-left',
    selectedItemClass: 'bg-opacity-10',
    labelClass: 'text-sm font-[700] text-text-1',
    trailingClass: 'text-xs font-[500] text-text-1',
    iconClass: 'h-5 w-5 object-contain',
    searchWrapperClass: 'relative mb-[10px]',
    searchInputClass:
      'h-[42px] w-full rounded-lg border border-[var(--color-border-level-1)] bg-[var(--color-opacity-6)] pl-[40px] pr-11 text-xs font-[600] text-text-1 outline-none placeholder:text-text-2 focus:border-theme-primary',
    searchIconClass:
      'absolute left-2.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 fill-none stroke-text-2 opacity-50'
  }
)

const { t } = useI18n()

const emit = defineEmits<{
  select: [value: string]
}>()

const keyword = ref('')
const isChangingCurrency = ref(false)
const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder || t('search.placeholder'))

const normalizedKeyword = computed(() => keyword.value.trim().toUpperCase())

const filteredOptions = computed(() => {
  if (!props.showSearch) {
    return props.options
  }

  if (!normalizedKeyword.value) {
    return props.options
  }

  return props.options.filter(option => {
    const values = [
      option.label,
      option.value,
      option.trailingText || '',
      ...(option.searchKeywords ?? [])
    ]

    return values.some(item => item.toUpperCase().includes(normalizedKeyword.value))
  })
})

const isSelected = (option: CurrencySelectorOption) => {
  return option.value === props.selectedValue
}

const chageCurrency = async (value: string) => {
  if (!value || value === props.selectedValue || isChangingCurrency.value) {
    return
  }
  isChangingCurrency.value = true
  try {
    emit('select', value)
    await Api.user.changeWallet({ currency: value })
  } catch (error) {
    console.error('changeWallet failed', error)
    return
  } finally {
    isChangingCurrency.value = false
  }
}

watch(
  () => props.visible,
  visible => {
    if (visible) {
      keyword.value = ''
    }
  }
)
</script>
