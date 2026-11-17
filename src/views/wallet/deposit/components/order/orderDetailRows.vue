<template>
  <!-- 明细行容器 -->
  <div v-for="item in rows" :key="item.label" :class="[rowClass, `font-['Inter']`]">
    <!-- 明细标签 -->
    <p class="text-text-3 text-sm sm:text-base font-['Inter']">{{ item.label }}</p>
    <!-- 明细值容器 -->
    <div
      :class="[valueClass, item.valueClass, `font-['Inter']`]"
      :style="[valueStyle, item.valueStyle]"
    >
      <!-- 明细图标 -->
      <img v-if="item.icon" :class="iconClass" :src="item.icon" />
      {{ item.value }}
      <!-- 复制按钮容器 -->
      <div v-if="item.copyValue" :class="copyClass" @click.stop="emit('copy', item.copyValue)">
        <CopyIcon :class="copyIconClass" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CopyIcon from '@/static/svg/copy.svg?component'
import type { CSSProperties } from 'vue'

export interface DetailRowItem {
  label: string
  value: string | number
  copyValue?: string
  icon?: string
  valueClass?: string
  valueStyle?: CSSProperties
}

withDefaults(
  defineProps<{
    rows: DetailRowItem[]
    rowClass?: string
    valueClass?: string
    valueStyle?: CSSProperties
    iconClass?: string
    copyClass?: string
    copyIconClass?: string
  }>(),
  {
    rowClass: 'flex items-center justify-between',
    valueClass: 'text-text-1 text-sm sm:text-base flex items-center',
    iconClass: 'w-5 aspect-square mr-1',
    copyClass: 'ml-3 w-[18px]',
    copyIconClass: 'w-6 h-6'
  }
)

const emit = defineEmits<{
  copy: [value: string]
}>()
</script>
