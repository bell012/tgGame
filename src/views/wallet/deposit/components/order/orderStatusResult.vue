<template>
  <!-- 订单结果主容器 -->
  <div class="flex flex-col items-center gap-[10px] sm:gap-4 font-['Inter']">
    <!-- 订单状态图标 -->
    <div class="w-[60px] h-[60px] sm:w-[76px] sm:h-[76px]">
      <OrderStatusCompletedIcon v-if="status === 'Completed'" class="w-full h-full" />
      <OrderStatusCancelledIcon v-else class="w-full h-full" />
    </div>
    <!-- 订单结果标题 -->
    <p class="text-sm sm:text-base font-bold leading-normal text-text-1">
      {{ title }}
    </p>
  </div>
</template>

<script setup lang="ts">
import OrderStatusCancelledIcon from '@/static/svg/deposit/order-status-cancelled.svg?component'
import OrderStatusCompletedIcon from '@/static/svg/deposit/order-status-completed.svg?component'

defineProps<{
  status: 'Completed' | 'Cancelled' | 'Failed'
  title: string
}>()
</script>
