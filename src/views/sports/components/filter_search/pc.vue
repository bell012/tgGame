<!-- pc赛事筛选和搜索 -->
<template>
  <section class="flex w-full flex-wrap items-center justify-between gap-3">
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

    <div class="ml-auto flex min-w-0 items-center gap-3">
      <label
        class="flex h-10 w-[264px] min-w-0 items-center gap-1 rounded-full border border-opacity-10 bg-opacity-6 px-4 focus-within:border-theme-primary"
      >
        <SearchIcon class="h-5 w-5 shrink-0 text-icon-3" aria-hidden="true" />
        <input
          v-model="searchKeyword"
          type="search"
          class="min-w-0 flex-1 bg-transparent text-sm text-text-1 outline-none placeholder:text-text-3"
          :placeholder="t('sports.leagueTabs.searchLeagueOrTeam')"
          :aria-label="t('sports.leagueTabs.searchLeagueOrTeam')"
        />
      </label>
      <button
        type="button"
        class="inline-flex h-[41px] w-[41px] flex-none items-center justify-center rounded-full border-0 bg-bg-2 transition-colors"
        :class="props.collectOnly ? '' : 'hover:bg-opacity-6'"
        :disabled="props.collectPending"
        :aria-busy="props.collectPending"
        :aria-label="t('sports.collectOnly')"
        @click="toggleCollectOnly"
      >
        <Loading
          v-if="props.collectPending"
          type="spinner"
          size="18px"
          color="currentColor"
          class="text-icon-2"
          aria-hidden="true"
        />
        <CollectIcon
          v-else
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
import { Loading } from 'vant'
import { useI18n } from 'vue-i18n'
import { useSportsStore } from '@/stores/sports'
import CollectIcon from '@/static/svg/sports/liansai_tabs/collect.svg?component'
import SearchIcon from '@/static/svg/sports/liansai_tabs/search.svg?component'
import { useFilterTabs } from './index'
import type { CollectOnlyPayload, FilterTabChangePayload, FilterTabKey } from './index'

const emit = defineEmits<{
  'filter-change': [payload: FilterTabChangePayload]
  'collect-change': [payload: CollectOnlyPayload]
  'search-change': [keyword: string]
}>()

const props = withDefaults(
  defineProps<{
    collectOnly?: boolean
    collectPending?: boolean
    searchKeyword?: string
  }>(),
  {
    collectOnly: false,
    collectPending: false,
    searchKeyword: ''
  }
)

const filterTabs = useFilterTabs()
const { t } = useI18n()
const { selectedFilterKey: activeFilterKey } = storeToRefs(useSportsStore())

// 与 H5 共用查询入口，v-model 在中文输入法组合完成后再更新关键词。
const searchKeyword = computed({
  get: () => props.searchKeyword,
  set: value => emit('search-change', value)
})

// 根据当前选中的筛选项返回按钮样式。
const getFilterTabClass = (key: FilterTabKey) =>
  activeFilterKey.value === key ? 'bg-bg-3 text-text-1' : 'bg-bg-9 text-text-3 hover:bg-opacity-6'

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
