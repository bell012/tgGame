<template>
  <div class="relative flex h-[58px] shrink-0 items-center justify-center bg-[#323738]">
    <button
      type="button"
      aria-label="back"
      class="absolute left-[10px] top-[14px] size-[30px]"
      @click="emit('back')"
    >
      <img :src="backIcon" alt="" class="size-full" />
    </button>
    <span class="max-w-[260px] truncate text-[18px] font-[700] leading-[22px] text-white">
      {{ props.title }}
    </span>
    <div class="absolute right-[10px] top-[14px]">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import backIcon from '@/static/svg/red-packet/back.svg?url'

const props = defineProps<{ title: string }>()

const emit = defineEmits<{ back: [] }>()
</script>
