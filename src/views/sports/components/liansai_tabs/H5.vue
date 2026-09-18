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
            aria-label="Select League"
          >
            <header
              class="relative flex px-[14px] py-[10px] flex-none items-center justify-center mb-[14px]"
            >
              <h2 class="text-[16px] flex-1 text-center font-[700] text-text-1">选择联赛</h2>
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
                  placeholder="Search League or Team"
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
                <div class="flex py-[20px] pr-[20px] w-full items-center border-b border-opacity-6">
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
                      class="flex w-full items-center text-left py-[20px] pr-[20px] border-b border-opacity-6"
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
                type="button"
                class="flex h-[12px] w-[12px] items-center justify-center"
                aria-label="Popular Leagues"
                @click="scrollToSection('popular')"
              >
                <Hot
                  class="h-[12px] w-[12px]"
                  :class="activeIndexKey === 'popular' ? 'text-theme-primary' : 'text-text-4'"
                />
              </button>
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
              class="absolute inset-x-0 bottom-0 flex px-[10px] pt-[10px] pb-[25px] items-center gap-[10px] bg-bg-2"
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
                Select All
              </button>
              <button
                type="button"
                class="h-[44px] min-w-0 flex-1 rounded-full bg-theme-primary text-[14px] font-[700] text-text-4"
                @click="closePopup"
              >
                Filter {{ selectedLeagueKeys.length }}
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
import SearchIcon from '@/static/svg/sports/liansai_tabs/search.svg?component'
import CollectIcon from '@/static/svg/sports/liansai_tabs/collect.svg?component'
import Filter from '@/static/svg/sports/liansai_tabs/filter.svg?component'
import CloseIcon from '@/static/svg/sports/liansai_tabs/close.svg?component'
import GouxuanIcon from '@/static/svg/sports/liansai_tabs/gouxuan.svg?component'
import Under_arrow from '@/static/svg/sports/liansai_tabs/under_arrow.svg?component'
import Hot from '@/static/svg/sports/liansai_tabs/hot.svg?skipsvgo'

type FilterTabItem = {
  key: string
  label: string
}

type LeagueTabItem = {
  key: string
  label: string
  count: number
}

type LeagueSection = {
  key: string
  label: string
  items: LeagueTabItem[]
}

const filterTabs: FilterTabItem[] = [
  { key: 'league', label: 'League' },
  { key: 'time', label: 'Time' }
]

const leagueTabs: LeagueTabItem[] = [
  { key: 'uefa-champions-league', label: 'UEFA Champions League', count: 175 },
  { key: 'uefa-europa-league', label: 'UEFA Europa League', count: 41 },
  { key: 'copa-libertadores', label: 'Copa Libertadores', count: 23 },
  { key: 'premier-league', label: 'Premier League', count: 62 },
  { key: 'serie-a', label: 'Serie A', count: 37 },
  { key: 'la-liga', label: 'La Liga', count: 49 },
  { key: 'bundesliga', label: 'German Bundesliga', count: 33 },
  { key: 'ligue-1', label: 'Ligue 1', count: 28 },
  { key: 'ligue-2', label: 'Ligue 2', count: 16 },
  { key: 'french-cup', label: 'French Cup', count: 12 }
]

const alphabetIndex = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const popularLeagueKeys = ['uefa-champions-league', 'bundesliga']

const activeFilterKey = ref('time')
const searchKeyword = ref('')
const popupSearchKeyword = ref('')
const collectOnly = ref(false)
const isPopupOpen = ref(false)
const selectedLeagueKeys = ref<string[]>(['uefa-champions-league', 'bundesliga'])
const collapsedSectionKeys = ref<string[]>([])
const popupScrollRef = ref<HTMLElement | null>(null)
const sectionRefs = ref<Record<string, HTMLElement>>({})
const activeIndexKey = ref('popular')

const visibleLeagueTabs = computed(() => {
  const keyword = popupSearchKeyword.value.trim().toLowerCase()
  if (!keyword) return leagueTabs
  return leagueTabs.filter(item => item.label.toLowerCase().includes(keyword))
})

const visibleSections = computed<LeagueSection[]>(() => {
  const popularItems = popularLeagueKeys
    .map(key => visibleLeagueTabs.value.find(item => item.key === key))
    .filter((item): item is LeagueTabItem => Boolean(item))

  const popularKeySet = new Set(popularItems.map(item => item.key))
  const letterSections = visibleLeagueTabs.value
    .filter(item => !popularKeySet.has(item.key))
    .reduce<Record<string, LeagueTabItem[]>>((result, item) => {
      const letter = item.label[0]?.toUpperCase() ?? '#'
      const key = /^[A-Z]$/.test(letter) ? letter : '#'
      result[key] = [...(result[key] ?? []), item]
      return result
    }, {})

  const sections: LeagueSection[] = []
  if (popularItems.length) {
    sections.push({ key: 'popular', label: 'Popular Leagues', items: popularItems })
  }

  sections.push(
    ...Object.entries(letterSections)
      .sort(([prev], [next]) => prev.localeCompare(next))
      .map(([key, items]) => ({ key, label: key, items }))
  )

  return sections
})

const allVisibleLeagueKeys = computed(() => visibleLeagueTabs.value.map(item => item.key))
const isAllSelected = computed(
  () =>
    allVisibleLeagueKeys.value.length > 0 &&
    allVisibleLeagueKeys.value.every(key => selectedLeagueKeys.value.includes(key))
)
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

const openPopup = () => {
  isPopupOpen.value = true
}

const closePopup = () => {
  isPopupOpen.value = false
}

const setSectionRef = (element: any, key: string) => {
  if (element instanceof HTMLElement) {
    sectionRefs.value[key] = element
  }
}

const updateActiveIndexKey = () => {
  const scrollElement = popupScrollRef.value
  if (!scrollElement) return

  const threshold = scrollElement.scrollTop + 8
  let currentKey = visibleSections.value[0]?.key ?? 'popular'

  for (const section of visibleSections.value) {
    const element = sectionRefs.value[section.key]
    if (!element) continue
    if (element.offsetTop <= threshold) {
      currentKey = section.key
    }
  }

  activeIndexKey.value = currentKey
}

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

const toggleSection = (key: string) => {
  collapsedSectionKeys.value = collapsedSectionKeys.value.includes(key)
    ? collapsedSectionKeys.value.filter(item => item !== key)
    : [...collapsedSectionKeys.value, key]
  nextTick(updateActiveIndexKey)
}

const isLeagueSelected = (key: string) => selectedLeagueKeys.value.includes(key)

const toggleLeagueSelection = (key: string) => {
  selectedLeagueKeys.value = isLeagueSelected(key)
    ? selectedLeagueKeys.value.filter(item => item !== key)
    : [...selectedLeagueKeys.value, key]
}

const isSectionSelected = (items: LeagueTabItem[]) =>
  items.length > 0 && items.every(item => selectedLeagueKeys.value.includes(item.key))

const toggleSectionSelection = (items: LeagueTabItem[]) => {
  const keys = items.map(item => item.key)
  if (keys.every(key => selectedLeagueKeys.value.includes(key))) {
    selectedLeagueKeys.value = selectedLeagueKeys.value.filter(key => !keys.includes(key))
    return
  }

  selectedLeagueKeys.value = Array.from(new Set([...selectedLeagueKeys.value, ...keys]))
}

const toggleAllSelection = () => {
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

watch(isPopupOpen, async open => {
  if (!open) return
  await nextTick()
  updateActiveIndexKey()
})

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
