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
          :class="props.collectOnly ? 'text-theme-primary' : 'opacity-100'"
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
          :placeholder="t('sports.leagueTabs.search')"
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

    <button
      type="button"
      class="ml-[7px] flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-bg-2"
      aria-label="Open league filter"
      @click="openPopup"
    >
      <Filter class="h-3 w-3 text-text-3" />
    </button>

    <!-- 选择联赛弹窗 -->
    <Teleport to="body">
      <Transition name="league-filter-popup">
        <div
          v-if="isPopupOpen"
          class="fixed inset-0 z-[80] flex items-end bg-mask-60-1"
          @click.self="closePopup"
        >
          <section
            class="relative flex max-h-[75vh] min-h-[75vh] w-full flex-col overflow-hidden rounded-t-[12px] bg-bg-1 text-text-1"
            role="dialog"
            aria-modal="true"
            :aria-label="t('sports.leagueTabs.selectLeague')"
          >
            <header
              class="relative mb-[14px] flex flex-none items-center justify-center px-[14px] py-[10px]"
            >
              <h2 class="flex-1 text-center text-[16px] font-[700] text-text-1">
                {{ t('sports.leagueTabs.selectLeague') }}
              </h2>
              <button
                type="button"
                class="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-opacity-10"
                aria-label="Close select league"
                @click="closePopup"
              >
                <CloseIcon class="h-2.5 w-2.5 text-icon-1" />
              </button>
            </header>

            <div class="flex-none px-[14px] pb-[10px]">
              <label class="flex h-[30px] items-center rounded-[8px] bg-bg-2 px-[6px] py-[3px]">
                <SearchIcon class="h-[18px] w-[18px] text-icon-3" />
                <input
                  v-model="popupSearchKeyword"
                  class="ml-[5px] min-w-0 flex-1 border-0 bg-transparent text-[11px] font-[400] text-text-1 outline-none placeholder:text-text-3"
                  type="text"
                  :placeholder="t('sports.leagueTabs.searchLeagueOrTeam')"
                />
              </label>
            </div>

            <div
              ref="popupScrollRef"
              class="min-h-0 flex-1 overflow-y-auto px-[14px] pb-[90px]"
              @scroll="updateActiveIndexKey"
            >
              <section
                v-for="section in visibleSections"
                :key="section.key"
                :ref="element => setSectionRef(element, section.key)"
              >
                <div class="flex w-full items-center border-b border-opacity-6 py-[20px] pr-[20px]">
                  <button
                    type="button"
                    class="flex min-w-0 flex-1 items-center text-left"
                    @click="toggleSection(section.key)"
                  >
                    <Under_arrow
                      class="mr-[10px] h-[7px] w-[13px] text-icon-3 transition-transform duration-200"
                      :class="
                        collapsedSectionKeys.includes(section.key) ? 'rotate-180' : 'rotate-0'
                      "
                    />
                    <span class="min-w-0 flex-1 text-[14px] font-[700] text-text-1">
                      {{ section.label }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="league-check"
                    :class="{ 'league-check-active': isSectionSelected(section.items) }"
                    :aria-label="`Select ${section.label}`"
                    @click="toggleSectionSelection(section.items)"
                  >
                    <GouxuanIcon
                      v-if="isSectionSelected(section.items)"
                      class="h-[12px] w-[12px] text-text-4"
                    />
                  </button>
                </div>

                <Transition name="league-accordion">
                  <div v-if="!collapsedSectionKeys.includes(section.key)" class="overflow-hidden">
                    <div
                      v-for="item in section.items"
                      :key="`${section.key}-${item.key}`"
                      type="button"
                      class="flex w-full items-center border-b border-opacity-6 py-[20px] pr-[20px] text-left"
                      @click="toggleLeagueSelection(item.key)"
                    >
                      <span class="min-w-0 flex-1 truncate text-[14px] font-[700] text-text-1">
                        {{ item.label }}
                      </span>
                      <span
                        class="mr-[6px] min-w-[20px] text-right text-[14px] font-[400] text-theme-primary"
                      >
                        {{ item.count }}
                      </span>
                      <span
                        class="league-check"
                        :class="{ 'league-check-active': isLeagueSelected(item.key) }"
                      >
                        <GouxuanIcon
                          v-if="isLeagueSelected(item.key)"
                          class="h-[12px] w-[12px] text-text-4"
                        />
                      </span>
                    </div>
                  </div>
                </Transition>
              </section>
            </div>

            <div
              class="absolute bottom-[90px] right-[10px] top-[134px] z-[1] flex flex-col items-center justify-center gap-[4px] text-[10px]"
            >
              <button
                v-for="letter in alphabetIndex"
                :key="letter"
                type="button"
                class="h-[10px] leading-none"
                :class="letter === activeIndexKey ? 'text-theme-primary' : 'text-text-2'"
                @click="scrollToSection(letter)"
              >
                {{ letter }}
              </button>
            </div>

            <footer
              class="absolute inset-x-0 bottom-0 flex items-center gap-[10px] bg-bg-2 px-[10px] pb-[25px] pt-[10px]"
            >
              <button
                type="button"
                class="flex h-[34px] flex-none items-center text-[16px] font-[400] leading-[20px] text-text-1"
                @click="toggleAllSelection"
              >
                <span
                  class="league-check2 mr-[5px]"
                  :class="{ 'league-check-active2': isAllSelected }"
                >
                  <GouxuanIcon v-if="isAllSelected" class="h-[12px] w-[12px] text-text-4" />
                </span>
                {{ t('sports.leagueTabs.selectAll') }}
              </button>
              <button
                type="button"
                class="h-[44px] min-w-0 flex-1 rounded-full bg-theme-primary text-[14px] font-[700] text-text-4"
                @click="applyPopupFilter"
              >
                {{ t('sports.leagueTabs.filter') }} {{ selectedLeagueKeys.length }}
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SearchIcon from '@/static/svg/sports/liansai_tabs/search.svg?component'
import CollectIcon from '@/static/svg/sports/liansai_tabs/collect.svg?component'
import Filter from '@/static/svg/sports/liansai_tabs/filter.svg?component'
import CloseIcon from '@/static/svg/sports/liansai_tabs/close.svg?component'
import GouxuanIcon from '@/static/svg/sports/liansai_tabs/gouxuan.svg?component'
import Under_arrow from '@/static/svg/sports/liansai_tabs/under_arrow.svg?component'
import { useLiansaiTabs } from './index'
import type {
  LeagueFilterPayload,
  LeagueTabItem,
  LiansaiFilterKey,
  LiansaiFilterPayload
} from './index'

type LeagueSection = {
  key: string
  label: string
  items: LeagueTabItem[]
}

type CollectOnlyPayload = {
  collectOnly: boolean
}

const emit = defineEmits<{
  'filter-change': [payload: LiansaiFilterPayload]
  'league-filter': [payload: LeagueFilterPayload]
  'collect-change': [payload: CollectOnlyPayload]
}>()

const props = withDefaults(
  defineProps<{
    collectOnly?: boolean
  }>(),
  {
    collectOnly: false
  }
)

const { t } = useI18n()
const { filterTabs, leagueFilterItems, activeFilterKey, selectFilterKey, applyLeagueFilter } =
  useLiansaiTabs()

const alphabetIndex = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]
const searchKeyword = ref('')
const popupSearchKeyword = ref('')
const isPopupOpen = ref(false)
const selectedLeagueKeys = ref<string[]>([])
const hasTouchedLeagueSelection = ref(false)
const collapsedSectionKeys = ref<string[]>([])
const popupScrollRef = ref<HTMLElement | null>(null)
const sectionRefs = ref<Record<string, HTMLElement>>({})
const activeIndexKey = ref('#')

// 根据弹窗搜索关键字过滤接口返回的联赛列表。
const visibleLeagueTabs = computed(() => {
  const keyword = popupSearchKeyword.value.trim().toLowerCase()
  if (!keyword) return leagueFilterItems.value
  return leagueFilterItems.value.filter(item => item.label.toLowerCase().includes(keyword))
})

// 将可见联赛按首字母分组，供弹窗列表和右侧索引共同使用。
const visibleSections = computed<LeagueSection[]>(() => {
  const letterSections = visibleLeagueTabs.value.reduce<Record<string, LeagueTabItem[]>>(
    (result, item) => {
      const letter = item.label[0]?.toUpperCase() ?? '#'
      const key = /^[A-Z]$/.test(letter) ? letter : '#'
      result[key] = [...(result[key] ?? []), item]
      return result
    },
    {}
  )

  return Object.entries(letterSections)
    .sort(([prev], [next]) => prev.localeCompare(next))
    .map(([key, items]) => ({ key, label: key, items }))
})

// 提取当前可见联赛 key，用于全选、反选和筛选提交。
const allVisibleLeagueKeys = computed(() => visibleLeagueTabs.value.map(item => item.key))
// 判断当前搜索结果里的联赛是否已经全部选中。
const isAllSelected = computed(
  () =>
    allVisibleLeagueKeys.value.length > 0 &&
    allVisibleLeagueKeys.value.every(key => selectedLeagueKeys.value.includes(key))
)
// 根据当前选中的筛选项返回分段按钮样式。
const getFilterButtonClass = (key: LiansaiFilterKey) =>
  activeFilterKey.value === key
    ? 'bg-bg-3 text-text-1 font-[700]'
    : 'bg-transparent text-text-3 font-[400]'

// 点击联赛/时间切换选中项。 emit已经暴露出去，别的组件可以接受当前选中哪个值
const onFilterTabClick = (key: LiansaiFilterKey) => {
  emit('filter-change', selectFilterKey(key))
}

// 切换收藏筛选状态。
const toggleCollectOnly = () => {
  // 暴露收藏筛选状态，true 表示收藏，false 表示取消收藏。
  const payload = { collectOnly: !props.collectOnly }
  emit('collect-change', payload)
}

// 打开 H5 联赛筛选弹窗。
const openPopup = () => {
  isPopupOpen.value = true
}

// 关闭 H5 联赛筛选弹窗。
const closePopup = () => {
  isPopupOpen.value = false
}

// 缓存每个分组 DOM 节点，供右侧字母索引滚动定位使用。
const setSectionRef = (element: unknown, key: string) => {
  if (element instanceof HTMLElement) {
    sectionRefs.value[key] = element
  }
}

// 根据弹窗滚动位置更新当前高亮的右侧索引。
const updateActiveIndexKey = () => {
  const scrollElement = popupScrollRef.value
  if (!scrollElement) return

  const threshold = scrollElement.scrollTop + 8
  let currentKey = visibleSections.value[0]?.key ?? '#'

  for (const section of visibleSections.value) {
    const element = sectionRefs.value[section.key]
    if (!element) continue
    if (element.offsetTop <= threshold) {
      currentKey = section.key
    }
  }

  activeIndexKey.value = currentKey
}

// 点击右侧索引后滚动到对应联赛分组。
const scrollToSection = async (key: string) => {
  const element = sectionRefs.value[key]
  const scrollElement = popupScrollRef.value
  if (!element || !scrollElement) return

  scrollElement.scrollTo({
    top: element.offsetTop,
    behavior: 'smooth'
  })
  activeIndexKey.value = key
}

// 展开或收起某个首字母分组，并在 DOM 更新后刷新索引高亮。
const toggleSection = (key: string) => {
  collapsedSectionKeys.value = collapsedSectionKeys.value.includes(key)
    ? collapsedSectionKeys.value.filter(item => item !== key)
    : [...collapsedSectionKeys.value, key]
  nextTick(updateActiveIndexKey)
}

// 判断指定联赛是否在当前弹窗选择结果中。
const isLeagueSelected = (key: string) => selectedLeagueKeys.value.includes(key)

// 切换单个联赛的勾选状态。
const toggleLeagueSelection = (key: string) => {
  hasTouchedLeagueSelection.value = true
  selectedLeagueKeys.value = isLeagueSelected(key)
    ? selectedLeagueKeys.value.filter(item => item !== key)
    : [...selectedLeagueKeys.value, key]
}

// 判断某个分组下的所有联赛是否都已选中。
const isSectionSelected = (items: LeagueTabItem[]) =>
  items.length > 0 && items.every(item => selectedLeagueKeys.value.includes(item.key))

// 切换整个分组的联赛选择状态。
const toggleSectionSelection = (items: LeagueTabItem[]) => {
  hasTouchedLeagueSelection.value = true
  const keys = items.map(item => item.key)
  if (keys.every(key => selectedLeagueKeys.value.includes(key))) {
    selectedLeagueKeys.value = selectedLeagueKeys.value.filter(key => !keys.includes(key))
    return
  }

  selectedLeagueKeys.value = Array.from(new Set([...selectedLeagueKeys.value, ...keys]))
}

// 切换当前搜索结果范围内的全选状态。
const toggleAllSelection = () => {
  hasTouchedLeagueSelection.value = true
  if (isAllSelected.value) {
    selectedLeagueKeys.value = selectedLeagueKeys.value.filter(
      key => !allVisibleLeagueKeys.value.includes(key)
    )
    return
  }

  selectedLeagueKeys.value = Array.from(
    new Set([...selectedLeagueKeys.value, ...allVisibleLeagueKeys.value])
  )
}

// 点击弹窗全部联赛过滤按钮 emit已经暴露出去，别的组件可以接受当前选中哪个值
const applyPopupFilter = () => {
  const payload = applyLeagueFilter(selectedLeagueKeys.value)
  emit('league-filter', payload)
  closePopup()
}

// 接口联赛列表变化时，初始化或修正弹窗里的已选联赛。
watch(
  leagueFilterItems,
  items => {
    const availableKeys = items.map(item => item.key)
    const availableKeySet = new Set(availableKeys)
    const selectedKeys = selectedLeagueKeys.value.filter(key => availableKeySet.has(key))
    selectedLeagueKeys.value = hasTouchedLeagueSelection.value ? selectedKeys : availableKeys
  },
  { immediate: true }
)

// 弹窗打开后等待 DOM 渲染完成，再同步右侧索引高亮。
watch(isPopupOpen, async open => {
  if (!open) return
  await nextTick()
  updateActiveIndexKey()
})

// 可见分组变化时重置 DOM 引用，并刷新当前索引。
watch(visibleSections, async () => {
  sectionRefs.value = {}
  await nextTick()
  updateActiveIndexKey()
})
</script>

<style scoped>
.league-filter-popup-enter-active,
.league-filter-popup-leave-active {
  transition: opacity 0.22s ease;
}

.league-filter-popup-enter-active section,
.league-filter-popup-leave-active section {
  transition: transform 0.22s ease;
}

.league-filter-popup-enter-from,
.league-filter-popup-leave-to {
  opacity: 0;
}

.league-filter-popup-enter-from section,
.league-filter-popup-leave-to section {
  transform: translateY(100%);
}

.league-check {
  display: inline-flex;
  height: 18px;
  width: 18px;
  flex: 0 0 18px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-background-level-3);
  border-radius: 4px;
}

.league-check2 {
  display: inline-flex;
  height: 18px;
  width: 18px;
  flex: 0 0 18px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-theme-level-1);
  border-radius: 4px;
}

.league-check-active {
  border: 1px solid var(--color-theme-level-1);
  background: var(--color-theme-level-1);
}

.league-check-active2 {
  border: 1px solid var(--color-theme-level-1);
  background: var(--color-theme-level-1);
}

.league-accordion-enter-active,
.league-accordion-leave-active {
  max-height: 720px;
  opacity: 1;
  transition:
    max-height 0.22s ease,
    opacity 0.18s ease;
}

.league-accordion-enter-from,
.league-accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
