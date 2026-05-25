<template>
  <div
    class="recent-games-container w-full p-[12px] bg-[var(--color-background-level-2)] rounded-[10px] mt-[14px]"
  >
    <!-- 顶部开关 -->
    <TopToggle />
    <transition name="open-fade">
      <div v-if="isOpen">
        <div class="recent-games-type-tag"># {{ gameTypeName }}</div>
        <!-- 面板信息 -->
        <Rginfo />
        <!-- Tab -->
        <div
          class="recent-games-tabs flex h-[42px] justify-between items-center rounded-[7px] mb-[10px] mt-[20px] p-[4px] max-w-[500px]"
          :class="{ 'recent-games-tabs-light': isLightTheme }"
        >
          <div
            v-for="tab in tabList"
            :key="tab.value"
            class="recent-games-tab flex-1 flex items-center justify-center cursor-pointer"
            :class="{ active: tabValue === tab.value }"
            @click="tabIndexClick(tab.value)"
          >
            {{ tab.label }}
          </div>
        </div>
        <!-- 内容 -->
        <template v-if="shouldShowRankList">
          <Winlist :list="rankList" :loading="isRankLoading" />
        </template>
        <!-- 仅在“Review”标签下展示评论面板 -->
        <Review v-else-if="shouldShowReviewTab" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { GameRanListItem } from '@/api/interface/game'
import { useLocaleStore } from '@/stores/locale'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { computed, inject, provide, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import TopToggle from './top-toggle.vue'
import Winlist from './winlist.vue'
import Rginfo from './rginfo.vue'
import Review from './review/index.vue'

type CurrentGameDetail = {
  itemCode?: string | number
  platformCode?: string
  sysGameTypeName?: string
} | null

type TabValue = 1 | 2 | 3

// Tab 常量，避免模板和逻辑里出现魔法数字
const TAB_HIGH_WIN: TabValue = 1
const TAB_LUCKY_WIN: TabValue = 2
const TAB_REVIEW: TabValue = 3

// 排行榜接口仅支持 1/2 两种类型，其他场景传 0（不请求）
const RANK_TYPE_NONE = 0
const REQUEST_OPTIONS = {
  showSuccessToast: false,
  showErrorToast: true
} as const

// 展开/收起状态通过 provide 共享给子组件
const tabValue = ref<TabValue>(TAB_HIGH_WIN)
const isOpen = ref(false)
provide('isRgOpen', isOpen)

// 排行榜数据状态
const rankList = ref<GameRanListItem[]>([])
const isRankLoading = ref(false)
const { t } = useI18n()

// Tab 文案列表（国际化）
const tabList = computed(() => [
  { value: TAB_HIGH_WIN, label: t('gameDetail.highWin') },
  { value: TAB_LUCKY_WIN, label: t('gameDetail.luckyWin') },
  { value: TAB_REVIEW, label: t('gameDetail.review') }
])

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const localeStore = useLocaleStore()
const themeStore = useThemeStore()
const { actualCurrency } = storeToRefs(localeStore)
const isLightTheme = computed(() => themeStore.theme === 'light')

// 统一做字符串标准化，避免 undefined/null 造成请求参数异常
const normalizeValue = (value: unknown) => String(value ?? '').trim()

const gameTypeName = computed(() => {
  return normalizeValue(currentGameDetail.value?.sysGameTypeName) || t('home.Slots')
})

// 当前游戏请求参数
const currentItemCode = computed(() => normalizeValue(currentGameDetail.value?.itemCode))
const currentPlatformCode = computed(() => normalizeValue(currentGameDetail.value?.platformCode))
const currentRequestCurrency = computed(
  () => normalizeValue(actualCurrency.value).toUpperCase() || 'USD'
)

// 模板展示条件
const shouldShowRankList = computed(
  () => tabValue.value === TAB_HIGH_WIN || tabValue.value === TAB_LUCKY_WIN
)
const shouldShowReviewTab = computed(() => tabValue.value === TAB_REVIEW)

// 将 Tab 映射为排行榜接口 type
const currentType = computed<1 | 2 | 0>(() => {
  if (tabValue.value === TAB_HIGH_WIN) return TAB_HIGH_WIN
  if (tabValue.value === TAB_LUCKY_WIN) return TAB_LUCKY_WIN
  return RANK_TYPE_NONE
})

// 接口可能返回数组或 { records }，统一兜底成数组
const parseRankListResult = (result: unknown): GameRanListItem[] => {
  const records = (result as { records?: unknown } | undefined)?.records

  if (Array.isArray(result)) {
    return result as GameRanListItem[]
  }
  if (Array.isArray(records)) {
    return records as GameRanListItem[]
  }
  return []
}

const fetchGameRanList = async () => {
  const type = currentType.value
  const itemCode = currentItemCode.value
  const platformCode = currentPlatformCode.value
  // 参数不完整时不发请求，直接清空旧数据
  if (!type || !itemCode || !platformCode) {
    rankList.value = []
    return
  }

  isRankLoading.value = true
  try {
    const res = await Api.game.getGameRanList(
      {
        itemCode,
        platformCode,
        type,
        currency: currentRequestCurrency.value
      },
      REQUEST_OPTIONS
    )
    rankList.value = parseRankListResult(res?.result)
  } catch (error) {
    console.error('fetchGameRanList failed', error)
    rankList.value = []
  } finally {
    isRankLoading.value = false
  }
}

watch(
  [tabValue, isOpen, currentItemCode, currentPlatformCode, currentRequestCurrency],
  () => {
    // 面板关闭时不触发排行榜请求
    if (!isOpen.value) {
      return
    }
    void fetchGameRanList()
  },
  { immediate: true }
)

const tabIndexClick = (index: number) => {
  tabValue.value = index as TabValue
}
</script>

<style scoped lang="scss">
.recent-games-container {
  background: var(--color-background-level-2);
}

:global(:root.light .recent-games-container) {
  border: none;
}

.recent-games-tab {
  height: 100%;
  border-radius: 6px;
  color: var(--color-text-level-2);
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    font-size 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.recent-games-tab.active {
  background-color: #3c4243;
  color: var(--color-text-level-1);
  font-size: 14px;
  font-weight: 800;
}

.recent-games-tabs {
  background: #202424;
}

.recent-games-tabs-light {
  background: #f4f4f4 !important;
  border: none;
}

.recent-games-tabs-light .recent-games-tab.active {
  background: #ffffff;
  border: none;
  box-shadow: none;
  color: var(--color-text-level-1);
  font-size: 14px;
  font-weight: 800;
}

.recent-games-tabs-light .recent-games-tab:not(.active) {
  color: #5f6368;
}

.recent-games-type-tag {
  display: inline-flex;
  align-items: center;
  margin-top: 8px;
  border-radius: 6px;
  background: var(--color-opacity-10);
  height: 22px;
  padding: 0 8px;
  color: var(--color-text-level-2);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

.open-fade-enter-active,
.open-fade-leave-active {
  transition: all 0.2s ease;
}
.open-fade-enter-from,
.open-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
