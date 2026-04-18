<template>
  <!-- 顶部搜索 -->
  <div class="relative top-search" @mousedown="onWrapDown">
    <div
      class="top-search-leading h-[28px] flex items-center absolute left-3 top-1/2 -translate-y-1/2"
      @click="typeVisible = true"
    >
      <div class="top-search-type text-[12px] font-[700] mr-[6px] cursor-pointer">
        {{ currentTypeName }}
      </div>
      <pull_down class="top-search-pull w-2 h-2" />
      <div class="top-search-divider w-[1px] h-[26px] mx-2.5 bg-[var(--color-opacity-10)]"></div>
      <SearchIcon class="w-[18px] h-[18px] fill-none stroke-text-2 opacity-60" />
    </div>
    <input
      v-model="keyword"
      type="text"
      :placeholder="t('search.placeholder')"
      class="top-search-input w-full h-[50px] pl-[116px] pr-11 rounded-[10px] border text-text-1 text-[14px] font-[600] outline-none focus:border-theme-primary placeholder:text-text-2"
      @input="onInput"
      @keydown.enter.prevent="onSearch"
      @focus="focusClick"
      @blur="onBlur"
    />
    <button
      v-if="keyword"
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded flex items-center justify-center hover:bg-[var(--color-opacity-6)]"
      @click="clear"
      aria-label="clear"
    >
      <CloseIcon class="w-5 h-5 stroke-text-2" />
    </button>
    <!-- 搜索记录框 -->
    <div
      v-if="isOpen"
      class="absolute panel left-0 top-[58px] bg-[var(--color-background-level-2)] z-[99] border border-[var(--color-border-level-1)] w-full rounded-lg px-3.5 pt-5 pb-3 flex flex-col items-center"
    >
      <div
        class="absolute -right-1.5 -top-1.5 w-5 h-5 bg-[var(--color-background-level-3)] flex items-center justify-center rounded-3xl"
        @click="isOpen = false"
      >
        <CloseIcon class="w-4 h-4 stroke-text-2" />
      </div>
      <div class="text-xs text-[var(--color-text-level-2)]">
        {{ t('casino.search_tips') }}
      </div>
      <!-- 历史记录 -->
      <div class="flex justify-between w-full text-xs my-2.5">
        <div class="font-bold">{{ t('search.history') }}</div>
        <div
          class="text-[var(--color-text-level-2)] cursor-pointer"
          v-if="history.length > 0"
          @click="clearHistory"
        >
          {{ t('search.clear') }}（{{ history?.length }}）
        </div>
      </div>
      <!-- 搜索历史记录 -->
      <div class="w-full">
        <div v-if="history?.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="(item, inx) in history.slice(0, 5)"
            :key="inx"
            class="px-1.5 py-1 rounded bg-[var(--color-opacity-10)] inline-flex items-center cursor-pointer"
          >
            <div
              class="text-xs text-[var(--color-text-level-2)] mr-0.5 break-words max-w-full cursor-pointer"
              @click="goSearch(item)"
            >
              {{ item }}
            </div>
            <CloseIcon
              class="w-4 h-4 stroke-text-2 shrink-0 cursor-pointer"
              @click.stop="deleteItem(item)"
            />
          </div>
        </div>
      </div>
      <!-- 接口返回搜索选项 -->
      <div class="text-xs my-2.5 w-full">
        <div class="font-bold">{{ t('search.suggested') }}</div>
      </div>
      <div class="w-full">
        <div v-if="suggestedList.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="(item, inx) in suggestedList"
            :key="inx"
            class="px-1.5 py-1 rounded bg-[var(--color-opacity-10)] flex items-center cursor-pointer"
          >
            <div
              class="text-xs text-[var(--color-text-level-2)] break-words max-w-full cursor-pointer"
              @click="goSearch(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 搜索类型弹窗 -->
    <Teleport to="body" v-if="isMobile">
      <TypePopup
        v-model:visible="typeVisible"
        :typeList="dataList"
        :selectedId="currentType"
        @confirm="handleTypeConfirm"
      />
    </Teleport>
    <TypePopup
      v-else
      class="desktop-type-popup"
      v-model:visible="typeVisible"
      :typeList="dataList"
      :selectedId="currentType"
      @confirm="handleTypeConfirm"
      desktop
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed, inject, Ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TypePopup from './popup.vue'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import pull_down from '@/static/svg/explore/pull-down.svg?component'
import { useIsMobile } from '@/composables/useMediaQuery'

type TypeItem = { id: string; name: string }
type HotGameItem = {
  platformName?: string
}
const SEARCH_HISTORY_STORAGE_KEY = 'explore_search_history'
const MAX_HISTORY_COUNT = 20

const props = defineProps<{
  dataList: TypeItem[]
}>()

const emit = defineEmits<{
  'change-type': [id: string]
  search: [keyword: string]
}>()

const { t } = useI18n()
const isMobile = useIsMobile()

const keyword = inject('explore-keywords') as Ref<string>
const currentType = inject('explore-current-type') as Ref<string>
const hotGameList = inject<Ref<HotGameItem[]>>('explore-hot-game-list', ref([]))

const typeVisible = ref(false)

const history = ref<string[]>([]) // 本地搜索历史
const isOpen = ref(false)
let downInPanel = false
let timer: ReturnType<typeof setTimeout> | null = null

const onWrapDown = (e: MouseEvent) => {
  downInPanel = (e.target as HTMLElement).closest('.panel') != null
}

const onBlur = () => {
  if (!downInPanel) isOpen.value = false
  downInPanel = false
}

const shouldShowSearchPanel = (trimmedKeyword: string) => {
  return currentType.value === 'casino' && trimmedKeyword.length < 2
}

const emitSearch = () => {
  const trimmedKeyword = keyword.value.trim()
  emit('search', trimmedKeyword)
  isOpen.value = shouldShowSearchPanel(trimmedKeyword)
}

const onInput = () => {
  isOpen.value = shouldShowSearchPanel(keyword.value.trim())

  if (timer !== null) clearTimeout(timer)
  timer = setTimeout(emitSearch, 300)
  timer = setTimeout(() => {
    addHistory(keyword.value)
  }, 1000)
}

const onSearch = () => {
  if (timer !== null) clearTimeout(timer)
  emitSearch()
  addHistory(keyword.value)
}

const currentTypeName = computed(() => {
  const item = props.dataList.find(i => i.id === currentType.value)
  return item ? item.name : ''
})
const suggestedList = computed(() => {
  const seen = new Set<string>()
  return hotGameList.value
    .map(item => String(item.platformName ?? '').trim())
    .filter(platformName => {
      if (!platformName) return false
      const normalizedName = platformName.toLowerCase()
      if (seen.has(normalizedName)) return false
      seen.add(normalizedName)
      return true
    })
})

// 类型选择确认
const handleTypeConfirm = (_val: TypeItem) => {
  currentType.value = _val.id
  typeVisible.value = false
  emit('change-type', _val.id)
}

const persistHistory = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history.value))
}

const loadHistory = () => {
  if (typeof window === 'undefined') return

  const rawHistory = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY)
  if (!rawHistory) return

  try {
    const parsedHistory = JSON.parse(rawHistory)
    if (!Array.isArray(parsedHistory)) return

    history.value = parsedHistory.filter((item): item is string => typeof item === 'string')
  } catch (error) {
    console.error('load explore search history failed', error)
  }
}

const addHistory = (value: string) => {
  const trimmedValue = value.trim()
  if (trimmedValue.length < 2) return

  const dedupedHistory = history.value.filter(
    item => item.toLowerCase() !== trimmedValue.toLowerCase()
  )

  history.value = [trimmedValue, ...dedupedHistory].slice(0, MAX_HISTORY_COUNT)
  persistHistory()
}

// 删除单条本地搜索记录
const deleteItem = (value: string) => {
  history.value = history.value.filter(item => item !== value)
  persistHistory()
}

const clearHistory = () => {
  history.value = []
  persistHistory()
}

const focusClick = () => {
  isOpen.value = shouldShowSearchPanel(keyword.value.trim())
}

// 点击搜索历史和建议
const goSearch = (item: string) => {
  keyword.value = item
  isOpen.value = false
  onSearch()
}

const clear = () => {
  keyword.value = ''
  emitSearch()
}

onMounted(() => {
  loadHistory()
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped lang="scss">
.desktop-type-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 100%;
}

.top-search-input {
  background: var(--color-input-level-1);
  border-color: var(--color-input-level-2);
}

.top-search-input::placeholder {
  font-weight: 500;
}

@media (max-width: 767px) {
  .top-search-leading {
    left: 12px;
  }

  .top-search-type {
    max-width: 68px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 16px;
    line-height: 1;
  }
}
</style>
