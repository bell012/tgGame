<template>
  <div>
    <section v-if="isMobile" class="fixed inset-0 overflow-y-auto bg-bg-1">
      <div class="min-h-screen bg-bg-1">
        <H5Header :title="t('preferencesSettings.pageTitle')" />

        <main class="px-3.5 pb-6 pt-3.5">
          <section class="rounded-[12px] bg-bg-2 px-3">
            <h3 class="border-b border-opacity-10 py-3 text-[15px] font-[700] text-text-1">
              {{ t('preferencesSettings.accountSettings') }}
            </h3>

            <button
              type="button"
              class="flex w-full items-center justify-between py-4"
              @click="openCurrencyPopup"
            >
              <span class="text-[15px] font-[700] text-text-1">{{
                t('preferencesSettings.displayCurrency')
              }}</span>
              <div class="flex items-center gap-2.5">
                <span class="text-[15px] font-[400] text-text-2">{{ currentCurrency }}</span>
                <div class="flex h-5 w-5 items-center justify-center rounded-md bg-bg-1">
                  <ArrowRightIcon class="h-3 w-3 text-text-2" />
                </div>
              </div>
            </button>

            <button
              type="button"
              class="flex w-full items-center justify-between py-4"
              @click="openLanguagePopup"
            >
              <span class="text-[15px] font-[700] text-text-1">{{
                t('preferencesSettings.changeLanguage')
              }}</span>
              <div class="flex items-center gap-2.5">
                <span class="text-[15px] font-[400] text-text-2">{{ currentLanguageLabel }}</span>
                <div class="flex h-5 w-5 items-center justify-center rounded-md bg-bg-1">
                  <ArrowRightIcon class="h-3 w-3 text-text-2" />
                </div>
              </div>
            </button>

            <div class="flex items-center justify-between py-4">
              <span class="text-[15px] font-[700] text-text-1">{{
                t('preferencesSettings.theme')
              }}</span>
              <div class="flex items-center rounded-lg bg-bg-1 p-0.5">
                <button
                  type="button"
                  :class="[
                    'flex h-6 w-6 items-center justify-center rounded-md transition-all',
                    themeStore.theme === 'dark' ? 'bg-bg-3' : ''
                  ]"
                  @click="themeStore.setTheme('dark')"
                >
                  <MoonIcon class="h-4 w-4 text-text-2" />
                </button>
                <button
                  type="button"
                  :class="[
                    'flex h-6 w-6 items-center justify-center rounded-md transition-all',
                    themeStore.theme === 'light' ? 'bg-bg-3' : ''
                  ]"
                  @click="themeStore.setTheme('light')"
                >
                  <SunIcon class="h-4 w-4 text-text-2" />
                </button>
              </div>
            </div>
          </section>

          <section class="mt-3.5 rounded-[12px] bg-bg-2 px-3">
            <h3 class="border-b border-opacity-10 py-3 text-[15px] font-[700] text-text-1">
              {{ t('preferencesSettings.privacySettings') }}
            </h3>

            <div class="flex items-center justify-between py-4">
              <span class="flex-1 pr-3 text-[15px] font-[700] leading-[1.35] text-text-1">
                {{ t('preferencesSettings.hideGameDataInProfile') }}
              </span>
              <button
                type="button"
                class="relative h-[24px] w-[44px] rounded-full transition-colors duration-200"
                :class="hideGameData ? 'bg-secondary-3' : 'bg-bg-1'"
                @click="hideGameData = !hideGameData"
              >
                <span
                  class="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-common-60 transition-transform duration-200"
                  :class="hideGameData ? 'translate-x-[20px]' : ''"
                />
              </button>
            </div>

            <div class="flex items-center justify-between py-4">
              <span class="flex-1 pr-3 text-[15px] font-[700] leading-[1.35] text-text-1">
                {{ t('preferencesSettings.hideUsernameFromPublicList') }}
              </span>
              <button
                type="button"
                class="relative h-[24px] w-[44px] rounded-full transition-colors duration-200"
                :class="hideUserName ? 'bg-secondary-3' : 'bg-bg-1'"
                @click="hideUserName = !hideUserName"
              >
                <span
                  class="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-common-60 transition-transform duration-200"
                  :class="hideUserName ? 'translate-x-[20px]' : ''"
                />
              </button>
            </div>
          </section>
        </main>
      </div>
    </section>

    <SettingsLayout v-else current-tab="preferences">
      <div class="w-full space-y-4">
        <section class="rounded-xl bg-bg-2 px-5 py-4">
          <h3 class="border-b border-opacity-10 pb-3 text-xl font-[700] text-text-1">
            {{ t('preferencesSettings.accountSettings') }}
          </h3>

          <button
            type="button"
            class="flex w-full items-center justify-between py-4"
            @click="openCurrencyPopup"
          >
            <span class="text-lg font-[700] text-text-1">{{
              t('preferencesSettings.displayCurrency')
            }}</span>
            <div ref="desktopCurrencyAnchorRef" class="flex items-center gap-2.5">
              <span class="text-base text-text-2">{{ currentCurrency }}</span>
              <div class="flex h-6 w-6 items-center justify-center rounded-md bg-bg-1">
                <ArrowRightIcon class="h-3.5 w-3.5 text-text-2" />
              </div>
            </div>
          </button>

          <button
            type="button"
            class="flex w-full items-center justify-between py-4"
            @click="openLanguagePopup"
          >
            <span class="text-lg font-[700] text-text-1">{{
              t('preferencesSettings.changeLanguage')
            }}</span>
            <div ref="desktopLanguageAnchorRef" class="flex items-center gap-2.5">
              <span class="text-base text-text-2">{{ currentLanguageLabel }}</span>
              <div class="flex h-6 w-6 items-center justify-center rounded-md bg-bg-1">
                <ArrowRightIcon class="h-3.5 w-3.5 text-text-2" />
              </div>
            </div>
          </button>

          <div class="flex items-center justify-between py-4">
            <span class="text-lg font-[700] text-text-1">{{ t('preferencesSettings.theme') }}</span>
            <div class="flex items-center rounded-lg bg-bg-1 p-0.5">
              <button
                type="button"
                :class="[
                  'flex h-7 w-7 items-center justify-center rounded-md transition-all',
                  themeStore.theme === 'dark' ? 'bg-bg-3' : ''
                ]"
                @click="themeStore.setTheme('dark')"
              >
                <MoonIcon class="h-4 w-4 text-text-2" />
              </button>
              <button
                type="button"
                :class="[
                  'flex h-7 w-7 items-center justify-center rounded-md transition-all',
                  themeStore.theme === 'light' ? 'bg-bg-3' : ''
                ]"
                @click="themeStore.setTheme('light')"
              >
                <SunIcon class="h-4 w-4 text-text-2" />
              </button>
            </div>
          </div>
        </section>

        <section class="rounded-xl bg-bg-2 px-5 py-4">
          <h3 class="border-b border-opacity-10 pb-3 text-xl font-[700] text-text-1">
            {{ t('preferencesSettings.privacySettings') }}
          </h3>

          <div class="flex items-center justify-between py-4">
            <span class="flex-1 pr-4 text-lg font-[700] leading-[1.35] text-text-1">
              {{ t('preferencesSettings.hideGameDataInProfile') }}
            </span>
            <button
              type="button"
              class="relative h-[24px] w-[44px] rounded-full transition-colors duration-200"
              :class="hideGameData ? 'bg-secondary-3' : 'bg-bg-1'"
              @click="hideGameData = !hideGameData"
            >
              <span
                class="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-common-60 transition-transform duration-200"
                :class="hideGameData ? 'translate-x-[20px]' : ''"
              />
            </button>
          </div>

          <div class="flex items-center justify-between py-4">
            <span class="flex-1 pr-4 text-lg font-[700] leading-[1.35] text-text-1">
              {{ t('preferencesSettings.hideUsernameFromPublicList') }}
            </span>
            <button
              type="button"
              class="relative h-[24px] w-[44px] rounded-full transition-colors duration-200"
              :class="hideUserName ? 'bg-secondary-3' : 'bg-bg-1'"
              @click="hideUserName = !hideUserName"
            >
              <span
                class="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-common-60 transition-transform duration-200"
                :class="hideUserName ? 'translate-x-[20px]' : ''"
              />
            </button>
          </div>
        </section>
      </div>
    </SettingsLayout>

    <Teleport to="body">
      <CurrencyPopup
        v-model:visible="showCurrencyPopup"
        :desktop="!isMobile"
        :desktop-anchor="currencyPopupAnchor"
        :selected-currency="currentCurrency"
        :options="currencyOptions"
        @select="handleCurrencySelect"
      />
    </Teleport>

    <Teleport to="body">
      <LanguagePopup
        v-model:visible="showLanguagePopup"
        :desktop="!isMobile"
        :desktop-anchor="languagePopupAnchor"
        :selected-language="localeStore.currentLanguage"
        :options="languageOptions"
        @select="handleLanguageSelect"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useLocaleStore } from '@/stores/locale'
import { SITE_CONFIG_STORAGE_KEY } from '@/stores/siteConfig'
import { useThemeStore } from '@/stores/theme'
import {
  getCurrentCurrency,
  getFormattedBalance,
  getLocaleLabel,
  getLocaleOptions,
  type Locale,
  type LocaleOption
} from '@/utils/locale'
import { getCurrencyIconByCode } from '@/components/common/currency-selector/currency-select-options'
import { getBalanceByCurrency, type BalanceCarrier } from '@/utils/balance'
import H5Header from '@/components/common/H5Header.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import MoonIcon from '@/static/svg/personalCenter/icon32.svg?component'
import SunIcon from '@/static/svg/personalCenter/icon33.svg?component'
import CurrencyPopup from './currency-popup.vue'
import LanguagePopup from './language-popup.vue'
import SettingsLayout from '../index.vue'

type CurrencyOption = {
  code: string
  icon: string
  balanceText: string
}

type PopupAnchorRect = {
  top: number
  left: number
  width: number
  height: number
}

type CachedSiteConfig = {
  baseSiteConfig?: {
    supportCurrency?: unknown
  }
}

const isMobile = useIsMobile()
const localeStore = useLocaleStore()
const themeStore = useThemeStore()
const { t } = useI18n()
const hideGameData = ref(false)
const hideUserName = ref(false)
const showCurrencyPopup = ref(false)
const showLanguagePopup = ref(false)
const currencyPopupAnchor = ref<PopupAnchorRect | null>(null)
const languagePopupAnchor = ref<PopupAnchorRect | null>(null)
const desktopCurrencyAnchorRef = ref<HTMLElement | null>(null)
const desktopLanguageAnchorRef = ref<HTMLElement | null>(null)
const currentCurrency = ref('PHP')
const currencyOptions = ref<CurrencyOption[]>([])
const languageOptions = computed<LocaleOption[]>(() => getLocaleOptions())
const currentLanguageLabel = computed(() => getLocaleLabel(localeStore.currentLanguage))

const normalizeCurrencyCode = (value: unknown) => {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

const parseCurrencyCodes = (rawCurrency: unknown) => {
  if (Array.isArray(rawCurrency)) {
    return Array.from(new Set(rawCurrency.map(normalizeCurrencyCode).filter(Boolean)))
  }

  if (typeof rawCurrency === 'string') {
    return Array.from(
      new Set(
        rawCurrency
          .split(',')
          .map(item => normalizeCurrencyCode(item))
          .filter(Boolean)
      )
    )
  }

  return []
}

const readCachedConfigCurrencyCodes = () => {
  const rawConfig = localStorage.getItem(SITE_CONFIG_STORAGE_KEY)
  if (!rawConfig) {
    return []
  }

  try {
    const parsed = JSON.parse(rawConfig) as CachedSiteConfig
    return parseCurrencyCodes(parsed?.baseSiteConfig?.supportCurrency)
  } catch (error) {
    console.error(error)
    return []
  }
}

const readCachedAcctInfo = () => {
  const rawAcctInfo = localStorage.getItem('acctInfo')
  if (!rawAcctInfo) {
    return null
  }

  try {
    return JSON.parse(rawAcctInfo) as BalanceCarrier
  } catch (error) {
    console.error(error)
    return null
  }
}

const syncCurrencyDataFromCache = () => {
  const codesFromConfig = readCachedConfigCurrencyCodes()
  const fallbackCode =
    normalizeCurrencyCode(localStorage.getItem('currency')) || getCurrentCurrency()
  const codes = codesFromConfig.length ? codesFromConfig : [fallbackCode]
  const acctInfo = readCachedAcctInfo()

  currencyOptions.value = codes.map(code => {
    const balance = getBalanceByCurrency(acctInfo, code, { fallbackToCurrentBalance: false })
    return {
      code,
      icon: getCurrencyIconByCode(code),
      balanceText: getFormattedBalance(balance, code, 2)
    }
  })

  const cachedCurrency = normalizeCurrencyCode(localStorage.getItem('currency'))
  const selectedCode = codes.includes(cachedCurrency) ? cachedCurrency : codes[0]
  currentCurrency.value = selectedCode || fallbackCode || 'PHP'
}

const openCurrencyPopup = () => {
  syncCurrencyDataFromCache()

  if (!isMobile.value) {
    const anchorElement = desktopCurrencyAnchorRef.value
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect()
      currencyPopupAnchor.value = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    } else {
      currencyPopupAnchor.value = null
    }
  }

  showCurrencyPopup.value = true
}

const openLanguagePopup = () => {
  if (!isMobile.value) {
    const anchorElement = desktopLanguageAnchorRef.value
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect()
      languagePopupAnchor.value = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    } else {
      languagePopupAnchor.value = null
    }
  }

  showLanguagePopup.value = true
}

const handleCurrencySelect = (code: string) => {
  const selectedCode = normalizeCurrencyCode(code)
  if (!selectedCode) {
    return
  }

  localeStore.setCurrency(selectedCode)
  localStorage.setItem('currency', selectedCode)
  currentCurrency.value = selectedCode
  syncCurrencyDataFromCache()
}

const handleLanguageSelect = (code: Locale) => {
  localeStore.setLanguage(code)
}

onMounted(() => {
  syncCurrencyDataFromCache()
})
</script>

<style scoped lang="scss"></style>
