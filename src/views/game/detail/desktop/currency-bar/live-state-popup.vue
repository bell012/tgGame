<template>
  <common-live-state-popup
    :visible="visible"
    :desktop="desktop"
    mask-class="bg-[var(--color-mask-60)]"
    panel-class="tp-panel-desktop"
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
