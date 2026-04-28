import Api from '@/api'
import type { QueryRebateDetailPageRecord } from '@/api/interface/user'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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

const DAY_MS = 24 * 60 * 60 * 1000
const THIRTY_DAYS_MS = 30 * DAY_MS

const EMPTY_SUMMARY: RebateRecordsSummary = {
  validBets: 0,
  turnoverDeduction: 0,
  eligibleTurnover: 0,
  rebateAmount: 0
}

const PERIOD_TAB_KEYS: RebateRecordsPeriodKey[] = [
  'today',
  'yesterday',
  'last3Days',
  'last7Days',
  'last15Days',
  'last30Days'
]

const toNumber = (value: unknown, fallback = 0) => {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const roundAmount = (value: number) => Number(value.toFixed(2))

const formatAmount = (value: number) => value.toFixed(2)

const getStartOfDay = (timestamp: number) => {
  const targetDate = new Date(timestamp)
  targetDate.setHours(0, 0, 0, 0)
  return targetDate.getTime()
}

const getPeriodRange = (period: RebateRecordsPeriodKey, currentTimestamp = Date.now()) => {
  const todayStart = getStartOfDay(currentTimestamp)

  switch (period) {
    case 'today':
      return {
        start: todayStart,
        end: currentTimestamp
      }
    case 'yesterday':
      return {
        start: todayStart - DAY_MS,
        end: todayStart - 1
      }
    case 'last3Days':
      return {
        start: todayStart - 2 * DAY_MS,
        end: currentTimestamp
      }
    case 'last7Days':
      return {
        start: todayStart - 6 * DAY_MS,
        end: currentTimestamp
      }
    case 'last15Days':
      return {
        start: todayStart - 14 * DAY_MS,
        end: currentTimestamp
      }
    case 'last30Days':
      return {
        start: todayStart - 29 * DAY_MS,
        end: currentTimestamp
      }
    default:
      return {
        start: todayStart,
        end: currentTimestamp
      }
  }
}

const filterRecordsByPeriod = (
  records: QueryRebateDetailPageRecord[],
  period: RebateRecordsPeriodKey
) => {
  const { start, end } = getPeriodRange(period)

  return records.filter(record => {
    const createDate = toNumber(record.createDate, NaN)
    if (!Number.isFinite(createDate)) {
      return false
    }

    return createDate >= start && createDate <= end
  })
}

const summarizeRecords = (records: QueryRebateDetailPageRecord[]): RebateRecordsSummary => {
  if (!records.length) {
    return { ...EMPTY_SUMMARY }
  }

  const total = records.reduce<RebateRecordsSummary>(
    (accumulator, record) => {
      const betAmount = toNumber(record.betAmount)
      const amountRate = toNumber(record.amountRate)
      const rebatePoints = toNumber(record.rebatePoints)

      accumulator.validBets += betAmount
      accumulator.eligibleTurnover += amountRate
      accumulator.rebateAmount += rebatePoints
      accumulator.turnoverDeduction += rebatePoints - amountRate
      return accumulator
    },
    { ...EMPTY_SUMMARY }
  )

  return {
    validBets: roundAmount(total.validBets),
    turnoverDeduction: roundAmount(total.turnoverDeduction),
    eligibleTurnover: roundAmount(total.eligibleTurnover),
    rebateAmount: roundAmount(total.rebateAmount)
  }
}

export const useRebateRecords = () => {
  const { t } = useI18n()
  const activePeriod = ref<RebateRecordsPeriodKey>('today')
  const isLoading = ref(false)
  const allRecords = ref<QueryRebateDetailPageRecord[]>([])
  const recordTabs = computed<RebateRecordsTab[]>(() =>
    PERIOD_TAB_KEYS.map(key => ({
      key,
      label: t(`rebatePage.records.periodTabs.${key}`)
    }))
  )

  const activeSummary = computed(() => {
    const filteredRecords = filterRecordsByPeriod(allRecords.value, activePeriod.value)
    return summarizeRecords(filteredRecords)
  })

  const setActivePeriod = (period: RebateRecordsPeriodKey) => {
    activePeriod.value = period
  }

  const loadRebateRecords = async () => {
    isLoading.value = true

    try {
      const endTime = Date.now()
      const startTime = endTime - THIRTY_DAYS_MS

      const response = await Api.user.queryRebateDetailPage({
        startTime,
        endTime,
        page: {
          current: 1,
          size: 500
        }
      })
      if (!response?.success) {
        throw new Error(response?.message || 'load rebate records failed')
      }

      allRecords.value = Array.isArray(response.result?.records) ? response.result.records : []
    } catch (error) {
      console.error('loadRebateRecords failed', error)
      allRecords.value = []
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
    recordTabs,
    setActivePeriod
  }
}
