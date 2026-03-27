<template>
  <div class="font-['Inter']">
    <div class="flex items-end justify-center" :class="wrapperClass">
      <p class="text-text-1 text-[20px] sm:text-[40px] font-bold leading-none capitalize">
        {{ amount }}
      </p>
      <p class="text-text-1 text-base sm:text-lg font-bold leading-none capitalize">
        {{ method }}
      </p>
    </div>
    <div
      v-if="rate"
      class="pt-1 px-3 text-xs sm:text-base font-normal leading-none w-full text-center text-text-2"
    >
      {{ rate }}
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    amount: string | number
    method: string
    rate?: string
    wrapperClass?: string
  }>(),
  {
    rate: '',
    wrapperClass: 'pt-3'
  }
)
</script>
