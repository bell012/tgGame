<template>
  <div class="progress-track flex-1 min-w-0 rounded-[10px]">
    <div class="child-bar rounded-[10px]" :style="`width: ${percent}%`"></div>
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
.progress-track {
  height: 8px;
  background: var(--color-recent-games-progress-track);
}

.child-bar {
  height: 8px;
  background: var(--color-play-gradient);
}
</style>
