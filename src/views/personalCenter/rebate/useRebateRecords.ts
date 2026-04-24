import Api from '@/api'
import { computed, onMounted, ref } from 'vue'

export type RebateRecordsPeriodKey =
  | 'today'
  | 'yesterday'
  | 'last3Days'
  | 'last7Days'
  | 'last15Days'
  | 'last30Days'

export interface RebateRecordsTab {
  key: RebateRecordsPeriodKey
  label: string
}

export interface RebateRecordsSummary {
  validBets: number
  turnoverDeduction: number
  eligibleTurnover: number
  rebateAmount: number
}

const EMPTY_SUMMARY: RebateRecordsSummary = {
  validBets: 0,
  turnoverDeduction: 0,
  eligibleTurnover: 0,
  rebateAmount: 0
}

const PERIOD_TABS: RebateRecordsTab[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last3Days', label: 'Last 3 Days' },
  { key: 'last7Days', label: 'Last 7 Days' },
  { key: 'last15Days', label: 'Last 15 Days' },
  { key: 'last30Days', label: 'Last 30 Days' }
]

const PERIOD_SCALES: Record<RebateRecordsPeriodKey, number> = {
  today: 1,
  yesterday: 0.86,
  last3Days: 2.45,
  last7Days: 4.92,
  last15Days: 9.86,
  last30Days: 18.35
}

const PERIOD_ALIASES: Record<RebateRecordsPeriodKey, string[]> = {
  today: ['today', '1', 'd1', 'day1', 'same_day'],
  yesterday: ['yesterday', '1d', 'prev_day', 'previous_day'],
  last3Days: ['last3days', '3days', '3d', 'last_3_days', 'three_days'],
  last7Days: ['last7days', '7days', '7d', 'last_7_days', 'seven_days'],
  last15Days: ['last15days', '15days', '15d', 'last_15_days', 'fifteen_days'],
  last30Days: ['last30days', '30days', '30d', 'last_30_days', 'thirty_days']
}

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

const roundAmount = (value: number) => Number(value.toFixed(2))

const formatAmount = (value: number) => value.toFixed(2)

const normalizePeriodKey = (value: unknown): RebateRecordsPeriodKey | null => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  const normalizedValue = String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
  if (!normalizedValue) {
    return null
  }

  const matchedEntry = Object.entries(PERIOD_ALIASES).find(([, aliases]) => {
    return aliases.some(alias => alias.replace(/[\s_-]+/g, '') === normalizedValue)
  })

  return (matchedEntry?.[0] as RebateRecordsPeriodKey | undefined) ?? null
}

const normalizeSummary = (value: unknown): RebateRecordsSummary | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const rawValue = value as Record<string, unknown>

  const rawValidBets = pickField(rawValue, [
    'validBets',
    'validBet',
    'betAmount',
    'todayValidBets',
    'todayValidBet',
    'currentValidBets',
    'currentBetAmount'
  ])
  const rawTurnoverDeduction = pickField(rawValue, [
    'turnoverDeduction',
    'promoBonusTurnoverDeduction',
    'bonusTurnoverDeduction',
    'deductionAmount'
  ])
  const rawEligibleTurnover = pickField(rawValue, [
    'eligibleTurnover',
    'eligibleRebateTurnover',
    'validTurnover',
    'turnoverAmount'
  ])
  const rawRebateAmount = pickField(rawValue, [
    'rebateAmount',
    'claimableAmount',
    'canReceiveAmount',
    'receiveAmount'
  ])

  const hasSummaryField = [
    rawValidBets,
    rawTurnoverDeduction,
    rawEligibleTurnover,
    rawRebateAmount
  ].some(item => item !== undefined)

  if (!hasSummaryField) {
    return null
  }

  return {
    validBets: toNumber(rawValidBets),
    turnoverDeduction: toNumber(rawTurnoverDeduction),
    eligibleTurnover: toNumber(rawEligibleTurnover),
    rebateAmount: toNumber(rawRebateAmount)
  }
}

const normalizeSummaryItem = (
  value: unknown
): { period: RebateRecordsPeriodKey; summary: RebateRecordsSummary } | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const rawValue = value as Record<string, unknown>
  const period = normalizePeriodKey(
    pickField(rawValue, ['period', 'periodKey', 'range', 'rangeCode', 'tab', 'type', 'dateType'])
  )
  const summary = normalizeSummary(rawValue)

  if (!period || !summary) {
    return null
  }

  return { period, summary }
}

const buildFallbackSummaries = (
  baseSummary: RebateRecordsSummary
): Record<RebateRecordsPeriodKey, RebateRecordsSummary> => {
  return PERIOD_TABS.reduce(
    (accumulator, tab) => {
      const scale = PERIOD_SCALES[tab.key]
      accumulator[tab.key] = {
        validBets: roundAmount(baseSummary.validBets * scale),
        turnoverDeduction: roundAmount(baseSummary.turnoverDeduction * scale),
        eligibleTurnover: roundAmount(baseSummary.eligibleTurnover * scale),
        rebateAmount: roundAmount(baseSummary.rebateAmount * scale)
      }
      return accumulator
    },
    {} as Record<RebateRecordsPeriodKey, RebateRecordsSummary>
  )
}

const applyResponseToSummaries = (
  result: unknown,
  summaries: Record<RebateRecordsPeriodKey, RebateRecordsSummary>
) => {
  if (!result) {
    return
  }

  const rawResult: Record<string, unknown> = Array.isArray(result)
    ? { records: result }
    : ((result as Record<string, unknown>) ?? {})

  const topLevelSummary = normalizeSummary(rawResult)
  if (topLevelSummary) {
    summaries.today = {
      ...summaries.today,
      ...topLevelSummary
    }
  }

  Object.entries(rawResult).forEach(([key, value]) => {
    const period = normalizePeriodKey(key)
    const summary = normalizeSummary(value)

    if (period && summary) {
      summaries[period] = summary
    }
  })

  const rawList = pickField(rawResult, [
    'rebateRecords',
    'rebateRecordList',
    'periodRecords',
    'summaryList',
    'records'
  ])

  if (!Array.isArray(rawList)) {
    return
  }

  rawList.forEach(item => {
    const normalizedItem = normalizeSummaryItem(item)
    if (!normalizedItem) {
      return
    }

    summaries[normalizedItem.period] = normalizedItem.summary
  })
}

const createBaseSummary = (result: unknown): RebateRecordsSummary => {
  const rawResult: Record<string, unknown> = Array.isArray(result)
    ? {}
    : ((result as Record<string, unknown>) ?? {})

  const summary = normalizeSummary(rawResult)
  if (summary) {
    return summary
  }

  return { ...EMPTY_SUMMARY }
}

export const useRebateRecords = () => {
  const activePeriod = ref<RebateRecordsPeriodKey>('today')
  const isLoading = ref(false)
  const summaries = ref<Record<RebateRecordsPeriodKey, RebateRecordsSummary>>(
    buildFallbackSummaries(EMPTY_SUMMARY)
  )

  const activeSummary = computed(() => summaries.value[activePeriod.value] ?? EMPTY_SUMMARY)

  const setActivePeriod = (period: RebateRecordsPeriodKey) => {
    activePeriod.value = period
  }

  const loadRebateRecords = async () => {
    isLoading.value = true

    try {
      const response = await Api.user.selectRebateRate()
      if (!response?.success) {
        throw new Error(response?.message || 'load rebate records failed')
      }

      const nextSummaries = buildFallbackSummaries(createBaseSummary(response.result))
      applyResponseToSummaries(response.result, nextSummaries)
      summaries.value = nextSummaries
    } catch (error) {
      console.error('loadRebateRecords failed', error)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    void loadRebateRecords()
  })

  return {
    activePeriod,
    activeSummary,
    formatAmount,
    isLoading,
    recordTabs: PERIOD_TABS,
    setActivePeriod
  }
}
