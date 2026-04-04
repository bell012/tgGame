<template>
  <CommonSharePopup v-bind="props" @update:visible="value => emit('update:visible', value)" />
</template>

<script setup lang="ts">
import CommonSharePopup from '@/views/game/detail/common/share-popup/index.vue'

const props = defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()
</script>
