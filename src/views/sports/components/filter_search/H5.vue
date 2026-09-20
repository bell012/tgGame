<!-- H5赛事筛选 tabs -->
<template>
  <section class="w-full" aria-label="Match filters">
    <div class="flex h-[38px] w-full items-center overflow-visible rounded-[8px] bg-bg-2">
      <button
        v-for="item in filterTabs"
        :key="item.key"
        type="button"
        class="relative inline-flex h-full min-w-0 flex-1 items-center justify-center border-0 text-[14px] leading-none transition-colors"
        :class="getFilterTabClass(item.key)"
        @click="onFilterTabClick(item.key)"
      >
        <span class="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {{ item.label }}
        </span>
        <span
          class="absolute right-[16px] top-[3px] inline-flex items-center justify-center rounded-full bg-secondary-2 px-[2px] text-[10px] font-[400] text-text-1"
        >
          {{ item.count }}
        </span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSportsStore } from '@/stores/sports'
import { useFilterTabs } from './index'
import type { FilterTabChangePayload, FilterTabKey } from './index'

const emit = defineEmits<{
  'filter-change': [payload: FilterTabChangePayload]
}>()

const filterTabs = useFilterTabs()
const { selectedFilterKey: activeFilterKey } = storeToRefs(useSportsStore())

// 根据当前选中的筛选项返回连体分段按钮样式。
const getFilterTabClass = (key: FilterTabKey) =>
  activeFilterKey.value === key ? 'text-text-1 font-[700]' : 'text-text-2 font-[400]'

// 点击筛选按钮切换选中项。
const onFilterTabClick = (key: FilterTabKey) => {
  activeFilterKey.value = key
  // 暴露滚球/今日/早盘/串关当前点击项，方便父组件同步筛选条件。
  const payload = {
    key,
    item: filterTabs.value.find(item => item.key === key)
  }
  emit('filter-change', payload)
  console.log('点击滚球/今日/早盘/串关筛选项', payload)
}
</script>
