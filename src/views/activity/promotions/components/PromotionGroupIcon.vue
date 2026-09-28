<template>
  <img
    :src="src"
    alt=""
    class="shrink-0 object-contain"
    :class="active ? 'promotion-group-icon--active' : 'promotion-group-icon--default'"
  />
</template>

<script setup lang="ts">
defineProps<{
  src: string
  active: boolean
}>()
</script>

<style scoped>
.promotion-group-icon--active {
  filter: brightness(0) saturate(100%);
}

.promotion-group-icon--default {
  filter: brightness(0) saturate(100%) invert(82%) sepia(8%) saturate(350%) hue-rotate(151deg)
    brightness(91%) contrast(86%);
}

.light .promotion-group-icon--default {
  filter: brightness(0) saturate(100%) invert(41%) sepia(10%) saturate(558%) hue-rotate(131deg)
    brightness(92%) contrast(90%);
}
</style>
