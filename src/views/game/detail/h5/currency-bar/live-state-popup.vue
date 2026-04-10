<template>
  <common-live-state-popup
    :visible="visible"
    :desktop="desktop"
    mask-class="bg-mask-60-1"
    panel-class="tp-panel-h5"
    @update:visible="emit('update:visible', $event)"
  />
</template>

<script setup lang="ts">
import CommonLiveStatePopup from '../../common/live-state-popup/index.vue'

withDefaults(
  defineProps<{
    visible: boolean
    desktop?: boolean
  }>(),
  {
    desktop: false
  }
)

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()
</script>
