<template>
  <div>
    <section v-if="isMobile" class="fixed inset-0 overflow-y-auto bg-bg-1">
      <H5Header
        title="洗码"
        :show-sort="true"
        :right-icon="supportHeaderIcon"
        @sort="handleSupportClick"
      />

      <main class="px-3.5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3.5">
        <section class="rounded-[14px] bg-bg-2 px-3.5 py-3.5">
          <div class="flex items-center gap-2.5">
            <div class="rebate-coin shrink-0">
              <span>$</span>
            </div>
            <p class="text-base font-[500] text-text-1">
              今日有效投注:
              <span class="ml-1 text-[18px] font-[700] leading-none">{{ todayValidBetsText }}</span>
            </p>
          </div>

          <div class="mt-5 grid grid-cols-2">
            <button
              type="button"
              class="border-r border-opacity-10 px-2 text-center"
              @click="openEligibleTurnoverPopup"
            >
              <p class="text-[16px] font-[700] leading-none text-text-1">
                {{ eligibleTurnoverText }}
              </p>
              <div class="mt-1.5 inline-flex items-center gap-1 text-text-2">
                <span class="text-[12px] leading-none">可计洗码流水</span>
                <InfoIcon class="h-3.5 w-3.5 text-text-2 opacity-80" />
              </div>
            </button>
            <div class="px-2 text-center">
              <p class="text-[16px] font-[700] leading-none text-theme-primary">
                {{ claimableAmountText }}
              </p>
              <p class="mt-1.5 text-[12px] text-text-2">可领取金额</p>
            </div>
          </div>
        </section>

        <button
          type="button"
          class="mt-3 h-[45px] w-full rounded-[10px] bg-theme-primary text-[16px] font-[700] text-text-4"
          @click="handleClaimRebate"
        >
          Claim
        </button>

        <div class="mt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            class="h-[45px] rounded-[10px] text-[16px] font-[500]"
            :class="
              activeTab === 'records'
                ? 'bg-bg-3 text-text-1'
                : 'bg-bg-2 text-text-2 hover:text-text-1'
            "
            @click="handleOpenRebateRecords"
          >
            洗码记录
          </button>
          <button
            type="button"
            class="inline-flex h-[45px] items-center justify-center gap-1 rounded-[10px] text-[16px] font-[500]"
            :class="
              activeTab === 'rules'
                ? 'bg-bg-3 text-text-1'
                : 'bg-bg-2 text-text-2 hover:text-text-1'
            "
            @click="openRebateRulesPopup"
          >
            <span>洗码规则</span>
            <InfoIcon class="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>

        <div class="mt-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            v-for="category in categoryOptions"
            :key="category.id"
            type="button"
            class="group flex min-w-[72px] shrink-0 flex-col items-center justify-center rounded-[12px] px-2 py-2"
            :class="
              activeCategory === category.id
                ? 'border border-theme-primary bg-theme-3 text-theme-primary'
                : 'border border-transparent bg-bg-2 text-text-2'
            "
            @click="activeCategory = category.id"
          >
            <component :is="category.icon" class="h-[18px] w-[18px]" />
            <span class="mt-1 text-[12px] font-[500] leading-none">{{ category.label }}</span>
          </button>
        </div>

        <section class="mt-3 rounded-[14px] bg-bg-2 px-3.5 py-3.5">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[12px] text-text-2">当前返水比例</p>
              <p class="mt-1 text-[18px] font-[700] leading-none text-text-1">
                {{ currentRebateText }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[12px] text-text-2">下一档返水比例</p>
              <p class="mt-1 text-[18px] font-[700] leading-none text-text-1">
                {{ nextRebateText }}
              </p>
            </div>
          </div>

          <div class="relative mt-3 h-3 rounded-full bg-mask-20">
            <div
              class="h-full rounded-full bg-theme-primary transition-all duration-300"
              :style="{ width: `${progressPercent}%` }"
            ></div>
            <span
              class="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-theme-primary px-2 py-[1px] text-[10px] font-[700] leading-none text-text-4"
            >
              {{ progressPercentText }}
            </span>
          </div>

          <p class="mt-2 text-[12px] text-text-2">
            当前有效投注:
            <span class="text-theme-primary">{{ currentValidBetsPlainText }}</span
            >/{{ targetValidBetsText }}
          </p>
        </section>

        <section class="mt-3 overflow-hidden rounded-[14px] bg-bg-2">
          <div class="grid grid-cols-[44px_1fr_1fr] bg-bg-3 px-3 py-3">
            <div></div>
            <div class="text-center text-[13px] text-text-2">有效投注</div>
            <div class="text-center text-[13px] text-text-2">返水比例</div>
          </div>

          <div
            v-for="(row, index) in rebateRows"
            :key="row.id"
            class="grid grid-cols-[44px_1fr_1fr] px-3 py-3"
            :class="index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2'"
          >
            <div class="flex items-center justify-center text-lg font-[700] text-theme-primary">
              {{ row.isCurrent ? '✓' : '' }}
            </div>
            <div class="text-center text-[14px] leading-none text-text-1">{{ row.validBets }}</div>
            <div class="text-center text-[14px] leading-none text-text-1">{{ row.rebateRate }}</div>
          </div>
        </section>
      </main>
    </section>

    <div v-else class="mx-auto max-w-[1336px] px-3.5 pb-6 pt-5">
      <h2 class="text-[30px] font-[700] text-text-1">洗码</h2>

      <section class="mt-3 rounded-[14px] bg-bg-2 px-6 py-5">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2.5">
            <div class="rebate-coin shrink-0">
              <span>$</span>
            </div>
            <p class="text-[16px] font-[500] text-text-1">
              今日有效投注:
              <span class="ml-1 text-[24px] font-[700] leading-none">{{ todayValidBetsText }}</span>
            </p>
          </div>

          <button
            type="button"
            class="h-[45px] min-w-[220px] rounded-[8px] bg-theme-primary px-5 text-sm font-[700] text-text-4"
            @click="handleClaimRebate"
          >
            Claim
          </button>
        </div>

        <div class="mt-4 grid grid-cols-2 border-t border-opacity-10 pt-4">
          <button
            type="button"
            class="border-r border-opacity-10 px-2 text-center"
            @click="openEligibleTurnoverPopup"
          >
            <p class="text-[26px] font-[700] leading-none text-text-1">
              {{ eligibleTurnoverText }}
            </p>
            <div class="mt-1.5 inline-flex items-center gap-1 text-text-2">
              <span class="text-sm">可计洗码流水</span>
              <InfoIcon class="h-3.5 w-3.5 opacity-80" />
            </div>
          </button>
          <div class="px-2 text-center">
            <p class="text-[26px] font-[700] leading-none text-theme-primary">
              {{ claimableAmountText }}
            </p>
            <p class="mt-1.5 text-sm text-text-2">可领取金额</p>
          </div>
        </div>
      </section>

      <div class="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="h-[44px] rounded-[10px] text-sm font-[600]"
          :class="
            activeTab === 'records'
              ? 'bg-bg-3 text-text-1'
              : 'bg-bg-2 text-text-2 hover:text-text-1'
          "
          @click="handleOpenRebateRecords"
        >
          洗码记录
        </button>
        <button
          type="button"
          class="inline-flex h-[44px] items-center justify-center gap-1 rounded-[10px] text-sm font-[600]"
          :class="
            activeTab === 'rules' ? 'bg-bg-3 text-text-1' : 'bg-bg-2 text-text-2 hover:text-text-1'
          "
          @click="openRebateRulesPopup"
        >
          <span>洗码规则</span>
          <InfoIcon class="h-3.5 w-3.5 opacity-80" />
        </button>
      </div>

      <div class="mt-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <button
          v-for="category in categoryOptions"
          :key="category.id"
          type="button"
          class="inline-flex h-[40px] min-w-[96px] shrink-0 items-center justify-center gap-1 rounded-full px-4 text-sm font-[600]"
          :class="
            activeCategory === category.id
              ? 'border border-theme-primary bg-theme-3 text-theme-primary'
              : 'border border-transparent bg-bg-2 text-text-2'
          "
          @click="activeCategory = category.id"
        >
          <component :is="category.icon" class="h-4 w-4" />
          <span>{{ category.label }}</span>
        </button>
      </div>

      <section class="mt-3 rounded-[14px] bg-bg-2 px-4 py-4">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-text-2">当前返水比例</p>
            <p class="mt-1 text-[26px] font-[700] leading-none text-text-1">
              {{ currentRebateText }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-text-2">下一档返水比例</p>
            <p class="mt-1 text-[26px] font-[700] leading-none text-text-1">{{ nextRebateText }}</p>
          </div>
        </div>

        <div class="relative mt-3 h-3 rounded-full bg-mask-20">
          <div
            class="h-full rounded-full bg-theme-primary transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          ></div>
          <span
            class="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-theme-primary px-2 py-[1px] text-xs font-[700] leading-none text-text-4"
          >
            {{ progressPercentText }}
          </span>
        </div>

        <p class="mt-2 text-sm text-text-2">
          当前有效投注:
          <span class="text-theme-primary">{{ currentValidBetsPlainText }}</span
          >/{{ targetValidBetsText }}
        </p>
      </section>

      <section class="mt-3 overflow-hidden rounded-[14px] bg-bg-2">
        <div class="grid grid-cols-[52px_1fr_1fr] bg-bg-3 px-4 py-3">
          <div></div>
          <div class="text-center text-sm text-text-2">有效投注</div>
          <div class="text-center text-sm text-text-2">返水比例</div>
        </div>

        <div
          v-for="(row, index) in rebateRows"
          :key="row.id"
          class="grid grid-cols-[52px_1fr_1fr] px-4 py-3"
          :class="index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2'"
        >
          <div class="flex items-center justify-center text-xl font-[700] text-theme-primary">
            {{ row.isCurrent ? '✓' : '' }}
          </div>
          <div class="text-center text-sm font-[600] text-text-1">{{ row.validBets }}</div>
          <div class="text-center text-sm font-[600] text-text-1">{{ row.rebateRate }}</div>
        </div>
      </section>
    </div>

    <ClaimSuccessPopup
      v-model:visible="showClaimSuccessPopup"
      :amount="claimableAmountText"
      @confirm="handleClaimSuccessConfirm"
    />

    <popShell
      v-model="showRebateRecordsPopup"
      transition-type="modal"
      @close="closeRebateRecordsPopup"
    >
      <section
        class="mx-auto max-h-[72vh] w-[460px] overflow-hidden rounded-[12px] bg-bg-2 shadow-[0_18px_54px_rgba(0,0,0,0.32)]"
      >
        <div class="relative flex items-center justify-center bg-bg-3 px-4 py-3">
          <h3 class="text-[16px] font-[700] leading-[20px] text-text-1">Rebate Records</h3>
          <button
            type="button"
            class="absolute right-4 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-[8px] bg-white/10 text-text-1"
            @click="closeRebateRecordsPopup"
          >
            <CloseIcon class="h-4 w-4" />
          </button>
        </div>

        <div class="max-h-[calc(72vh-52px)] overflow-y-auto px-4 pb-4 pt-3">
          <RebateRecordsContent panel-mode />
        </div>
      </section>
    </popShell>

    <popShell
      v-model="showEligibleTurnoverPopup"
      :transition-type="isMobile ? 'bottom-sheet' : 'modal'"
    >
      <section
        class="eligible-turnover-panel w-full bg-bg-2 text-text-1"
        :class="
          isMobile
            ? 'rounded-t-[18px] px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4'
            : 'mx-auto w-[360px] rounded-[12px] px-4 pb-5 pt-3 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
        "
      >
        <div class="relative flex items-center justify-center">
          <h3
            class="text-center font-[700] text-text-1"
            :class="isMobile ? 'text-[20px] leading-[24px]' : 'text-[16px] leading-[20px]'"
          >
            Eligible Turnover
          </h3>
          <button
            type="button"
            class="absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[10px] bg-bg-3 text-text-1"
            :class="isMobile ? 'h-[40px] w-[40px]' : 'h-[28px] w-[28px]'"
            @click="closeEligibleTurnoverPopup"
          >
            <CloseIcon :class="isMobile ? 'h-5 w-5' : 'h-4 w-4'" />
          </button>
        </div>

        <div class="mt-5 rounded-[12px] bg-bg-3" :class="isMobile ? 'px-4 py-5' : 'px-4 py-4'">
          <div class="flex items-center justify-between gap-3 text-text-2">
            <span :class="isMobile ? 'text-[12px] leading-[16px]' : 'text-[14px] leading-[20px]'">
              Pending Rebate Turnover
            </span>
            <span
              class="shrink-0 text-right text-text-1"
              :class="isMobile ? 'text-[14px]' : 'text-[16px]'"
            >
              {{ pendingRebateTurnoverText }}
            </span>
          </div>
          <div
            class="mt-4 flex items-center justify-between gap-3 text-text-2"
            :class="isMobile ? 'text-[12px] leading-[16px]' : 'text-[14px] leading-[20px]'"
          >
            <span>Promo Bonus Turnover Deduction</span>
            <span
              class="shrink-0 text-right text-text-1"
              :class="isMobile ? 'text-[14px]' : 'text-[16px]'"
            >
              {{ promoBonusTurnoverDeductionText }}
            </span>
          </div>
          <div
            class="mt-4 flex items-center justify-between gap-3"
            :class="isMobile ? 'text-[12px] leading-[16px]' : 'text-[14px] leading-[20px]'"
          >
            <span class="text-text-2">Eligible Rebate Turnover</span>
            <span
              class="shrink-0 text-right text-theme-primary"
              :class="isMobile ? 'text-[14px]' : 'text-[16px]'"
            >
              {{ eligibleTurnoverText }}
            </span>
          </div>
        </div>

        <div class="mt-6">
          <p class="font-[700] text-text-1" :class="isMobile ? 'text-[12px]' : 'text-[14px]'">
            Calculation Rule :
          </p>
          <p
            class="mt-2 text-text-2"
            :class="isMobile ? 'text-[12px] leading-[18px]' : 'text-[14px] leading-[22px]'"
          >
            Pending rebate turnover - promo bonus turnover deduction = eligible rebate turnover.
          </p>
        </div>

        <div class="mt-6">
          <p class="font-[700] text-text-1" :class="isMobile ? 'text-[12px]' : 'text-[14px]'">
            Promo Bonus Turnover Deduction Note :
          </p>
          <p
            class="mt-2 text-text-2"
            :class="isMobile ? 'text-[12px] leading-[18px]' : 'text-[14px] leading-[22px]'"
          >
            Turnover generated from claimed promo bonuses that is not eligible for rebate.
          </p>
        </div>
      </section>
    </popShell>

    <popShell
      v-model="showRebateRulesPopup"
      :transition-type="isMobile ? 'bottom-sheet' : 'modal'"
      @close="closeRebateRulesPopup"
    >
      <section
        class="rebate-rules-panel w-full bg-bg-2 text-text-1"
        :class="
          isMobile
            ? 'max-h-[calc(100dvh-120px)] overflow-y-auto rounded-t-[18px] px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4'
            : 'mx-auto max-h-[70vh] w-[420px] overflow-y-auto rounded-[12px] px-4 pb-5 pt-3 shadow-[0_18px_54px_rgba(0,0,0,0.32)]'
        "
      >
        <div class="relative flex items-center justify-center">
          <h3
            class="text-center font-[700] text-text-1"
            :class="isMobile ? 'text-[20px] leading-[24px]' : 'text-[16px] leading-[20px]'"
          >
            Rebate Rules
          </h3>
          <button
            type="button"
            class="absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[10px] bg-bg-3 text-text-1"
            :class="isMobile ? 'h-[40px] w-[40px]' : 'h-[28px] w-[28px]'"
            @click="closeRebateRulesPopup"
          >
            <CloseIcon :class="isMobile ? 'h-5 w-5' : 'h-4 w-4'" />
          </button>
        </div>

        <div class="mt-6 space-y-6">
          <section v-for="section in rebateRuleSections" :key="section.title">
            <h4
              class="font-[700] text-text-1"
              :class="isMobile ? 'text-[14px] leading-[20px]' : 'text-[14px] leading-[20px]'"
            >
              {{ section.title }}
            </h4>
            <p
              v-if="section.content"
              class="mt-2 whitespace-pre-line text-text-2"
              :class="isMobile ? 'text-[12px] leading-[18px]' : 'text-[14px] leading-[22px]'"
            >
              {{ section.content }}
            </p>
            <ul
              v-if="section.items?.length"
              class="rebate-rules-list mt-2 text-text-2"
              :class="isMobile ? 'text-[12px] leading-[18px]' : 'text-[14px] leading-[22px]'"
            >
              <li v-for="item in section.items" :key="item">
                {{ item }}
              </li>
            </ul>
          </section>
        </div>
      </section>
    </popShell>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Component } from 'vue'
import Api from '@/api'
import ClaimSuccessPopup from '@/components/common/ClaimSuccessPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import popShell from '@/components/withdraw/popShell.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { casinoIcons } from '@/static/svg/casino'
import CloseIcon from '@/static/svg/close.svg?component'
import InfoIcon from '@/static/svg/info.svg?component'
import { sideIcons } from '@/static/svg/side'
import { navigateTo } from '@/utils/router'
import RebateRecordsContent from './components/RebateRecordsContent.vue'

type RebateTab = 'records' | 'rules'

type RebateCategory = {
  id: string
  label: string
  icon: Component
}

type RebateRow = {
  id: string
  validBets: string
  rebateRate: string
  isCurrent: boolean
}

type RebateRuleSection = {
  title: string
  content: string
  items?: string[]
}

const isMobile = useIsMobile()
const { side } = sideIcons

const activeTab = ref<RebateTab>('records')
const activeCategory = ref('slots')
const showClaimSuccessPopup = ref(false)
const showRebateRecordsPopup = ref(false)
const showEligibleTurnoverPopup = ref(false)
const showRebateRulesPopup = ref(false)

const todayValidBets = ref(0)
const eligibleTurnover = ref(0)
const pendingRebateTurnover = ref(0)
const promoBonusTurnoverDeduction = ref(0)
const claimableAmount = ref(0)
const currentValidBets = ref(0)
const targetValidBets = ref(500000)
const currentRebateValue = ref(0.7)
const nextRebateValue = ref(0.8)
const rebateRowsFromApi = ref<RebateRow[]>([])

const supportHeaderIcon = side.helpIcon
const rebateRuleSections: RebateRuleSection[] = [
  {
    title: 'Rebate Explanation :',
    content:
      'Rebates are calculated based on your valid bets and applicable rebate rate. The more you bet, the more rebate you can receive.'
  },
  {
    title: 'Calculation Period :',
    content:
      'Only valid bets placed within the recent period set by the system, such as the last 7 or 30 days, will be counted. Bets placed outside this period will be cleared automatically and will no longer be included in the rebate calculation.'
  },
  {
    title: 'Claim Rules :',
    content:
      'Once your rebate amount meets the claim requirement, you may claim it. The minimum claim amount must be greater than 0.01. The actual claim method is subject to what is shown on the page.'
  },
  {
    title: 'Payout Method :',
    content:
      'Rebate rewards will be credited to your account in cash. Please refer to the actual amount received.'
  },
  {
    title: 'Valid Bet Rules :',
    content:
      'Only bets that meet the platform rules will be counted as valid bets. The following are not eligible for rebate:',
    items: [
      'Invalid or cancelled orders;',
      'Hedge betting or other abnormal betting behavior;',
      'Certain promotional activities or selected games.'
    ]
  },
  {
    title: 'Calculation Formula :',
    content:
      'Rebate Amount = Valid Bets × Applicable Rebate Rate.\nRebate rates may vary by game. Please refer to the rate shown on the page.'
  }
] as const

const pickField = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }

  return undefined
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const toRateNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'string' && value.includes('%')) {
    return toNumber(value.replace('%', ''), fallback)
  }

  return toNumber(value, fallback)
}

const toRateText = (value: unknown, fallback = '0.00%') => {
  if (typeof value === 'string') {
    const normalizedValue = value.trim()
    if (!normalizedValue) {
      return fallback
    }

    if (normalizedValue.includes('%')) {
      return normalizedValue
    }

    const parsedValue = Number(normalizedValue)
    return Number.isFinite(parsedValue) ? `${parsedValue.toFixed(2)}%` : fallback
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value.toFixed(2)}%`
  }

  return fallback
}

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase()
    return normalizedValue === '1' || normalizedValue === 'true' || normalizedValue === 'yes'
  }

  return false
}

const normalizeRebateRow = (value: unknown, index: number): RebateRow | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const rawRow = value as Record<string, unknown>
  const rawValidBets = pickField(rawRow, [
    'validBets',
    'validBet',
    'betRange',
    'threshold',
    'title',
    'name'
  ])
  const validBets = String(rawValidBets ?? '').trim()
  if (!validBets) {
    return null
  }

  const rawRate = pickField(rawRow, ['rebateRate', 'rate', 'rebate', 'ratio', 'percent'])
  const rawCurrent = pickField(rawRow, ['isCurrent', 'current', 'active', 'selected'])
  const rawId = pickField(rawRow, ['id', 'rowId', 'levelId', 'sortNum'])

  return {
    id: String(rawId ?? `row-${index}`),
    validBets,
    rebateRate: toRateText(rawRate, '0.00%'),
    isCurrent: toBoolean(rawCurrent)
  }
}

const applyRebateRateResponse = (result: unknown) => {
  if (!result) {
    return
  }

  const rawResult: Record<string, unknown> = Array.isArray(result)
    ? { list: result }
    : ((result as Record<string, unknown>) ?? {})

  const todayValidBetsValue = pickField(rawResult, [
    'todayValidBets',
    'todayValidBet',
    'todayBetAmount'
  ])
  const eligibleTurnoverValue = pickField(rawResult, [
    'eligibleTurnover',
    'validTurnover',
    'turnoverAmount'
  ])
  const claimableAmountValue = pickField(rawResult, [
    'claimableAmount',
    'rebateAmount',
    'canReceiveAmount',
    'receiveAmount'
  ])
  const pendingRebateTurnoverValue = pickField(rawResult, [
    'pendingRebateTurnover',
    'pendingTurnover',
    'pendingBetAmount',
    'waitRebateTurnover'
  ])
  const promoBonusTurnoverDeductionValue = pickField(rawResult, [
    'promoBonusTurnoverDeduction',
    'bonusTurnoverDeduction',
    'turnoverDeduction',
    'deductionAmount'
  ])
  const currentValidBetsValue = pickField(rawResult, [
    'currentValidBets',
    'currentBetAmount',
    'validBetAmount'
  ])
  const targetValidBetsValue = pickField(rawResult, [
    'targetValidBets',
    'nextLevelValidBets',
    'targetBetAmount'
  ])
  const currentRebateRate = pickField(rawResult, [
    'currentRebate',
    'currentRebateRate',
    'rebateRate'
  ])
  const nextRebateRate = pickField(rawResult, ['nextRebate', 'nextRebateRate'])

  if (todayValidBetsValue !== undefined) {
    todayValidBets.value = toNumber(todayValidBetsValue, todayValidBets.value)
  }
  if (eligibleTurnoverValue !== undefined) {
    eligibleTurnover.value = toNumber(eligibleTurnoverValue, eligibleTurnover.value)
  }
  if (claimableAmountValue !== undefined) {
    claimableAmount.value = toNumber(claimableAmountValue, claimableAmount.value)
  }
  if (promoBonusTurnoverDeductionValue !== undefined) {
    promoBonusTurnoverDeduction.value = toNumber(
      promoBonusTurnoverDeductionValue,
      promoBonusTurnoverDeduction.value
    )
  }
  if (pendingRebateTurnoverValue !== undefined) {
    pendingRebateTurnover.value = toNumber(pendingRebateTurnoverValue, pendingRebateTurnover.value)
  } else if (eligibleTurnoverValue !== undefined) {
    pendingRebateTurnover.value =
      toNumber(eligibleTurnoverValue, eligibleTurnover.value) + promoBonusTurnoverDeduction.value
  }
  if (currentValidBetsValue !== undefined) {
    currentValidBets.value = toNumber(currentValidBetsValue, currentValidBets.value)
  }
  if (targetValidBetsValue !== undefined) {
    targetValidBets.value = toNumber(targetValidBetsValue, targetValidBets.value)
  }
  if (currentRebateRate !== undefined) {
    currentRebateValue.value = toRateNumber(currentRebateRate, currentRebateValue.value)
  }
  if (nextRebateRate !== undefined) {
    nextRebateValue.value = toRateNumber(nextRebateRate, nextRebateValue.value)
  }

  const rawRateList = pickField(rawResult, [
    'rebateRates',
    'rebateRateList',
    'list',
    'rows',
    'records'
  ])

  if (Array.isArray(rawRateList)) {
    const normalizedRows = rawRateList
      .map((item, index) => normalizeRebateRow(item, index))
      .filter((item): item is RebateRow => item !== null)

    if (normalizedRows.length > 0) {
      if (!normalizedRows.some(item => item.isCurrent)) {
        normalizedRows[0].isCurrent = true
      }
      rebateRowsFromApi.value = normalizedRows
    }
  }
}

const loadRebateRate = async () => {
  try {
    const response = await Api.user.selectRebateRate()
    if (!response?.success) {
      throw new Error(response?.message || 'load rebate rate failed')
    }

    applyRebateRateResponse(response.result)
  } catch (error) {
    console.error('loadRebateRate failed', error)
  }
}

onMounted(() => {
  void loadRebateRate()
})

const categoryOptions = computed<RebateCategory[]>(() => [
  {
    id: 'slots',
    label: '老虎机',
    icon: casinoIcons.slots
  },
  {
    id: 'table',
    label: '桌面游戏',
    icon: casinoIcons.table_games
  },
  {
    id: 'fishing',
    label: '捕鱼',
    icon: casinoIcons.fishing
  },
  {
    id: 'roulette',
    label: '轮盘',
    icon: casinoIcons.roulette
  },
  {
    id: 'sports',
    label: '体育',
    icon: casinoIcons.football
  },
  {
    id: 'lottery',
    label: '彩票',
    icon: side.lotteryIcon
  }
])

const formatAmount = (value: number) => {
  return value.toFixed(2)
}

const formatDetailAmount = (value: number) => {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

const todayValidBetsText = computed(() => formatAmount(todayValidBets.value))
const eligibleTurnoverText = computed(() => formatAmount(eligibleTurnover.value))
const pendingRebateTurnoverText = computed(() => formatDetailAmount(pendingRebateTurnover.value))
const promoBonusTurnoverDeductionText = computed(() =>
  formatDetailAmount(promoBonusTurnoverDeduction.value)
)
const claimableAmountText = computed(() => formatAmount(claimableAmount.value))

const currentRebateText = computed(() => `${currentRebateValue.value.toFixed(2)}%`)
const nextRebateText = computed(() => `${nextRebateValue.value.toFixed(2)}%`)
const currentValidBetsPlainText = computed(() => String(Math.floor(currentValidBets.value)))
const targetValidBetsText = computed(() => String(Math.floor(targetValidBets.value)))

const progressPercent = computed(() => {
  if (!targetValidBets.value) {
    return 0
  }

  const ratio = (currentValidBets.value / targetValidBets.value) * 100
  return Math.min(Math.max(ratio, 0), 100)
})

const progressPercentText = computed(() => `${Math.floor(progressPercent.value)}%`)

const defaultRebateRows = computed<RebateRow[]>(() => {
  const validBetTiers = ['1+', '100K+', '200K+', '300K+', '400K+', '500K+', '600K+', '700K+']
  const rateValues = isMobile.value
    ? [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4]
    : [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]

  return validBetTiers.map((validBets, index) => ({
    id: `row-${validBets}-${index}`,
    validBets,
    rebateRate: `${rateValues[index].toFixed(2)}%`,
    isCurrent: index === 0
  }))
})

const rebateRows = computed<RebateRow[]>(() => {
  if (rebateRowsFromApi.value.length > 0) {
    return rebateRowsFromApi.value
  }

  return defaultRebateRows.value
})

const handleClaimRebate = () => {
  showClaimSuccessPopup.value = true
}

const handleClaimSuccessConfirm = () => {
  showClaimSuccessPopup.value = false
}

const handleOpenRebateRecords = () => {
  activeTab.value = 'records'

  if (isMobile.value) {
    void navigateTo('/personal-center/rebate-records')
    return
  }

  showRebateRecordsPopup.value = true
}

const closeRebateRecordsPopup = () => {
  showRebateRecordsPopup.value = false
}

const openEligibleTurnoverPopup = () => {
  showEligibleTurnoverPopup.value = true
}

const closeEligibleTurnoverPopup = () => {
  showEligibleTurnoverPopup.value = false
}

const openRebateRulesPopup = () => {
  activeTab.value = 'rules'
  showRebateRulesPopup.value = true
}

const closeRebateRulesPopup = () => {
  showRebateRulesPopup.value = false
  activeTab.value = 'records'
}

const handleSupportClick = () => {
  console.log('open live support')
}
</script>

<style scoped lang="scss">
.rebate-rules-list {
  padding-left: 18px;
  list-style: disc;
}

.rebate-coin {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 30% 30%,
    #ffd78e 0%,
    #ffb845 36%,
    #ff9a2e 68%,
    #ef7d12 100%
  );
  box-shadow:
    inset 0 0 0 2px rgba(255, 232, 178, 0.45),
    0 3px 8px rgba(0, 0, 0, 0.22);

  span {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    color: #ff7f2a;
    background: rgba(255, 245, 199, 0.92);
    box-shadow: inset 0 0 0 1px rgba(255, 172, 75, 0.5);
  }
}

@media (max-width: 767px) {
  .rebate-coin {
    width: 46px;
    height: 46px;

    span {
      width: 30px;
      height: 30px;
      font-size: 19px;
    }
  }
}
</style>
