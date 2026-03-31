<template>
  <div class="flex flex-col items-center justify-center min-h-[50vh] px-3 text-center">
    <img :src="noData" alt="" class="w-[60%] max-w-[220px]" />
    <p class="mt-2.5 text-xs text-text-2">No data available at the moment.</p>
  </div>
</template>
<script setup lang="ts">
import noData from '@/static/img/bettingRecords/noData.png'
</script>
