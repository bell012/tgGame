<template>
  <section
    class="mt-3 overflow-hidden rounded-[14px] bg-bg-2"
    :class="isMobile ? 'rebate-rate-table-mobile' : ''"
  >
    <div
      class="grid items-center bg-bg-2"
      :class="
        isMobile
          ? 'grid-cols-[40px_1fr_1fr] px-3 h-[38px]'
          : 'grid-cols-[52px_1fr_1fr] px-4 h-[38px]'
      "
    >
      <div></div>
      <div class="text-center text-text-2" :class="isMobile ? 'text-[13px]' : 'text-sm'">
        {{ t('rebatePage.table.validBets') }}
      </div>
      <div class="text-center text-text-2" :class="isMobile ? 'text-[13px]' : 'text-sm'">
        {{ t('rebatePage.table.rebateRate') }}
      </div>
    </div>

    <div
      v-for="(row, index) in rows"
      :key="row.id"
      class="grid items-center"
      :class="[
        isMobile
          ? 'grid-cols-[40px_1fr_1fr] px-3 h-[38px]'
          : 'grid-cols-[52px_1fr_1fr] px-4 h-[38px]',
        index % 2 === 0 ? 'bg-bg-3' : 'bg-bg-2'
      ]"
    >
      <div
        class="flex items-center justify-center font-[700] text-theme-primary"
        :class="isMobile ? 'text-lg' : 'text-xl'"
      >
        {{ row.isCurrent ? '✓' : '' }}
      </div>
      <div
        class="flex items-center justify-center text-center text-text-1"
        :class="isMobile ? 'text-[14px] leading-none' : 'text-sm font-[600]'"
      >
        {{ row.validBets }}
      </div>
      <div
        class="flex items-center justify-center text-center text-text-1"
        :class="isMobile ? 'text-[14px] leading-none' : 'text-sm font-[600]'"
      >
        {{ row.rebateRate }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RebateRow } from '../../types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  isMobile: boolean
  rows: RebateRow[]
}>()
</script>

<style scoped lang="scss">
.rebate-rate-table-mobile {
}
</style>
