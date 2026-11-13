<template>
  <div
    v-if="visible"
    class="tg-glass-tokens absolute right-0 top-[calc(100%+8px)] z-[60] flex w-[560px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[15px] p-3 [box-shadow:var(--glass-shadow)]"
  >
    <LiquidGlass />
    <section class="relative z-[1] flex min-w-0 flex-1 flex-col pr-3">
      <p class="mb-2 text-sm font-[700] text-text-1">{{ t('home.language') }}</p>
      <label class="relative mb-2 block">
        <SearchIcon
          class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-2"
        />
        <input
          v-model="languageQuery"
          type="text"
          :placeholder="t('home.search')"
          class="h-9 w-full rounded-lg border border-[color:var(--color-popup-2)] bg-transparent pl-8 pr-2 text-sm text-text-1 outline-none placeholder:text-text-2"
        />
      </label>
      <div class="max-h-[240px] overflow-y-auto">
        <button
          v-for="item in filteredLanguages"
          :key="item.code"
          type="button"
          class="flex h-10 w-full items-center justify-between rounded-lg px-2 text-left text-sm font-[600] text-text-1 transition-colors hover:bg-opacity-6"
          @click="selectLanguage(item.code)"
        >
          <span class="truncate">{{ item.label }}</span>
          <span
            class="ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
            :class="
              item.code === localeStore.currentLanguage
                ? 'border-theme-primary'
                : 'border-[color:var(--color-popup-2)]'
            "
          >
            <span
              v-if="item.code === localeStore.currentLanguage"
              class="h-2 w-2 rounded-full bg-theme-primary"
            />
          </span>
        </button>
      </div>
    </section>

    <section
      class="relative z-[1] flex min-w-0 flex-1 flex-col border-l border-[color:var(--color-popup-2)] pl-3"
    >
      <p class="mb-2 text-sm font-[700] text-text-1">{{ t('hashGame.selectCurrency') }}</p>
      <label class="relative mb-2 block">
        <SearchIcon
          class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-2"
        />
        <input
          v-model="currencyQuery"
          type="text"
          :placeholder="t('home.search')"
          class="h-9 w-full rounded-lg border border-[color:var(--color-popup-2)] bg-transparent pl-8 pr-2 text-sm text-text-1 outline-none placeholder:text-text-2"
        />
      </label>
      <div class="max-h-[240px] overflow-y-auto">
        <button
          v-for="item in filteredCurrencies"
          :key="item.value"
          type="button"
          class="flex h-10 w-full items-center justify-between rounded-lg px-2 text-left text-sm font-[600] text-text-1 transition-colors hover:bg-opacity-6"
          @click="selectCurrency(item.value)"
        >
          <span class="flex min-w-0 items-center gap-2">
            <img
              v-if="item.icon"
              :src="item.icon"
              alt=""
              class="h-5 w-5 shrink-0 rounded-full object-cover"
            />
            <span class="truncate">{{ item.value }}</span>
          </span>
          <span
            class="ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
            :class="
              isCurrencySelected(item.value)
                ? 'border-theme-primary'
                : 'border-[color:var(--color-popup-2)]'
            "
          >
            <span
              v-if="isCurrencySelected(item.value)"
              class="h-2 w-2 rounded-full bg-theme-primary"
            />
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import LiquidGlass from '@/components/common/LiquidGlass.vue'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import { useLocaleStore } from '@/stores/locale'
import { getLocaleOptions, getLocaleSearchKeywords, type Locale } from '@/utils/locale'

const visible = defineModel<boolean>({ required: true })

const { t } = useI18n()
const localeStore = useLocaleStore()
const { currencySelectOptions, setDisplayCurrency } = useDisplayCurrency()

const languageQuery = ref('')
const currencyQuery = ref('')

watch(visible, open => {
  if (!open) {
    return
  }

  languageQuery.value = ''
  currencyQuery.value = ''
})

const languages = computed(() =>
  getLocaleOptions().map(option => ({
    ...option,
    keywords: getLocaleSearchKeywords(option.code)
  }))
)

const filteredLanguages = computed(() => {
  const query = languageQuery.value.trim().toLowerCase()
  if (!query) {
    return languages.value
  }

  return languages.value.filter(item =>
    [item.label, item.code, ...item.keywords].some(keyword => keyword.toLowerCase().includes(query))
  )
})

const filteredCurrencies = computed(() => {
  const query = currencyQuery.value.trim().toLowerCase()
  if (!query) {
    return currencySelectOptions.value
  }

  return currencySelectOptions.value.filter(
    item => item.value.toLowerCase().includes(query) || item.label.toLowerCase().includes(query)
  )
})

const isCurrencySelected = (code: string) =>
  code.toUpperCase() === String(localeStore.currentCurrency || '').toUpperCase()

const selectLanguage = (code: Locale) => {
  localeStore.setLanguage(code)
  visible.value = false
}

const selectCurrency = (code: string) => {
  setDisplayCurrency(code)
  visible.value = false
}
</script>
