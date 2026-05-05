<template>
  <div class="p-6 pb-0">
    <div class="mb-4">
      <div class="flex items-center gap-2 flex-wrap">
        <CustomSelect
          class="w-[240px]"
          v-model="filterValues.time"
          :options="timeOptions"
          :placeholder="$t('betHistory.filterGroups.date')"
          use-placeholder-when-all
        />

        <CustomSelect
          class="w-[240px]"
          v-model="filterValues.type"
          :options="typeOptions"
          :placeholder="$t('betHistory.filterGroups.transaction')"
          use-placeholder-when-all
        />
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-header-bar bg-bg-3 rounded-lg py-3 px-[24px]">
        <div class="grid grid-cols-4 gap-3">
          <div class="text-text-1 text-sm font-bold text-left">
            {{ $t('transaction.type') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('transaction.time') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('transaction.amount') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-right">
            {{ $t('transaction.balance') }}
          </div>
        </div>
      </div>

      <div class="table-body min-h-[520px]">
        <!-- 空状态 -->
        <ThemedEmptyState
          v-if="!loading && dataList.length === 0"
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :image-alt="$t('common.noData')"
          :message="$t('common.noData')"
          container-class="h-[520px] justify-center"
          image-class="mb-2.5 h-[200px] w-auto"
          text-class="text-text-1 text-sm font-[700]"
        />

        <template v-else>
          <div
            v-for="item in dataList"
            :key="item.id"
            class="table-row-item grid grid-cols-4 gap-3 py-3 cursor-pointer border-b border-opacity-5 px-[24px]"
            @click="handleRowClick(item)"
          >
            <div class="flex items-center justify-start gap-3">
              <span class="text-text-1 text-sm font-[700] text-center truncate">{{
                item.gameName
              }}</span>
            </div>
            <div class="text-text-2 text-sm font-[700] text-center">{{ item.time }}</div>
            <div class="text-text-1 text-sm font-[700] text-center">
              <p
                :class="item.direction === 'add' ? 'text-secondary-4' : 'text-secondary-2'"
                class="font-[700] text-sm inline-flex items-center"
              >
                <span :class="['mr-[2px]', item.direction === 'dec' ? 'relative -top-0.5' : '']">{{
                  item.direction === 'add' ? '+' : '-'
                }}</span>
                <span>{{ item.betAmount }}</span>
              </p>
            </div>
            <div class="flex items-center justify-end gap-1">
              <span class="text-text-1 text-sm font-[700] text-center">{{ item.profit }}</span>
              <ArrowLeftIcon class="w-4 h-4 text-text-1" />
            </div>
          </div>

          <p v-if="loading" class="py-6 text-center text-sm text-text-2">
            {{ $t('common.loading') }}
          </p>
        </template>
      </div>
    </div>

    <div v-if="totalPages > 1 && dataList.length > 0" class="mt-5 flex justify-center pb-6">
      <DesktopPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change="handlePageChange"
      />
    </div>

    <DetailsModal v-model="showDetailModal" :data="selectedData" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Api from '@/api'
import { useI18n } from 'vue-i18n'
import CustomSelect from '@/components/common/CustomSelect.vue'
import DesktopPagination from '@/components/common/DesktopPagination.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import DetailsModal from '../transactionDetails/detailsModal.vue'
import ArrowLeftIcon from '@/static/svg/arrow_left2.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import {
  TRANSACTION_PAGE_SIZE,
  buildTransactionQueryForm,
  createDefaultTransactionFilterValues,
  createTransactionTimeOptions,
  createTransactionTypeOptions,
  mapRecordToItem,
  type Item
} from './shared'

const { t } = useI18n()
const filterValues = ref(createDefaultTransactionFilterValues())
const dataList = ref<Item[]>([])
const loading = ref(false)
const error = ref<unknown | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)

const timeOptions = computed(() => createTransactionTimeOptions(t))
const typeOptions = computed(() => createTransactionTypeOptions(t))

const fetchTransaction = async (page = 1) => {
  loading.value = true
  error.value = null

  try {
    const response = await Api.record.queryAcctHisPage(
      buildTransactionQueryForm({
        page,
        pageSize: TRANSACTION_PAGE_SIZE,
        filterValues: filterValues.value
      })
    )

    if (!response.success) {
      throw new Error(response.message || t('common.requestError'))
    }

    dataList.value = response.result?.records?.map(record => mapRecordToItem(record, t)) ?? []
    currentPage.value = response.result?.current || page
    totalPages.value = Math.max(1, response.result?.pages || 1)
  } catch (requestError) {
    error.value = requestError
  } finally {
    loading.value = false
  }
}

const showDetailModal = ref(false)
const selectedData = ref<Item | null>(null)

const handleRowClick = (item: Item) => {
  selectedData.value = item
  showDetailModal.value = true
}

const handlePageChange = async (page: number) => {
  if (page === currentPage.value || loading.value) return
  await fetchTransaction(page)
}

watch(
  filterValues,
  async () => {
    currentPage.value = 1
    await fetchTransaction(1)
  },
  { deep: true }
)

onMounted(() => {
  void fetchTransaction(1)
})
</script>

<style scoped></style>
