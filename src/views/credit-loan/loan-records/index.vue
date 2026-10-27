<template>
  <H5LoanRecords
    v-if="isMobile"
    :active-type="activeType"
    :type-options="typeOptions"
    :records="displayRecords"
    :loading="loading"
    :has-more="hasMore"
    @change-type="handleTypeChange"
    @load-more="handleLoadMore"
    @back="emit('back')"
  />
  <PcLoanRecords
    v-else
    :active-type="activeType"
    :type-options="typeOptions"
    :records="displayRecords"
    :loading="loading"
    :page="page"
    :total-pages="totalPages"
    @change-type="handleTypeChange"
    @change-page="handlePageChange"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import { useIsMobile } from '@/composables/useMediaQuery'
import { formatUsDateTime12h } from '@/utils/date'
import type { CreditLoanHistoryRecord } from '@/api/interface/credit-loan'
import type { LoanRecordFilter } from '../mock'
import PcLoanRecords from './pc.vue'
import H5LoanRecords from './h5.vue'
import type { LoanRecordDisplayItem, LoanRecordTypeOption } from './types'

const emit = defineEmits<{
  back: []
}>()

const PAGE_SIZE = 10

const { t } = useI18n()
const isMobile = useIsMobile()

const activeType = ref<LoanRecordFilter>('all')
const page = ref(1)
const total = ref(0)
const records = ref<CreditLoanHistoryRecord[]>([])
const loading = ref(false)
const reachedEnd = ref(false)
let requestToken = 0

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const hasMore = computed(() => !reachedEnd.value && records.value.length < total.value)

const typeOptions = computed<LoanRecordTypeOption[]>(() => [
  { value: 'all', label: t('creditLoan.records.all') },
  { value: 'loan', label: t('creditLoan.records.loans') },
  { value: 'transfer', label: t('creditLoan.records.transfers') }
])

const LOAN_CHANGE_TYPE = 1
const TRANSFER_OUT_CHANGE_TYPE = 2

const CHANGE_TYPES_BY_FILTER: Record<LoanRecordFilter, number[]> = {
  all: [LOAN_CHANGE_TYPE, TRANSFER_OUT_CHANGE_TYPE],
  loan: [LOAN_CHANGE_TYPE],
  transfer: [TRANSFER_OUT_CHANGE_TYPE]
}

const displayRecords = computed<LoanRecordDisplayItem[]>(() =>
  records.value.map(item => {
    const isTransferOut = item.changeType === TRANSFER_OUT_CHANGE_TYPE

    return {
      id: String(item.rowId),
      typeLabel: isTransferOut
        ? t('creditLoan.records.loanTransferOut')
        : t('creditLoan.records.loanAmount'),
      amountText: isTransferOut
        ? `-${Math.abs(item.busiAmount)}`
        : `${item.busiAmount > 0 ? '+' : ''}${item.busiAmount}`,
      timeText: formatUsDateTime12h(item.createTime)
    }
  })
)

const fetchRecords = async (append: boolean) => {
  const currentToken = ++requestToken
  loading.value = true

  try {
    const res = await Api.creditLoan.borrHisPage(
      { current: page.value, size: PAGE_SIZE },
      { changeTypes: CHANGE_TYPES_BY_FILTER[activeType.value] }
    )

    console.log('[credit-loan] /br/borrHisPage', res)

    if (currentToken !== requestToken) return
    const list = res?.records ?? []
    records.value = append ? [...records.value, ...list] : list
    total.value = Number(res?.total) || 0
    // total 与实际返回条数不一致时，避免 H5 无限触发加载更多
    reachedEnd.value = list.length < PAGE_SIZE
  } catch (error) {
    if (currentToken !== requestToken) return
    console.error('loan records failed', error)
    if (append) {
      page.value -= 1
    } else {
      records.value = []
      total.value = 0
    }
  } finally {
    if (currentToken === requestToken) {
      loading.value = false
    }
  }
}

const reload = () => {
  page.value = 1
  reachedEnd.value = false
  records.value = []
  total.value = 0
  void fetchRecords(false)
}

const handleTypeChange = (value: LoanRecordFilter) => {
  if (value === activeType.value) return
  activeType.value = value
  reload()
}

const handlePageChange = (value: number) => {
  page.value = value
  void fetchRecords(false)
}

const handleLoadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value += 1
  void fetchRecords(true)
}

watch(isMobile, reload)

reload()
</script>
