<template>
  <div v-for="item in rows" :key="item.label" :class="rowClass">
    <p class="text-text-3 text-base">{{ item.label }}</p>
    <div :class="[valueClass, item.valueClass]">
      <img v-if="item.icon" :class="iconClass" :src="item.icon" />
      {{ item.value }}
      <div v-if="item.copyValue" class="ml-3 w-[18px]" @click.stop="emit('copy', item.copyValue)">
        <CopyIcon class="w-6 h-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CopyIcon from '@/static/svg/copy.svg?component'

export interface DetailRowItem {
  label: string
  value: string | number
  copyValue?: string
  icon?: string
  valueClass?: string
}

withDefaults(
  defineProps<{
    rows: DetailRowItem[]
    rowClass?: string
    valueClass?: string
    iconClass?: string
  }>(),
  {
    rowClass: 'flex items-center justify-between',
    valueClass: 'text-text-1 text-base flex items-center',
    iconClass: 'w-5 aspect-square mr-1'
  }
)

const emit = defineEmits<{
  copy: [value: string]
}>()
</script>
