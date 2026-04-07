<template>
  <!-- 按钮携带转圈 -->
  <span
    :class="[
      'inline-block animate-spin rounded-full border-solid border-current border-r-transparent',
      spinnerColorClass
    ]"
    :style="spinnerStyle"
    aria-hidden="true"
  ></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number
  borderWidth?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  borderWidth: 2,
  color: '#000000'
})

const spinnerColorClass = computed(() => {
  return props.color.startsWith('text-') ? props.color : ''
})

const spinnerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderWidth: `${props.borderWidth}px`,
  color: props.color.startsWith('text-') ? undefined : props.color
}))
</script>
