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
import { ref } from 'vue'

type FilterTabItem = {
  key: string
  label: string
  count: number
}

const filterTabs: FilterTabItem[] = [
  { key: 'rolling', label: '滚球', count: 125 },
  { key: 'today', label: '今日', count: 125 },
  { key: 'early', label: '早盘', count: 125 },
  { key: 'parlay', label: '串关', count: 125 }
]

const activeFilterKey = ref(filterTabs[0]?.key ?? '')

// 根据当前选中的筛选项返回连体分段按钮样式。
const getFilterTabClass = (key: string) =>
  activeFilterKey.value === key ? 'text-text-1 font-[700]' : 'text-text-2 font-[400]'

// 点击筛选按钮切换选中项。
const onFilterTabClick = (key: string) => {
  activeFilterKey.value = key
}
</script>
