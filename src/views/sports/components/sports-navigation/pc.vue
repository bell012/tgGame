<template>
  <nav class="flex w-full items-center gap-5 overflow-x-auto rounded-xl bg-bg-2 px-6 py-6">
    <button
      v-for="(item, index) in sportItems"
      :key="item.key"
      type="button"
      class="flex shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-colors duration-200"
      :class="activeIndex === index ? 'text-theme-primary' : 'text-icon-2'"
      @click="handleSelect(index)"
    >
      <span class="relative inline-flex">
        <component
          :is="item.icon"
          class="block h-9 w-9 fill-current [&_path]:fill-current [&_rect]:fill-current"
        />
        <span
          v-if="getSportCount(item) > 0"
          class="absolute -right-1 -top-1 min-w-[18px] rounded px-1 text-center text-[11px] font-[700] leading-[14px] text-[#FFF] bg-secondary-2"
        >
          {{ getSportCount(item) }}
        </span>
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { sportItems, type SportItem } from './sport-items'

const props = defineProps<{
  counts?: Partial<Record<string, number>>
}>()

const activeIndex = ref(0)

const emit = defineEmits<{
  change: [index: number, key: string]
}>()

function getSportCount(item: SportItem) {
  return props.counts?.[item.key] ?? item.count ?? 0
}

function handleSelect(index: number) {
  activeIndex.value = index
  emit('change', index, sportItems[index].key)
}
</script>
