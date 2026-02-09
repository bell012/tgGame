<template>
  <div class="flex flex-1 bg-[var(--color-background-level-2)] h-[8px] rounded-[10px] w-full">
    <div class="child-bar h-[8px] rounded-[10px]" :style="`width: ${percent}%`"></div>
  </div>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    percent: number
  }>(),
  {
    percent: 0
  }
)
</script>
<style lang="scss" scoped>
.child-bar {
  background: linear-gradient(90deg, #24ee89 0%, #9fe871 100%);
}
</style>
