<template>
  <div
    class="recent-games-container w-full p-[12px] bg-[var(--color-background-level-2)] rounded-[10px] mt-[14px]"
  >
    <!-- Tab -->
    <div
      class="recent-games-tabs flex h-[42px] justify-between items-center mb-[10px] p-[4px] max-w-[500px]"
      :class="[
        { 'recent-games-tabs-light': isLightTheme, 'recent-games-tabs-mobile': isMobile },
        isMobile ? 'rounded-[7px]' : PC_SEGMENTED_TABS_CLASS
      ]"
    >
      <div
        v-for="tab in tabList"
        :key="tab.value"
        class="recent-games-tab flex-1 flex items-center justify-center cursor-pointer"
        :class="[
          { active: tabValue === tab.value },
          isMobile
            ? ''
            : [PC_SEGMENTED_TAB_CLASS, getPcSegmentedTabStateClass(tabValue === tab.value)]
        ]"
        @click="tabIndexClick(tab.value)"
      >
        {{ tab.label }}
      </div>
    </div>
    <!-- 内容：KeepAlive 保持挂载，避免切换 tab 时重复加载 -->
    <div class="recent-games-tab-content filter-slide-stage">
      <Transition :name="slideName">
        <KeepAlive>
          <Winlist
            v-if="tabValue === TAB_HIGH_WIN"
            key="high-win"
            class="filter-slide-pane w-full"
            :list="rankListByType[TAB_HIGH_WIN] ?? []"
            :loading="isRankLoading && tabValue === TAB_HIGH_WIN"
          />
          <Winlist
            v-else-if="tabValue === TAB_LUCKY_WIN"
            key="lucky-win"
            class="filter-slide-pane w-full"
            :list="rankListByType[TAB_LUCKY_WIN] ?? []"
            :loading="isRankLoading && tabValue === TAB_LUCKY_WIN"
          />
          <Review v-else key="review" class="filter-slide-pane w-full" />
        </KeepAlive>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PC_SEGMENTED_TABS_CLASS,
  PC_SEGMENTED_TAB_CLASS,
  getPcSegmentedTabStateClass
} from '@/components/common/pcSegmentedTabs'
import { useIsMobile } from '@/composables/useMediaQuery'

import '@/views/game/detail/styles/colors.css'
import Api from '@/api'
import type { GameRanListItem } from '@/api/interface/game'
import { useLocaleStore } from '@/stores/locale'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import Winlist from './winlist.vue'
import Review from './review/index.vue'

const isMobile = useIsMobile()

type CurrentGameDetail = {
  itemCode?: string | number
  platformCode?: string
  gameTypeCode?: string
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

const tabValue = ref<TabValue>(TAB_HIGH_WIN)
const TAB_ORDER: TabValue[] = [TAB_HIGH_WIN, TAB_LUCKY_WIN, TAB_REVIEW]
const slideName = ref<'filter-slide-left' | 'filter-slide-right'>('filter-slide-left')

// 排行榜数据状态（按 tab 类型缓存，切换时不展示 loading）
const rankListByType = ref<Partial<Record<1 | 2, GameRanListItem[]>>>({})
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

// 当前游戏请求参数
const currentItemCode = computed(() => normalizeValue(currentGameDetail.value?.itemCode))
const currentPlatformCode = computed(() => normalizeValue(currentGameDetail.value?.platformCode))
const currentRequestCurrency = computed(
  () => normalizeValue(actualCurrency.value).toUpperCase() || 'USD'
)

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
  if (!type || !itemCode || !platformCode) {
    return
  }

  const hasCachedData = (rankListByType.value[type]?.length ?? 0) > 0
  if (!hasCachedData) {
    isRankLoading.value = true
  }

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
    rankListByType.value[type] = parseRankListResult(res?.result)
  } catch (error) {
    console.error('fetchGameRanList failed', error)
    rankListByType.value[type] = []
  } finally {
    isRankLoading.value = false
  }
}

watch([currentItemCode, currentPlatformCode, currentRequestCurrency], () => {
  rankListByType.value = {}
})

watch(
  [tabValue, currentItemCode, currentPlatformCode, currentRequestCurrency],
  () => {
    void fetchGameRanList()
  },
  { immediate: true }
)

const tabIndexClick = (next: TabValue) => {
  if (next === tabValue.value) return
  slideName.value =
    TAB_ORDER.indexOf(next) > TAB_ORDER.indexOf(tabValue.value)
      ? 'filter-slide-left'
      : 'filter-slide-right'
  tabValue.value = next
}
</script>

<style scoped lang="scss">
.recent-games-container {
  background: var(--color-background-level-2);
}

.recent-games-tab {
  height: 100%;
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
  font-size: 14px;
  font-weight: 800;
}

.recent-games-tabs-mobile {
  background: var(--color-recent-games-panel);
}

.recent-games-tabs-mobile.recent-games-tabs-light {
  background: var(--color-recent-games-panel) !important;
  border: none;
}

.recent-games-tabs-light .recent-games-tab.active {
  border: none;
  box-shadow: none;
  font-size: 14px;
  font-weight: 800;
}

.recent-games-tabs-mobile.recent-games-tabs-light .recent-games-tab:not(.active) {
  color: var(--color-recent-games-tab-idle);
}

.recent-games-tabs-mobile .recent-games-tab {
  border-radius: 6px;
  color: var(--color-text-level-2);
}

.recent-games-tabs-mobile .recent-games-tab.active {
  background: var(--color-recent-games-tab-active);
  color: var(--color-text-level-1);
}

.recent-games-tab-content {
  position: relative;
  min-height: 220px;
}

.recent-games-tab-content > :not([style*='display: none']) {
  width: 100%;
}
</style>
