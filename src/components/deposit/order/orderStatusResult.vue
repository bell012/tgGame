<template>
  <div class="flex flex-col items-center">
    <div class="w-[76px] h-[76px]">
      <OrderStatusCompletedIcon v-if="status === 'Completed'" class="w-[76px] h-[76px]" />
      <OrderStatusCancelledIcon v-else class="w-[76px] h-[76px]" />
    </div>
    <p class="mt-4 text-base font-bold leading-normal text-text-1">
      {{ title }}
    </p>
  </div>
</template>

<script setup lang="ts">
import OrderStatusCancelledIcon from '@/static/svg/deposit/order-status-cancelled.svg?component'
import OrderStatusCompletedIcon from '@/static/svg/deposit/order-status-completed.svg?component'

defineProps<{
  status: 'Completed' | 'Cancelled'
  title: string
}>()
</script>
