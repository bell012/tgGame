<template>
  <div class="p-6 pb-0 w-[1032px]">
    <div class="mb-4">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 时间筛选 -->
        <CustomSelect
          class="w-[240px]"
          v-model="filterValues.time"
          :options="timeOptions"
          :placeholder="$t('customSelect.placeholder')"
        />
        <!-- 状态筛选 -->
        <CustomSelect
          class="w-[240px]"
          v-model="filterValues.status"
          :options="statusOptions"
          :placeholder="$t('customSelect.placeholder')"
        />
        <!-- 类型筛选 -->
        <CustomSelect
          class="w-[240px]"
          v-model="filterValues.type"
          :options="typeOptions"
          :placeholder="$t('customSelect.placeholder')"
        />
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-header-bar bg-bg-3 rounded-lg py-3">
        <div class="grid grid-cols-4 gap-3">
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.type') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.time') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.amount') }}
          </div>
          <div class="text-text-1 text-sm font-bold text-center">
            {{ $t('betHistory.status') }}
          </div>
        </div>
      </div>

      <div class="table-body min-h-[520px]">
        <div
          v-if="error && dataList.length === 0"
          class="flex h-[520px] items-center justify-center text-sm font-[700] text-secondary-4 cursor-pointer"
          @click="handleRetry"
        >
          {{ $t('common.requestError') }}
        </div>
        <!-- 空状态 -->
        <ThemedEmptyState
          v-else-if="!loading && dataList.length === 0"
          :dark-image="noDataImg"
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
            class="table-row-item grid grid-cols-4 gap-3 py-3 cursor-pointer border-b border-opacity-5"
            @click="handleRowClick(item)"
          >
            <div class="flex items-center justify-center gap-3">
              <span class="text-text-1 text-sm font-[700] text-center">{{ item.gameName }}</span>
            </div>
            <div class="text-text-2 text-sm font-[700] text-center">{{ item.time }}</div>
            <div class="flex items-center justify-center gap-1">
              <span
                :class="item.direction === 'add' ? 'text-secondary-2' : 'text-secondary-4'"
                class="font-[700] text-sm"
              >
                {{ item.amount }}
              </span>
            </div>
            <div class="flex items-center justify-center gap-1">
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="item.status ? 'bg-secondary-4' : 'bg-secondary-2'"
              ></span>
              <span class="font-[700] text-sm">
                {{ item.status ? $t('transaction.completed') : $t('transaction.notCompleted') }}
              </span>
              <ArrowRightIcon class="w-4 h-4 text-text-1" />
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
import DetailsModal from '../rolloverDetails/detailsModal.vue'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import noDataImg from '@/static/img/personalCenter/noData.png'
import {
  ROLLOVER_PAGE_SIZE,
  buildRolloverQueryForm,
  createDefaultRolloverFilterValues,
  createRolloverStatusOptions,
  createRolloverTimeOptions,
  createRolloverTypeOptions,
  mapRecordToItem,
  type Item
} from './shared'

const { t } = useI18n()
const filterValues = ref(createDefaultRolloverFilterValues())
const dataList = ref<Item[]>([])
const loading = ref(false)
const error = ref<unknown | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)

const timeOptions = computed(() => createRolloverTimeOptions(t))
const statusOptions = computed(() => createRolloverStatusOptions(t))
const typeOptions = computed(() => createRolloverTypeOptions(t))

const fetchRollover = async (page = 1) => {
  loading.value = true
  error.value = null

  try {
    const response = await Api.record.queryInspectPage(
      buildRolloverQueryForm({
        page,
        pageSize: ROLLOVER_PAGE_SIZE,
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
  await fetchRollover(page)
}

const handleRetry = async () => {
  await fetchRollover(currentPage.value)
}

watch(
  filterValues,
  async () => {
    currentPage.value = 1
    await fetchRollover(1)
  },
  { deep: true }
)

onMounted(() => {
  void fetchRollover(1)
})
</script>

<style scoped></style>
