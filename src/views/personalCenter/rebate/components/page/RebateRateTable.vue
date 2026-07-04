<template>
  <section
    class="mt-3 overflow-hidden bg-bg-2"
    :class="isMobile ? 'rebate-rate-table-mobile rounded-[10px]' : 'rounded-[16px]'"
  >
    <div
      class="grid items-center bg-bg-2"
      :class="
        isMobile
          ? 'grid-cols-[40px_1fr_1fr] px-3 h-[35px]'
          : 'grid-cols-[52px_1fr_1fr] px-4 h-[48px]'
      "
    >
      <div></div>
      <div class="text-center text-text-2" :class="isMobile ? 'text-[13px]' : 'text-sm font-[700]'">
        {{ t('rebatePage.table.validBets') }}
      </div>
      <div class="text-center text-text-2" :class="isMobile ? 'text-[13px]' : 'text-sm font-[700]'">
        {{ t('rebatePage.table.rebateRate') }}
      </div>
    </div>

    <div
      v-for="(row, index) in rows"
      :key="row.id"
      class="grid items-center"
      :class="[
        isMobile
          ? 'grid-cols-[40px_1fr_1fr] px-3 h-[37px]'
          : 'grid-cols-[52px_1fr_1fr] px-4 h-[48px]',
        index % 2 === 0 ? 'bg-opacity-5' : 'bg-bg-2'
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
        :class="isMobile ? 'text-[14px] leading-none' : 'text-sm font-[700]'"
      >
        {{ row.validBets }}
      </div>
      <div
        class="flex items-center justify-center text-center text-text-1"
        :class="isMobile ? 'text-[14px] leading-none' : 'text-sm font-[700]'"
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
