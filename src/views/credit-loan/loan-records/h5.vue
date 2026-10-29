<template>
  <div class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1">
    <H5Header
      :title="t('creditLoan.loanRecords')"
      show-sort
      disable-default-back
      @back="emit('back')"
      @sort="showFilterPopup = true"
    />

    <div ref="scrollRef" class="flex-1 overflow-y-auto px-3.5 pb-6 pt-3">
      <div v-if="props.records.length > 0" class="flex flex-col gap-2">
        <div
          v-for="record in props.records"
          :key="record.id"
          class="overflow-hidden rounded-xl bg-bg-2"
        >
          <div class="flex h-[66px] items-center gap-2.5 px-3.5">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-bg-3">
              <component :is="newSideIcons.creditLoanIcon" class="size-6" />
            </div>
            <span class="min-w-0 flex-1 truncate text-[15px] font-[700] text-text-1">
              {{ record.typeLabel }}
            </span>
            <span class="shrink-0 text-lg font-[700] text-text-1">{{ record.amountText }}</span>
          </div>
          <div class="h-px bg-opacity-6" />
          <div class="flex h-11 items-center justify-between px-3.5">
            <span class="text-xs text-text-2">{{ record.timeText }}</span>
            <span class="flex size-6 items-center justify-center rounded-md bg-opacity-10">
              <ArrowRightIcon class="h-3 w-3 text-text-2" />
            </span>
          </div>
        </div>
      </div>

      <ThemedEmptyState
        v-else-if="!props.loading"
        :dark-image="defaultImgDark"
        :light-image="defaultImgLight"
        :image-alt="t('common.noData')"
        :message="t('common.noData')"
        container-class="mt-[100px] justify-center"
        image-class="h-[200px] w-auto mb-2.5"
        text-class="text-text-1 text-xs font-[500] mb-5"
      />

      <div
        v-if="props.loading"
        class="flex items-center justify-center gap-2 py-6 text-sm text-text-2"
      >
        <ButtonLoadingSpinner :size="18" color="text-text-2" />
        <span>
          {{
            props.records.length > 0 ? t('common.loadingMore') : t('creditLoan.records.refreshing')
          }}
        </span>
      </div>

      <div
        v-else-if="!props.hasMore && props.records.length > 0"
        class="py-6 text-center text-xs text-text-2"
      >
        {{ t('common.noMoreData') }}
      </div>

      <div v-if="props.hasMore" ref="loadMoreRef" class="h-1 w-full" />
    </div>

    <FilterPopup
      v-model:visible="showFilterPopup"
      :model-value="{ type: props.activeType }"
      :filter-groups="filterGroups"
      @apply="handleFilterApply"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import ButtonLoadingSpinner from '@/components/common/ButtonLoadingSpinner.vue'
import newSideIcons from '@/static/svg/side/newIcon'
import ArrowRightIcon from '@/static/svg/arrow_right2.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import type { LoanRecordFilter } from '../mock'
import type { LoanRecordDisplayItem, LoanRecordTypeOption } from './types'

const props = defineProps<{
  activeType: LoanRecordFilter
  typeOptions: LoanRecordTypeOption[]
  records: LoanRecordDisplayItem[]
  loading: boolean
  hasMore: boolean
}>()

const emit = defineEmits<{
  'change-type': [value: LoanRecordFilter]
  'load-more': []
  back: []
}>()

const { t } = useI18n()
const showFilterPopup = ref(false)
const scrollRef = ref<HTMLElement | null>(null)
const loadMoreRef = ref<HTMLElement | null>(null)
let loadMoreObserver: IntersectionObserver | null = null

const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'type',
    title: t('creditLoan.records.type'),
    options: props.typeOptions.map(option => ({ label: option.label, value: option.value }))
  }
])

const handleFilterApply = (values: Record<string, string | string[]>) => {
  const matched = props.typeOptions.find(option => option.value === values.type)
  if (matched) {
    emit('change-type', matched.value)
  }
}

const setupLoadMoreObserver = () => {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null

  if (!props.hasMore || props.loading || !loadMoreRef.value) return

  loadMoreObserver = new IntersectionObserver(
    entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        emit('load-more')
      }
    },
    { root: scrollRef.value, rootMargin: '0px 0px 200px 0px' }
  )
  loadMoreObserver.observe(loadMoreRef.value)
}

watch(
  () => [props.hasMore, props.loading, props.records.length] as const,
  () => {
    void nextTick(setupLoadMoreObserver)
  }
)

onMounted(setupLoadMoreObserver)

onUnmounted(() => {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null
})
</script>
