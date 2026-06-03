<template>
  <!-- H5：单列卡片 -->
  <div v-if="variant === 'mobile'" class="flex flex-col gap-3">
    <div
      v-for="index in mobileCount"
      :key="`promotions-skeleton-mobile-${index}`"
      class="overflow-hidden rounded-lg bg-bg-2"
    >
      <div class="aspect-[347/150] w-full bg-bg-3 animate-pulse" />
      <div class="px-3 py-3 space-y-2">
        <div class="h-4 w-[75%] rounded bg-bg-3 animate-pulse" />
        <div class="h-4 w-[45%] rounded bg-bg-3 animate-pulse" />
      </div>
    </div>
  </div>

  <!-- PC：三列卡片 -->
  <div v-else class="grid grid-cols-3 gap-4">
    <div
      v-for="index in desktopCount"
      :key="`promotions-skeleton-desktop-${index}`"
      class="overflow-hidden rounded-lg bg-bg-3"
    >
      <div class="aspect-[333/140] w-full bg-bg-2 animate-pulse" />
      <div class="px-3 py-3 min-h-[52px]">
        <div class="h-4 w-full rounded bg-bg-2 animate-pulse" />
        <div class="mt-2 h-4 w-2/3 rounded bg-bg-2 animate-pulse" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'mobile' | 'desktop'
    mobileCount?: number
    desktopCount?: number
  }>(),
  {
    variant: 'mobile',
    mobileCount: 4,
    desktopCount: 6
  }
)
</script>
