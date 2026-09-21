<template>
  <nav class="flex w-full gap-2 overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth">
    <button
      v-for="(item, index) in sportItems"
      :key="item.key"
      type="button"
      class="flex shrink-0 cursor-pointer items-center rounded-lg border-none bg-bg-2 py-2 px-[7px] transition-colors duration-200"
      :class="props.selectedSportId === item.sportId ? 'gap-1.5 text-theme-primary' : 'text-icon-2'"
      @click="handleSelect(index)"
    >
      <component
        :is="item.icon"
        class="block h-5 w-5 shrink-0 fill-current [&_path]:fill-current [&_rect]:fill-current"
      />
      <span
        v-if="props.selectedSportId === item.sportId"
        class="whitespace-nowrap text-xs font-[700] leading-none text-text-1"
      >
        {{ t(item.i18nKey) }}
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { sportItems } from './sport-items'

const { t } = useI18n()

const props = defineProps<{
  selectedSportId: number
}>()

const emit = defineEmits<{
  change: [index: number, key: string]
}>()

function handleSelect(index: number) {
  emit('change', index, sportItems[index].key)
}
</script>
