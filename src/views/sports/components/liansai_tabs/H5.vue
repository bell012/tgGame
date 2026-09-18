<!-- H5联赛搜索和筛选栏 -->
<template>
  <section class="flex w-full min-w-0 items-center">
    <div class="flex min-w-0 flex-1 items-center gap-[7px]">
      <button
        type="button"
        class="inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg border-0 bg-bg-2 transition-colors"
        aria-label="Collect only"
        @click="toggleCollectOnly"
      >
        <CollectIcon
          class="h-3 w-3 text-icon-3"
          :class="collectOnly ? 'opacity-100' : 'opacity-80'"
        />
      </button>

      <label
        class="flex h-[30px] max-w-[110px] flex-1 items-center rounded-lg bg-bg-2 px-[6px] transition-colors"
      >
        <SearchIcon class="h-[18px] w-[18px] text-icon-3" />
        <input
          v-model="searchKeyword"
          class="min-w-0 flex-1 border-0 bg-transparent text-[11px] font-[400] text-text-1 outline-none placeholder:text-text-3"
          type="text"
          placeholder="Search"
        />
      </label>
    </div>

    <div class="flex h-[30px] flex-none items-center rounded-[8px] bg-bg-2 px-[2px]">
      <button
        v-for="item in filterTabs"
        :key="item.key"
        type="button"
        class="inline-flex h-full flex-none items-center justify-center rounded-[8px] border-0 px-[10px] text-[10px] transition-colors"
        :class="getFilterButtonClass(item.key)"
        @click="onFilterTabClick(item.key)"
      >
        <span class="block overflow-hidden text-ellipsis whitespace-nowrap">
          {{ item.label }}
        </span>
      </button>
    </div>

    <div class="w-[30px] h-[30px] bg-bg-2 ml-[7px] rounded-[8px] flex items-center justify-center">
      <Filter class="h-3 w-3 text-text-3" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchIcon from '@/static/svg/sports/liansai_tabs/search.svg?component'
import CollectIcon from '@/static/svg/sports/liansai_tabs/collect.svg?component'
import Filter from '@/static/svg/sports/liansai_tabs/filter.svg?component'

type FilterTabItem = {
  key: string
  label: string
}

const filterTabs: FilterTabItem[] = [
  { key: 'league', label: 'League' },
  { key: 'time', label: 'Time' }
]

const activeFilterKey = ref('time')
const searchKeyword = ref('')
const collectOnly = ref(false)

// 根据当前选中的筛选项返回分段按钮样式。
const getFilterButtonClass = (key: string) =>
  activeFilterKey.value === key
    ? 'bg-bg-3 text-text-1 font-[700]'
    : 'bg-transparent text-text-3 font-[400]'

// 点击联赛/时间切换选中项。
const onFilterTabClick = (key: string) => {
  activeFilterKey.value = key
}

// 切换收藏筛选状态。
const toggleCollectOnly = () => {
  collectOnly.value = !collectOnly.value
}
</script>
