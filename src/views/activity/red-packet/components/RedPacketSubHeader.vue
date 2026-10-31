<template>
  <div class="relative flex h-[58px] shrink-0 items-center justify-center bg-bg-2">
    <button
      type="button"
      aria-label="back"
      class="absolute left-[10px] top-[14px] size-[30px]"
      @click="emit('back')"
    >
      <BackIcon class="size-full" />
    </button>
    <span class="max-w-[260px] truncate text-[18px] font-[700] leading-[22px] text-text-1">
      {{ props.title }}
    </span>
    <div class="absolute right-[10px] top-[14px]">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BackIcon from '@/static/svg/red-packet/back.svg?component'

const props = defineProps<{ title: string }>()

const emit = defineEmits<{ back: [] }>()
</script>
