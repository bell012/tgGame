import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { RecordForm, RecordResult } from '@/api/interface/activity'
import { formatTimestamp } from '@/utils/date'
import { getStorageLanguageCode } from '@/utils/locale'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { createBetHistoryTimeOptions } from '@/views/wallet/betHistory/shared'
import {
  normalizeLanguageCode,
  resolveLanguageInfo
} from '@/views/activity/ticket/shared/mbTicketMapper'
import voucherIcon1 from '@/static/img/vouchers/icon1.png'
import voucherIcon2 from '@/static/img/vouchers/icon2.png'
import voucherIcon3 from '@/static/img/vouchers/icon3.png'
import voucherIcon4 from '@/static/img/vouchers/icon4.png'
import voucherIcon6 from '@/static/img/vouchers/icon6.png'

type TranslateFn = (key: string) => string
export type VoucherHistoryRecord = RecordResult['records'][number]
export type FilterValue = string | string[] | undefined

/** 票卷记录每页条数 */
export const VOUCHER_HISTORY_PAGE_SIZE = 10

/** 页面展示项 */
export interface Item {
  id: string
  type: number
  icon: string
  name: string
  amount: number | null
  amountText: string
  usedAtText: string
  rawData: VoucherHistoryRecord
}

export interface SelectOption {
  label: string
  value: string
}

export interface VoucherHistoryFilterValues {
  time: string
  type: string
}

type FilterInput = Partial<Record<string, FilterValue>>

const VOUCHER_ICON_MAP: Record<number, string> = {
  1: voucherIcon1,
  2: voucherIcon2,
  3: voucherIcon3,
  4: voucherIcon4,
  6: voucherIcon6
}

const VOUCHER_TYPE_NAME_KEY: Record<number, string> = {
  1: 'vouchers.cashVoucher',
  2: 'vouchers.redPacketVoucher',
  3: 'vouchers.goldenEggVoucher',
  4: 'vouchers.luckySpinVoucher',
  6: 'vouchers.mysteryBoxVoucher'
}

export const createDefaultVoucherHistoryFilterValues = (): VoucherHistoryFilterValues => ({
  time: 'all',
  type: 'all'
})

export const createVoucherHistoryTimeOptions = (t: TranslateFn): SelectOption[] =>
  createBetHistoryTimeOptions(t)

export const createVoucherHistoryTypeOptions = (t: TranslateFn): SelectOption[] => [
  { label: t('betHistory.filterOptions.all'), value: 'all' },
  { label: t('vouchers.cashVoucher'), value: '1' },
  { label: t('vouchers.redPacketVoucher'), value: '2' },
  { label: t('vouchers.goldenEggVoucher'), value: '3' },
  { label: t('vouchers.luckySpinVoucher'), value: '4' },
  { label: t('vouchers.mysteryBoxVoucher'), value: '6' }
]

const getSingleFilterValue = (value: FilterValue) =>
  Array.isArray(value) ? (value[0] ?? 'all') : (value ?? 'all')

export const normalizeVoucherHistoryFilterValues = (
  values: FilterInput
): VoucherHistoryFilterValues => ({
  time: getSingleFilterValue(values.time),
  type: getSingleFilterValue(values.type)
})

const getTimeRange = (value: string) => {
  const now = new Date()
  const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0)).getTime()
  const endOfDay = (date: Date) => new Date(date.setHours(23, 59, 59, 999)).getTime()

  if (value === 'all') return { startReceiveTime: null, endReceiveTime: null }
  if (value === 'today')
    return { startReceiveTime: startOfDay(new Date(now)), endReceiveTime: now.getTime() }
  if (value === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return {
      startReceiveTime: startOfDay(new Date(yesterday)),
      endReceiveTime: endOfDay(new Date(yesterday))
    }
  }

  const dayMap: Record<string, number> = { last3days: 3, last15days: 15, last30days: 30 }
  const days = dayMap[value]
  if (!days) return { startReceiveTime: null, endReceiveTime: null }

  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - (days - 1))
  return { startReceiveTime: startOfDay(startDate), endReceiveTime: now.getTime() }
}

export const buildVoucherHistoryQueryForm = (params: {
  page: number
  pageSize: number
  filterValues: FilterInput
}): RecordForm => {
  const normalized = normalizeVoucherHistoryFilterValues(params.filterValues)
  const { startReceiveTime, endReceiveTime } = getTimeRange(normalized.time)
  const form: RecordForm = {
    current: params.page,
    size: params.pageSize,
    status: 1
  }
  if (normalized.type !== 'all') {
    form.type = Number(normalized.type)
  }
  if (startReceiveTime !== null) {
    form.startReceiveTime = startReceiveTime
  }
  if (endReceiveTime !== null) {
    form.endReceiveTime = endReceiveTime
  }
  return form
}

/** 从 languageInfo 中根据当前语言的 name；无匹配时回退到 ticketName */
const resolveVoucherName = (
  record: VoucherHistoryRecord,
  currentLanguageCode: string,
  t: TranslateFn
): string => {
  const languageInfoEntry = resolveLanguageInfo(
    record.languageInfo as Parameters<typeof resolveLanguageInfo>[0],
    currentLanguageCode
  )
  const nameFromLanguageInfo = languageInfoEntry?.name?.trim()
  if (nameFromLanguageInfo) {
    return nameFromLanguageInfo
  }

  if (record.ticketName) {
    return record.ticketName
  }

  const fallbackKey = VOUCHER_TYPE_NAME_KEY[Number(record.ticketType)]
  return fallbackKey ? t(fallbackKey) : '--'
}

/** 唯一 id，优先 rowId */
const resolveItemId = (record: VoucherHistoryRecord): string => {
  if (record.rowId !== undefined && record.rowId !== null) {
    return String(record.rowId)
  }
  if (record.ticketId !== undefined && record.ticketId !== null) {
    return `t-${record.ticketId}-${record.receiveTime ?? ''}`
  }
  return `${record.memberRowId ?? ''}-${record.ticketType ?? ''}-${record.receiveTime ?? ''}`
}

/** 把金额格式化为带 +/- 符号的字符串；当接口未返回 amount 时返回空串 */
const formatAmountText = (amount: number | null): string => {
  if (amount === null) return ''
  if (amount > 0) return `+${amount}`
  if (amount < 0) return `${amount}`
  return '0'
}

/** 单条记录 → 页面展示项 */
export const mapRecordToItem = (
  record: VoucherHistoryRecord,
  currentLanguageCode: string,
  t: TranslateFn
): Item => {
  const type = Number(record.ticketType ?? 0)
  const hasAmount = typeof record.amount === 'number' && Number.isFinite(record.amount)
  const amount = hasAmount ? (record.amount as number) : null

  return {
    id: resolveItemId(record),
    type,
    icon: VOUCHER_ICON_MAP[type] ?? voucherIcon1,
    name: resolveVoucherName(record, currentLanguageCode, t),
    amount,
    amountText: formatAmountText(amount),
    usedAtText: formatTimestamp(record.useTime || record.createTime),
    rawData: record
  }
}

/** 计算当前列表中所有 item 的 amount 总和（缺失 amount 的不计入） */
export const calcTotalBonusWon = (items: ReadonlyArray<{ amount: number | null }>): number =>
  items.reduce((sum, item) => (item.amount === null ? sum : sum + item.amount), 0)

/** 把 totalBonusWon 展示文本 */
export const formatTotalBonusWonText = (total: number): string => {
  if (total > 0) return `${total}`
  if (total < 0) return `${total}`
  return '0'
}

/** 根据 total 判断是否还有下一页 */
export const hasMoreByTotal = (
  total: number | undefined,
  page: number,
  pageSize: number,
  count: number
) => (typeof total === 'number' ? page * pageSize < total : count >= pageSize)

/** 当前站点语言 */
const useCurrentLanguageCode = () => {
  const { locale } = useI18n()
  return computed(() => normalizeLanguageCode(getStorageLanguageCode(String(locale.value))))
}

/**
 * PC 端组合式逻辑：传统分页，每次切换页或筛选都直接替换列表。
 *
 * 返回：筛选值、列表、loading/error、currentPage/totalPages、totalBonusWon，
 * 以及 fetchData / handlePageChange 两个动作。
 */
export const useVoucherHistoryPagedPage = () => {
  const { t } = useI18n()
  const currentLanguageCode = useCurrentLanguageCode()

  const filterValues = ref<VoucherHistoryFilterValues>(createDefaultVoucherHistoryFilterValues())
  const dataList = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<unknown | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)

  const totalBonusWon = computed(() => calcTotalBonusWon(dataList.value))
  const totalBonusWonText = computed(() => formatTotalBonusWonText(totalBonusWon.value))

  /** 拉取指定页数据 */
  const fetchData = async (page = 1) => {
    loading.value = true
    error.value = null
    try {
      const response = await Api.activity.recordList(
        buildVoucherHistoryQueryForm({
          page,
          pageSize: VOUCHER_HISTORY_PAGE_SIZE,
          filterValues: filterValues.value
        })
      )
      if (!response.success) {
        throw new Error(response.message || t('common.requestError'))
      }
      const records = response.result?.records ?? []
      dataList.value = records.map(record => mapRecordToItem(record, currentLanguageCode.value, t))
      currentPage.value = response.result?.current || page
      totalPages.value = Math.max(1, response.result?.pages || 1)
    } catch (requestError) {
      error.value = requestError
    } finally {
      loading.value = false
    }
  }

  const handlePageChange = async (page: number) => {
    if (page === currentPage.value || loading.value) return
    await fetchData(page)
  }

  watch(
    filterValues,
    async () => {
      currentPage.value = 1
      await fetchData(1)
    },
    { deep: true }
  )

  onMounted(() => {
    void fetchData(1)
  })

  return {
    t,
    filterValues,
    dataList,
    loading,
    error,
    currentPage,
    totalPages,
    totalBonusWon,
    totalBonusWonText,
    fetchData,
    handlePageChange
  }
}

/**
 * H5 端组合式逻辑：使用 useInfiniteScroll 实现下拉加载更多。
 *
 * 入参：scrollRoot / sentinel / enabled，分别对应滚动容器、底部哨兵元素和启用条件。
 * 返回：filterValues、dataList、loading、finished、error、totalBonusWon 以及 refresh。
 */
export const useVoucherHistoryInfinitePage = (options: {
  scrollRoot: Ref<HTMLElement | null>
  sentinel: Ref<HTMLElement | null>
  enabled: () => boolean
}) => {
  const { t } = useI18n()
  const currentLanguageCode = useCurrentLanguageCode()

  const filterValues = ref<Record<string, string | string[]>>({
    ...createDefaultVoucherHistoryFilterValues()
  })

  const fetchPage = async (page: number, pageSize: number) => {
    const response = await Api.activity.recordList(
      buildVoucherHistoryQueryForm({
        page,
        pageSize,
        filterValues: filterValues.value
      })
    )
    if (!response.success) {
      throw new Error(response.message || t('common.requestError'))
    }
    return response
  }

  const {
    list: dataList,
    loading,
    finished,
    error,
    refresh
  } = useInfiniteScroll<Item, Awaited<ReturnType<typeof Api.activity.recordList>>>({
    sentinel: options.sentinel,
    root: options.scrollRoot,
    enabled: options.enabled,
    pageSize: VOUCHER_HISTORY_PAGE_SIZE,
    load: ({ page, pageSize }) => fetchPage(page, pageSize),
    getItems: response =>
      response.result?.records?.map(record =>
        mapRecordToItem(record, currentLanguageCode.value, t)
      ) ?? [],
    getTotal: response => response.result?.total,
    getHasMore: (response, { page, pageSize, items }) =>
      hasMoreByTotal(response.result?.total, page, pageSize, items.length),
    dedupeBy: item => item.id,
    onError: requestError => {
      console.error(requestError)
    }
  })

  const totalBonusWon = computed(() => calcTotalBonusWon(dataList.value))
  const totalBonusWonText = computed(() => formatTotalBonusWonText(totalBonusWon.value))

  return {
    t,
    filterValues,
    dataList,
    loading,
    finished,
    error,
    totalBonusWon,
    totalBonusWonText,
    refresh
  }
}
