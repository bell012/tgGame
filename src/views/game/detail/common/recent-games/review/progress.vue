<template>
  <div class="progress-track flex flex-1 rounded-[10px] w-full">
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
  height: 7px;
  background: #3a4142;
}

.child-bar {
  height: 7px;
  background: linear-gradient(90deg, #24ee89 0%, #9fe871 100%);
}

:global(:root.light .progress-track) {
  background: #e5e5e5;
}
</style>
