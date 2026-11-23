<template>
  <span class="relative block" aria-hidden="true">
    <img :src="getChipImage(color)" alt="" class="block size-full object-contain" />
    <span
      class="absolute inset-x-0 top-[44%] -translate-y-1/2 whitespace-nowrap text-center font-bold leading-none text-[#eee] [text-shadow:0_0.08em_0.12em_rgba(0,0,0,0.65)]"
      :class="label.length > 3 ? 'text-[0.7em]' : 'text-[1em]'"
    >
      {{ label }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatChipAmount, getChipImage, type ChipColor } from '../chips'

const props = defineProps<{ color: ChipColor; value: number | string }>()
const label = computed(() =>
  typeof props.value === 'number' ? formatChipAmount(props.value) : props.value
)
</script>
