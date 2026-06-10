<!-- 权益说明组件 -->
<template>
  <section class="space-y-[10px] sm:space-y-[24px]">
    <div :class="detailGridClass">
      <article v-if="currentColumn" class="min-w-0 rounded-[10px] bg-bg-2 sm:rounded-[16px]">
        <p
          class="py-[8px] px-[20px] sm:px-[12px] sm:py-[15px]"
          :class="getTitleClass(currentColumn.key)"
        >
          {{ currentColumn.title }}
        </p>

        <div class="">
          <div
            v-for="row in currentDetailRows"
            :key="row.key"
            class="flex items-center border-t border-opacity-6 px-[20px] py-[12px] sm:px-[12px] sm:py-[15px]"
          >
            <span class="min-w-0 w-3/5 truncate text-sm text-text-2 sm:text-base sm:text-center">{{
              row.label
            }}</span>
            <span
              class="min-w-0 w-2/5 truncate text-right sm:text-center"
              :class="getDetailAmountClass(currentColumn.key)"
              >{{ row.amount }}</span
            >
          </div>
        </div>
      </article>

      <article v-if="nextColumn" class="min-w-0 rounded-[10px] bg-bg-2 sm:rounded-[16px]">
        <p
          class="py-[8px] px-[4px] sm:px-[12px] sm:py-[15px]"
          :class="getTitleClass(nextColumn.key)"
        >
          {{ nextColumn.title }}
        </p>

        <div class="">
          <div
            v-for="row in nextDetailRows"
            :key="row.key"
            class="flex items-center justify-center border-t border-opacity-6 px-[4px] py-[12px] sm:px-[12px] sm:py-[15px]"
          >
            <span
              class="min-w-0 w-full truncate text-center"
              :class="getDetailAmountClass(nextColumn.key)"
              >{{ row.amount }}</span
            >
          </div>
        </div>
      </article>
    </div>

    <div :class="totalGridClass">
      <article
        v-if="currentTotalRow"
        class="min-w-0 w-full rounded-[10px] bg-bg-2 px-[20px] h-[60px] flex items-center justify-between sm:rounded-[16px] sm:px-[24px] sm:h-[48px]"
      >
        <div class="flex w-full items-center">
          <span
            class="min-w-0 w-1/2 truncate text-sm font-[400] text-text-1 sm:text-base sm:font-[700] sm:text-center"
          >
            {{ currentTotalRow.label }}
          </span>
          <span
            class="min-w-0 w-1/2 truncate text-right text-sm font-[700] text-secondary-7 sm:text-base sm:font-[700] sm:text-center"
          >
            {{ currentTotalRow.amount }}
          </span>
        </div>
      </article>

      <img
        :src="ArrowheadIcon"
        alt=""
        aria-hidden="true"
        v-if="hasNextColumn"
        :class="arrowClass"
      />

      <article
        v-if="nextTotalRow"
        class="min-w-0 w-full rounded-[10px] bg-bg-2 px-[4px] h-[60px] flex items-center justify-between sm:rounded-[16px] sm:px-[24px] sm:h-[48px]"
      >
        <div class="w-full flex items-center justify-center">
          <span
            class="min-w-0 w-full truncate text-center text-sm font-[700] text-secondary-7 sm:text-base"
          >
            {{ nextTotalRow.amount }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ArrowheadIcon from '@/static/svg/vip/arrowhead.svg?url'
import type { VipBenefitComparisonColumn } from './shared'

const props = defineProps<{
  columns: VipBenefitComparisonColumn[]
}>()

const currentColumn = computed(() => props.columns[0] ?? null)
const nextColumn = computed(() => props.columns[1] ?? null)
const hasNextColumn = computed(() => Boolean(nextColumn.value))
const currentDetailRows = computed(
  () => currentColumn.value?.rows.filter(row => !row.emphasized) ?? []
)
const nextDetailRows = computed(() => nextColumn.value?.rows.filter(row => !row.emphasized) ?? [])
const currentTotalRow = computed(
  () => currentColumn.value?.rows.find(row => row.emphasized) ?? null
)
const nextTotalRow = computed(() => nextColumn.value?.rows.find(row => row.emphasized) ?? null)
const detailGridClass = computed(() =>
  hasNextColumn.value
    ? 'grid grid-cols-[220px_minmax(0,1fr)] gap-[12px] sm:grid-cols-2 sm:gap-[28px] sm:grid-cols-[864px_minmax(0,1fr)]'
    : 'grid grid-cols-1'
)
const totalGridClass = computed(() =>
  hasNextColumn.value
    ? 'relative grid grid-cols-[220px_minmax(0,1fr)] gap-[12px] sm:grid-cols-2 sm:gap-[28px] sm:grid-cols-[864px_minmax(0,1fr)]'
    : 'grid grid-cols-1'
)
const arrowClass = computed(
  () =>
    'pointer-events-none absolute left-[calc(220px+5px)] top-1/2 z-[1] h-[25px] w-[25px] -translate-x-1/2 -translate-y-1/2 sm:left-1/2 sm:h-[26px] sm:w-[39px] sm:left-[calc(864px+15px)]'
)

const getTitleClass = (key: VipBenefitComparisonColumn['key']) => {
  return key === 'unlock'
    ? 'text-center text-xs font-[400] text-secondary-7 sm:text-sm sm:leading-5'
    : 'text-center text-xs font-[400] text-text-2 sm:text-sm sm:leading-5'
}

const getDetailAmountClass = (key: VipBenefitComparisonColumn['key']) => {
  return key === 'unlock'
    ? 'text-sm font-[700] text-secondary-7 sm:text-base'
    : 'text-sm font-[700] text-text-1 sm:text-base'
}
</script>
