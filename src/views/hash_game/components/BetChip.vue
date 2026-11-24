<template>
  <span
    class="relative block size-full"
    :style="{ '--chip-edge': CHIP_COLORS[color][1] }"
    aria-hidden="true"
  >
    <!-- 椭圆正面下方露出彩色侧边，表现筹码的厚度。 -->
    <span
      class="absolute left-0 top-[42%] h-[38%] w-full [border-radius:0_0_50%_50%/0_0_56%_56%] [background:linear-gradient(90deg,rgba(0,0,0,0.48),transparent_26%_68%,rgba(0,0,0,0.42)),linear-gradient(180deg,transparent_60%,rgba(0,0,0,0.28)),linear-gradient(90deg,var(--chip-edge)_0_14%,#e9d4a2_14%_23%,var(--chip-edge)_23%_46%,#f3dfb6_46%_55%,var(--chip-edge)_55%_77%,#e9d4a2_77%_86%,var(--chip-edge)_86%)] [box-shadow:0_0.07em_0.16em_rgba(0,0,0,0.45)]"
    />
    <img
      :src="getChipImage(color)"
      class="absolute left-0 top-[20%] block h-[44%] w-full rounded-[50%] object-fill"
      alt=""
    />
    <b
      class="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bold leading-none text-white [text-shadow:0_0.09em_0.13em_rgba(0,0,0,0.65)]"
      :class="label.length > 3 ? 'text-[0.8em]' : 'text-[1em]'"
    >
      {{ label }}
    </b>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CHIP_COLORS, formatChipAmount, getChipImage, type ChipColor } from '../chips'

const props = defineProps<{ amount: number; color: ChipColor }>()
const label = computed(() => formatChipAmount(props.amount))
</script>
