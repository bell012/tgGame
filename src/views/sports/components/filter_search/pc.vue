<!-- pc赛事筛选和搜索 -->
<template>
  <section class="flex w-full items-center justify-between">
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
          :placeholder="t('sports.leagueTabs.searchLeagueOrTeam')"
        />
      </label>

      <button
        type="button"
        class="inline-flex ml-[12px] h-[41px] w-[41px] flex-none items-center justify-center rounded-full border-0 bg-bg-2 transition-colors"
        @click="toggleCollectOnly"
      >
        <CollectIcon
          class="h-5 w-5 text-icon-2"
          :class="props.collectOnly ? 'text-theme-primary' : 'opacity-100'"
        />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSportsStore } from '@/stores/sports'
import SearchIcon from '@/static/svg/sports/liansai_tabs/search.svg?component'
import CollectIcon from '@/static/svg/sports/liansai_tabs/collect.svg?component'
import { useFilterTabs } from './index'
import type { CollectOnlyPayload, FilterTabChangePayload, FilterTabKey } from './index'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  'filter-change': [payload: FilterTabChangePayload]
  'collect-change': [payload: CollectOnlyPayload]
  'search-change': [keyword: string]
}>()

const props = withDefaults(
  defineProps<{
    collectOnly?: boolean
    searchKeyword?: string
  }>(),
  {
    collectOnly: false,
    searchKeyword: ''
  }
)

const filterTabs = useFilterTabs()
const { selectedFilterKey: activeFilterKey } = storeToRefs(useSportsStore())
// 搜索文本由页面统一管理；组件只回传输入，不自行请求接口。
const searchKeyword = computed({
  get: () => props.searchKeyword,
  set: value => emit('search-change', value)
})
const { t } = useI18n()

// 根据当前选中的筛选项返回按钮样式。
const getFilterTabClass = (key: FilterTabKey) =>
  activeFilterKey.value === key
    ? 'bg-bg-3 text-text-1 font-[700]'
    : 'bg-bg-9 text-text-3 lg:hover:bg-bg-2'

// 点击筛选按钮切换选中项。
const onFilterTabClick = (key: FilterTabKey) => {
  activeFilterKey.value = key
  // 暴露滚球/今日/早盘/串关当前点击项，方便父组件同步筛选条件。
  const payload = {
    key,
    item: filterTabs.value.find(item => item.key === key)
  }
  emit('filter-change', payload)
}

// 切换收藏状态。
const toggleCollectOnly = () => {
  // 暴露收藏筛选状态，true 表示收藏，false 表示取消收藏。
  const payload = { collectOnly: !props.collectOnly }
  emit('collect-change', payload)
}
</script>
