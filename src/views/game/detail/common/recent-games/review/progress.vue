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
  height: 5px;
  background: #303637;
}

.child-bar {
  height: 5px;
  background: linear-gradient(90deg, #24ee89 0%, #9fe871 100%);
}

:global(:root.light .progress-track) {
  background: #e2e2e2;
}
</style>
