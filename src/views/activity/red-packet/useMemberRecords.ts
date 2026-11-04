import { computed, ref, watch, type Ref } from 'vue'
import Api from '@/api'
import type {
  MemberRecordResult,
  RedEnvelopeItem,
  RedEnvelopeType
} from '@/api/interface/red-envelope'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useUserStore } from '@/stores/user'

export const MEMBER_RECORD_PERIODS = [
  'all',
  'today',
  'yesterday',
  'last7Days',
  'last15Days',
  'last30Days'
] as const

export type MemberRecordPeriod = (typeof MEMBER_RECORD_PERIODS)[number]

export const RED_ENVELOPE_TYPES: RedEnvelopeType[] = [1, 2, 3, 4]

export interface MemberRecordFilters {
  redEnvelopeId?: number
  redEnvelopeType?: RedEnvelopeType
  period?: MemberRecordPeriod
}

const DAY_MS = 24 * 60 * 60 * 1000
const PAGE_SIZE = 20

/** 近 N 天含今天，所以起始日是 todayStart - (N - 1) 天。 */
const RECENT_PERIOD_DAYS = {
  last7Days: 7,
  last15Days: 15,
  last30Days: 30
} as const satisfies Partial<Record<MemberRecordPeriod, number>>

const getStartOfDay = (timestamp: number) => {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/** 按筛选周期计算 startTime / endTime，all 不限时间。 */
export const getPeriodRange = (period: MemberRecordPeriod, now = Date.now()) => {
  if (period === 'all') return {}
  const todayStart = getStartOfDay(now)
  const todayEnd = todayStart + DAY_MS - 1
  if (period === 'today') return { startTime: todayStart, endTime: todayEnd }
  if (period === 'yesterday') return { startTime: todayStart - DAY_MS, endTime: todayStart - 1 }

  const days = RECENT_PERIOD_DAYS[period]
  return { startTime: todayStart - (days - 1) * DAY_MS, endTime: todayEnd }
}

export function useMemberRecords(options: {
  filters: () => MemberRecordFilters
  sentinel: Ref<Element | null | undefined>
  root: Ref<Element | null | undefined>
}) {
  const userStore = useUserStore()
  const memberId = computed(
    () => userStore.userInfo?.memberId ?? userStore.acctInfo?.memberId ?? ''
  )
  const totalMoney = ref(0)

  const scroll = useInfiniteScroll<RedEnvelopeItem, MemberRecordResult>({
    sentinel: options.sentinel,
    root: options.root,
    pageSize: PAGE_SIZE,
    enabled: () => !!memberId.value,
    load: ({ page, pageSize }) => {
      const { redEnvelopeId, redEnvelopeType, period = 'all' } = options.filters()
      return Api.redEnvelope.getMemberRecord({
        current: page,
        size: pageSize,
        param: { memberId: memberId.value, redEnvelopeId, redEnvelopeType },
        ...getPeriodRange(period)
      })
    },
    getItems: response => response.recordPage?.records ?? [],
    getTotal: response => response.recordPage?.total,
    getHasMore: (response, { page, pageSize }) =>
      page * pageSize < (response.recordPage?.total ?? 0),
    dedupeBy: item => item.orderNo ?? item.redEnvelopeId,
    onSuccess: response => {
      totalMoney.value = Number(response.totalMoney ?? 0)
    }
  })

  watch(
    () => JSON.stringify(options.filters()),
    () => {
      totalMoney.value = 0
      void scroll.refresh()
    }
  )

  return {
    list: computed(() => scroll.list.value as RedEnvelopeItem[]),
    total: computed(() => scroll.total.value ?? 0),
    totalMoney,
    memberId,
    loading: scroll.loading,
    error: scroll.error,
    retry: scroll.retry
  }
}
