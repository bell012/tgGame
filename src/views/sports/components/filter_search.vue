<!-- 赛事筛选和搜索 -->
<template>
  <!-- pc -->
  <section v-if="!isMobile" class="flex w-full items-center justify-between">
    <div class="flex items-center gap-[10px]">
      <button
        v-for="item in filterTabs"
        :key="item.key"
        type="button"
        class="relative inline-flex h-[40px] px-[24px] py-[12px] items-center justify-center rounded-[32px] border-0 text-[14px] font-[400] transition-colors"
        :class="getFilterTabClass(item.key)"
        @click="onFilterTabClick(item.key)"
      >
        <span class="block max-w-[86px] overflow-hidden text-ellipsis whitespace-nowrap">
          {{ item.label }}
        </span>
        <span
          class="absolute right-0 top-[-7px] inline-flex items-center justify-center rounded-[4px] bg-secondary-2 px-[2px] text-[11px] font-bold text-text-1"
        >
          {{ item.count }}
        </span>
      </button>
    </div>

    <div class="flex flex-none items-center">
      <label
        class="flex h-[40px] w-[264px] items-center rounded-[32px] bg-bg-2 px-[16px] transition-colors"
      >
        <SearchIcon class="h-5 w-5 text-icon-3" />
        <input
          v-model="searchKeyword"
          class="ml-[4px] min-w-0 flex-1 border-0 bg-transparent text-[14px] font-[400] text-text-1 outline-none placeholder:text-text-3"
          type="text"
          placeholder="搜索联赛或球队"
        />
      </label>

      <button
        type="button"
        class="inline-flex ml-[12px] h-[41px] w-[41px] flex-none items-center justify-center rounded-full border-0 bg-bg-2 transition-colors"
        @click="toggleCollectOnly"
      >
        <CollectIcon
          class="h-5 w-5 text-icon-2"
          :class="collectOnly ? 'opacity-100' : 'opacity-80'"
        />
      </button>
    </div>
  </section>

  <!-- H5 -->
  <section v-else class="flex h-[52px] w-full bg-bg-1">H5 赛事筛选和搜索</section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import SearchIcon from '@/static/svg/sports/liansai_tabs/search.svg?component'
import CollectIcon from '@/static/svg/sports/liansai_tabs/collect.svg?component'

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

const isMobile = useIsMobile()
const activeFilterKey = ref('today')
const searchKeyword = ref('')
const collectOnly = ref(false)

// 根据当前选中的筛选项返回按钮样式。
const getFilterTabClass = (key: string) =>
  activeFilterKey.value === key
    ? 'bg-bg-3 text-text-1 font-[700]'
    : 'bg-bg-9 text-text-3 lg:hover:bg-bg-2'

// 点击筛选按钮切换选中项。
const onFilterTabClick = (key: string) => {
  activeFilterKey.value = key
}

// 切换收藏状态。
const toggleCollectOnly = () => {
  collectOnly.value = !collectOnly.value
}
</script>
