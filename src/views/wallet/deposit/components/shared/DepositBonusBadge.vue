<template>
  <span
    class="pointer-events-none absolute z-[1] inline-flex items-center justify-center whitespace-nowrap rounded-[7px] bg-secondary-2 px-1 py-px text-[10px] font-normal leading-3 text-white"
  >
    +{{ ratio }}%
    <BonusBadgeArrow class="absolute left-1/2 top-full h-[3px] w-[6px] -translate-x-1/2" />
  </span>
</template>

<script setup lang="ts">
import BonusBadgeArrow from '@/static/svg/deposit/bonus-badge-arrow.svg?component'

defineProps<{
  ratio: number | string
}>()
</script>
