<template>
  <div>
    <!-- H5 -->
    <LoanRecords
      v-if="isMobile && activeNavKey === 'loan-records'"
      @back="activeNavKey = 'credit-loan'"
    />
    <BetHistory
      v-else-if="isMobile && activeNavKey === 'betting-records'"
      @back="activeNavKey = 'credit-loan'"
    />
    <div v-else-if="isMobile" class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1">
      <H5Header
        :title="activeNavTab.label"
        show-sort
        :right-icon="MoreIcon"
        right-icon-class="h-5 w-5 text-text-1"
        :disable-default-back="activeNavKey !== 'credit-loan'"
        @back="handleMobileBack"
        @sort="showMoreMenu = !showMoreMenu"
      />

      <template v-if="showMoreMenu">
        <div class="fixed inset-0 z-[100]" @click="showMoreMenu = false" />
        <div
          class="fixed right-[10px] top-[52px] z-[101] min-w-[160px] overflow-hidden rounded-lg bg-bg-3 py-1 shadow-lg"
        >
          <button
            v-for="tab in navTabs"
            :key="tab.key"
            type="button"
            class="flex h-10 w-full items-center gap-2 px-3 text-sm"
            :class="tab.key === activeNavKey ? 'font-[700] text-theme-primary' : 'text-text-1'"
            @click="handleMobileNavSelect(tab.key)"
          >
            <component :is="tab.icon" class="h-5 w-5 shrink-0" />
            <span class="whitespace-nowrap">{{ tab.label }}</span>
          </button>
        </div>
      </template>

      <div class="flex-1 overflow-y-auto">
        <div v-if="activeNavKey === 'credit-loan'" class="px-3.5 pb-6 pt-3">
          <h2 class="text-[24px] font-[800] leading-[29px] text-theme-primary">
            {{ t('creditLoan.repaymentFreeTitle') }}
          </h2>
          <p class="mt-1 text-xs leading-[15px] text-text-1">
            {{ t('creditLoan.repaymentFreeDesc') }}
          </p>

          <div class="mt-3 rounded-xl bg-bg-2 p-2.5">
            <div class="flex h-10 items-center pl-1">
              <component :is="newSideIcons.creditLoanIcon" class="h-5 w-5 shrink-0" />
              <span class="ml-1.5 whitespace-nowrap text-sm text-text-1">
                {{ t('creditLoan.loanBalance') }}
              </span>
              <span class="ml-1 min-w-0 truncate text-base font-[700] text-text-1">
                {{ formatBalance(loanBalance) }}
              </span>
              <button
                type="button"
                class="ml-auto h-9 shrink-0 rounded-lg bg-theme-primary px-4 text-sm font-[700] text-text-4"
                @click="showTransferPop = true"
              >
                {{ t('creditLoan.transfer') }}
              </button>
            </div>

            <div class="mt-2 flex flex-col items-center rounded-xl bg-bg-3 px-2.5 pb-3 pt-4">
              <span class="text-sm leading-[17px] text-text-1">
                {{ t('creditLoan.availableCredit') }}
              </span>
              <span class="mt-1 text-[36px] font-[700] leading-[44px] text-text-1">
                {{ formatBalance(availableCredit) }}
              </span>
              <button
                type="button"
                class="mt-3 h-10 w-full rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
                @click="showLoanPop = true"
              >
                {{ t('creditLoan.borrowNow') }}
              </button>
              <p class="mt-3 text-center text-xs leading-[15px] text-text-2">
                {{ t('creditLoan.slogan') }}
              </p>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="flex rounded-lg bg-bg-2 p-1">
              <button
                v-for="tab in contentTabs"
                :key="tab.key"
                type="button"
                class="h-7 rounded-md px-2.5 text-xs"
                :class="
                  tab.key === activeContentKey
                    ? 'bg-bg-3 font-[700] text-text-1'
                    : 'font-[400] text-text-2'
                "
                @click="activeContentKey = tab.key"
              >
                {{ tab.label }}
              </button>
            </div>
            <button
              v-if="activeContentKey === 'game-lobby'"
              type="button"
              class="flex size-[33px] items-center justify-center rounded-lg bg-bg-2"
              @click="showFilterPopup = true"
            >
              <FilterIcon class="h-3.5 w-3.5" />
            </button>
          </div>

          <CreditLoanGameGrid
            v-if="activeContentKey === 'game-lobby'"
            class="mt-3"
            :game-type-code="activeGameTypeCode"
          />
          <CreditLoanDetails v-else class="mt-3" :rules="loanRules" />
        </div>

        <ThemedEmptyState
          v-else
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :message="t('creditLoan.empty')"
          container-class="mt-[60px]"
          image-class="w-[220px] h-[200px] object-contain mb-2.5"
          text-class="text-xs text-center text-text-1"
        />
      </div>

      <FilterPopup
        v-model:visible="showFilterPopup"
        :model-value="{ gameType: activeGameTypeCode }"
        :filter-groups="filterGroups"
        @apply="handleFilterApply"
      />
    </div>

    <!-- PC -->
    <main v-else class="min-h-screen bg-bg-1 pb-10 pt-4 px-4 max-w-[1336px] mx-auto">
      <div class="mx-auto flex w-full max-w-[1336px] flex-col gap-4">
        <h1 class="h-6 text-xl font-[700] leading-6 text-text-1">{{ t('creditLoan.title') }}</h1>

        <div class="flex items-start gap-6">
          <aside class="flex w-[280px] shrink-0 flex-col gap-2 rounded-[12px] bg-bg-2 p-4">
            <button
              v-for="tab in navTabs"
              :key="tab.key"
              type="button"
              class="flex h-12 w-full items-center gap-4 rounded-[8px] px-4"
              :class="tab.key === activeNavKey ? 'bg-theme-primary' : ''"
              @click="activeNavKey = tab.key"
            >
              <component
                :is="tab.icon"
                class="h-6 w-6 shrink-0"
                :class="tab.key === activeNavKey ? 'brightness-0' : ''"
              />
              <span
                class="whitespace-nowrap text-base leading-[19px]"
                :class="
                  tab.key === activeNavKey ? 'font-[700] text-text-4' : 'font-[400] text-text-2'
                "
              >
                {{ tab.label }}
              </span>
            </button>
          </aside>

          <section v-if="activeNavKey === 'credit-loan'" class="flex min-w-0 flex-1 flex-col gap-4">
            <div class="flex h-[92px] items-center rounded-[12px] bg-bg-2 px-6">
              <div class="flex min-w-0 items-center">
                <img :src="coinIcon" alt="" class="h-5 w-5 shrink-0" />
                <span class="ml-2 whitespace-nowrap text-sm font-[700] text-text-1">
                  {{ t('creditLoan.loanBalance') }}
                </span>
                <span class="ml-4 truncate text-[32px] font-[700] leading-none text-text-1">
                  {{ formatBalance(loanBalance) }}
                </span>
              </div>
              <button
                type="button"
                class="ml-auto h-11 w-[280px] shrink-0 rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
                @click="showTransferPop = true"
              >
                {{ t('creditLoan.transfer') }}
              </button>
            </div>

            <div class="flex flex-col items-center rounded-[12px] bg-bg-2 px-4 pb-8 pt-10">
              <span class="text-base font-[700] leading-5 text-text-1">
                {{ t('creditLoan.availableCredit') }}
              </span>
              <span class="mt-2 text-[52px] font-[700] leading-[64px] text-text-1">
                {{ formatBalance(availableCredit) }}
              </span>
              <button
                type="button"
                class="mt-4 h-11 w-full max-w-[400px] rounded-lg bg-theme-primary text-sm font-[700] text-text-4"
                @click="showLoanPop = true"
              >
                {{ t('creditLoan.borrowNow') }}
              </button>
              <p class="mt-6 text-center text-sm leading-[17px] text-text-2">
                {{ t('creditLoan.slogan') }}
              </p>
            </div>

            <div class="flex items-center justify-between gap-3">
              <div class="flex shrink-0 rounded-full bg-bg-2 p-1">
                <button
                  v-for="tab in contentTabs"
                  :key="tab.key"
                  type="button"
                  class="h-8 rounded-full px-5 text-sm"
                  :class="
                    tab.key === activeContentKey
                      ? 'bg-bg-3 font-[700] text-text-1'
                      : 'font-[400] text-text-2'
                  "
                  @click="activeContentKey = tab.key"
                >
                  {{ tab.label }}
                </button>
              </div>

              <div
                v-if="activeContentKey === 'game-lobby'"
                class="hide-scroll flex min-w-0 gap-2 overflow-x-auto"
              >
                <button
                  v-for="item in gameTypeTabs"
                  :key="item.sysGameTypeCode || 'all'"
                  type="button"
                  class="h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm"
                  :class="
                    item.sysGameTypeCode === activeGameTypeCode
                      ? 'bg-theme-primary font-[700] text-text-4'
                      : 'bg-bg-2 font-[400] text-text-2'
                  "
                  @click="activeGameTypeCode = item.sysGameTypeCode"
                >
                  {{ item.sysGameTypeName }}
                </button>
              </div>
            </div>

            <CreditLoanGameGrid
              v-if="activeContentKey === 'game-lobby'"
              :game-type-code="activeGameTypeCode"
            />
            <CreditLoanDetails v-else :rules="loanRules" />
          </section>

          <section v-else-if="activeNavKey === 'loan-records'" class="min-w-0 flex-1">
            <LoanRecords />
          </section>

          <section v-else class="min-w-0 flex-1">
            <BetHistory />
          </section>
        </div>
      </div>
    </main>

    <LoanPop v-model:visible="showLoanPop" :amount="availableCredit" />
    <TransferOutPop
      v-model:visible="showTransferPop"
      :loan-balance="loanBalance"
      :transferable-balance="transferableBalance"
      @transfer-all="showTransferSuccess = true"
    />
    <TransferOutSuccess v-model:visible="showTransferSuccess" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useCasinoTabsStore } from '@/stores/casinoTabs'
import { formatBalance } from '@/utils/locale'
import newSideIcons from '@/static/svg/side/newIcon'
import FilterIcon from '@/static/svg/sports/liansai_tabs/filter.svg?component'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import CreditLoanGameGrid from './components/CreditLoanGameGrid.vue'
import CreditLoanDetails from './components/CreditLoanDetails.vue'
import LoanPop from './components/loan-pop.vue'
import TransferOutPop from './components/transfer-out-pop.vue'
import TransferOutSuccess from './components/transfer-out-success.vue'
import LoanRecords from './loan-records/index.vue'
import BetHistory from './bet-history/index.vue'
import { CREDIT_LOAN_RULE_HIGHLIGHTS, type CreditLoanRuleItem } from './mock'
import coinIcon from './img/yongjin.svg?url'
import MoreIcon from './img/more.svg?component'
import LoanRecordsIcon from './img/loan-records.svg?component'
import BettingRecordsIcon from './img/betting-records.svg?component'

type NavTabKey = 'credit-loan' | 'loan-records' | 'betting-records'
type ContentTabKey = 'game-lobby' | 'loan-details'

const EXCLUDED_GAME_TYPE_CODES = new Set(['', 'hot_games', 'providers'])

const { t, locale } = useI18n()
const isMobile = useIsMobile()
const casinoTabsStore = useCasinoTabsStore()

const activeNavKey = ref<NavTabKey>('credit-loan')
const activeContentKey = ref<ContentTabKey>('game-lobby')
const activeGameTypeCode = ref('')
const showMoreMenu = ref(false)
const showFilterPopup = ref(false)
const showLoanPop = ref(false)
const showTransferPop = ref(false)
const showTransferSuccess = ref(false)

const loanBalance = ref(0)
const transferableBalance = ref(0)
const availableCredit = ref(0)

const navTabs = computed<{ key: NavTabKey; label: string; icon: Component }[]>(() => [
  { key: 'credit-loan', label: t('creditLoan.title'), icon: newSideIcons.creditLoanIcon },
  { key: 'loan-records', label: t('creditLoan.loanRecords'), icon: LoanRecordsIcon },
  { key: 'betting-records', label: t('creditLoan.bettingRecords'), icon: BettingRecordsIcon }
])

const activeNavTab = computed(
  () => navTabs.value.find(tab => tab.key === activeNavKey.value) ?? navTabs.value[0]
)

const contentTabs = computed<{ key: ContentTabKey; label: string }[]>(() => [
  { key: 'game-lobby', label: t('creditLoan.gameLobby') },
  { key: 'loan-details', label: t('creditLoan.loanDetails') }
])

const LOAN_RULE_KEYS = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5', 'rule6'] as const

const loanRules = computed<CreditLoanRuleItem[]>(() =>
  LOAN_RULE_KEYS.map((key, index) => ({
    content: t(`creditLoan.rules.${key}`),
    highlight: CREDIT_LOAN_RULE_HIGHLIGHTS[index]
  }))
)

const gameTypeTabs = computed(() => [
  { sysGameTypeCode: '', sysGameTypeName: t('creditLoan.all') },
  ...casinoTabsStore.tabButtons
    .filter(item => !EXCLUDED_GAME_TYPE_CODES.has(item.sysGameTypeCode))
    .map(item => ({
      sysGameTypeCode: item.sysGameTypeCode,
      sysGameTypeName: item.sysGameTypeName
    }))
])

const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'gameType',
    title: t('creditLoan.gameType'),
    options: gameTypeTabs.value.map(item => ({
      label: item.sysGameTypeName,
      value: item.sysGameTypeCode
    }))
  }
])

const handleFilterApply = (values: Record<string, string | string[]>) => {
  const gameType = values.gameType
  activeGameTypeCode.value = typeof gameType === 'string' ? gameType : ''
}

const handleMobileNavSelect = (key: NavTabKey) => {
  activeNavKey.value = key
  showMoreMenu.value = false
}

const handleMobileBack = () => {
  if (activeNavKey.value !== 'credit-loan') {
    activeNavKey.value = 'credit-loan'
  }
}

const loadGameTypes = async () => {
  try {
    await casinoTabsStore.loadCasinoTabButtons()
  } catch (error) {
    console.error('credit loan game types failed', error)
  }
}

onMounted(() => {
  void loadGameTypes()
})

watch(locale, () => {
  void loadGameTypes()
})
</script>
