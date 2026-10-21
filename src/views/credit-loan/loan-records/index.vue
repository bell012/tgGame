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
import { useIsMobile } from '@/composables/useMediaQuery'
import { formatUsDateTime12h } from '@/utils/date'
import { fetchLoanRecordsMock, type LoanRecordFilter, type LoanRecordItem } from '../mock'
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
const records = ref<LoanRecordItem[]>([])
const loading = ref(false)
let requestToken = 0

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const hasMore = computed(() => records.value.length < total.value)

const typeOptions = computed<LoanRecordTypeOption[]>(() => [
  { value: 'all', label: t('creditLoan.records.all') },
  { value: 'loan', label: t('creditLoan.records.loans') },
  { value: 'transfer', label: t('creditLoan.records.transfers') }
])

const displayRecords = computed<LoanRecordDisplayItem[]>(() =>
  records.value.map(item => ({
    id: item.id,
    typeLabel:
      item.type === 'loan'
        ? t('creditLoan.records.loanAmount')
        : t('creditLoan.records.loanTransferOut'),
    amountText: `${item.type === 'loan' ? '+' : '-'}${item.amount}`,
    timeText: formatUsDateTime12h(item.createTime)
  }))
)

const fetchRecords = async (append: boolean) => {
  const currentToken = ++requestToken
  loading.value = true

  try {
    const res = await fetchLoanRecordsMock({
      type: activeType.value,
      page: page.value,
      pageSize: PAGE_SIZE
    })
    if (currentToken !== requestToken) return
    records.value = append ? [...records.value, ...res.list] : res.list
    total.value = res.total
  } catch (error) {
    if (currentToken !== requestToken) return
    console.error('loan records failed', error)
    if (!append) {
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
