<template>
  <!-- 顶部搜索 -->
  <div class="relative top-search" @mousedown="onWrapDown">
    <div
      class="h-[26px] flex items-center absolute left-2.5 top-1/2 -translate-y-1/2"
      @click="typeVisible = true"
    >
      <div class="text-[12px] font-[700] mr-[6px] cursor-pointer">{{ currentType.name }}</div>
      <pull_down class="w-2 h-2" />
      <div class="w-[1px] h-[26px] mx-2.5 bg-[var(--color-border-level-1)]"></div>
      <SearchIcon class="w-[18px] h-[18px] fill-none stroke-text-2 opacity-50" />
    </div>
    <input
      v-model="keyword"
      type="text"
      :placeholder="t('locales.search.placeholder')"
      class="w-full h-[42px] pl-[110px] pr-11 rounded-lg bg-[var(--color-opacity-6)] border border-[var(--color-border-level-1)] text-text-1 text-xs font-[600] outline-none focus:border-theme-primary placeholder:text-text-2"
      @keydown.enter.prevent="onSearch"
      @focus="isOpen = true"
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
      class="absolute panel left-0 top-[50px] bg-[var(--color-background-level-2)] z-[99] border border-[var(--color-border-level-1)] w-full rounded-lg px-3.5 pt-5 pb-3 flex flex-col items-center"
    >
      <div
        class="absolute -right-1.5 -top-1.5 w-5 h-5 bg-[var(--color-background-level-3)] flex items-center justify-center rounded-3xl"
        @click="isOpen = false"
      >
        <CloseIcon class="w-4 h-4 stroke-text-2" />
      </div>
      <div class="text-xs text-[var(--color-text-level-2)]">
        Search requires at least 2 characters.
      </div>
      <!-- 历史记录 -->
      <div class="flex justify-between w-full text-xs my-2.5">
        <div class="font-bold">{{ t('locales.search.history') }}</div>
        <div class="text-[var(--color-text-level-2)]">
          {{ t('locales.search.clear') }}（{{ history?.length }}）
        </div>
      </div>
      <!-- 搜索历史记录 -->
      <div class="w-full">
        <div v-if="history?.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="(item, inx) in history.slice(0, 5)"
            :key="inx"
            class="px-1.5 py-1 rounded bg-[var(--color-opacity-10)] inline-flex items-center"
          >
            <div
              class="text-xs text-[var(--color-text-level-2)] mr-0.5 break-words max-w-full"
              @click="goSearch(item)"
            >
              {{ item }}
            </div>
            <CloseIcon class="w-4 h-4 stroke-text-2 shrink-0" @click="deleteItme()" />
          </div>
        </div>
      </div>
      <!-- 接口返回搜索选项 -->
      <div class="text-xs my-2.5 w-full">
        <div class="font-bold">{{ t('locales.search.suggested') }}</div>
      </div>
      <div class="w-full">
        <div v-if="history?.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="(item, inx) in history.slice(0, 5)"
            :key="inx"
            class="px-1.5 py-1 rounded bg-[var(--color-opacity-10)] flex items-center"
          >
            <div
              class="text-xs text-[var(--color-text-level-2)] break-words max-w-full"
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
        :typeList="typeList"
        :selectedId="currentType.id"
        @confirm="handleTypeConfirm"
      />
    </Teleport>
    <TypePopup
      v-else
      class="desktop-type-popup"
      v-model:visible="typeVisible"
      :typeList="typeList"
      :selectedId="currentType.id"
      @confirm="handleTypeConfirm"
      desktop
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import TypePopup from './popup.vue'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import pull_down from '@/static/svg/explore/pull-down.svg?component'
import { useIsMobile } from '@/composables/useMediaQuery'

const { t } = useI18n()

const isMobile = useIsMobile()

/* ===================== 搜索输入 & 历史数据 ===================== */
const keyword = ref('') // 搜索框输入值
const history = ref(['1111', '2222', '3333', ' 4444', '555555', '6666']) // 本地搜索历史
const isOpen = ref(false) // 搜索记录框显示隐藏
/* ===================== end===================== */

/* ===================== 搜索记录框控制 ===================== */
let downInPanel = false
const onWrapDown = (e: MouseEvent) => {
  downInPanel = (e.target as HTMLElement).closest('.panel') != null
}

const onBlur = () => {
  if (!downInPanel) isOpen.value = false
  downInPanel = false
}
/* ===================== end===================== */

/* ===================== 搜索逻辑 ===================== */
const onSearch = () => {
  console.log('触发搜索', keyword.value)
}

// 搜索防抖
let timer: ReturnType<typeof setTimeout> | null = null
let mute = false
watch(keyword, () => {
  if (mute) return (mute = false)
  if (timer !== null) clearTimeout(timer)
  timer = setTimeout(onSearch, 1500)
})
/* ===================== end===================== */

/* ===================== 类型筛选 ===================== */
const typeList = ref([
  { id: 1, name: 'Casino' },
  { id: 2, name: 'Sports' },
  { id: 3, name: 'Lottery' }
]) // 类型列表
const currentType = ref(typeList.value[0]) // 当前选中的类型
const typeVisible = ref(false) // 类型弹窗显示隐藏

const emit = defineEmits<{
  'change-type': [id: number]
}>()

type TypeItem = { id: number; name: string }

// 类型选择确认
const handleTypeConfirm = (_val: TypeItem) => {
  currentType.value = _val
  console.log('-------', _val)
  typeVisible.value = false
  emit('change-type', _val.id)
}
/* ===================== end===================== */

/* ===================== 搜索历史 ===================== */
// 删除单条本地搜索记录
const deleteItme = () => {
  console.log('删除单条')
}

// 点击搜索历史和建议
const goSearch = (item: string) => {
  mute = true
  if (timer !== null) clearTimeout(timer)
  keyword.value = item
  isOpen.value = false
  onSearch()
}
/* ===================== end===================== */

// 清空输入框
const clear = () => {
  keyword.value = ''
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped lang="scss">
.desktop-type-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 288px;
}
</style>
