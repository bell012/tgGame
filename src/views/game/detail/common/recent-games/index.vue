<template>
  <div
    class="recent-games-container w-full h-full p-[12px] bg-[var(--color-background-level-2)] rounded-[10px] mt-[12px]"
  >
    <top-toggle />
    <transition name="open-fade">
      <div v-if="isOpen">
        <!-- 面板信息 -->
        <rginfo />
        <!-- tab111 -->
        <div
          class="recent-games-tabs flex h-[50px] justify-between items-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[20px] p-[4px] max-w-[500px]"
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
        <winlist
          v-if="tabValue === 1 || tabValue === 2"
          :list="rankList"
          :loading="isRankLoading"
        />
        <review v-if="tabValue === 3" />
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
} | null

const tabValue = ref(1)
const isOpen = ref(false)
provide('isRgOpen', isOpen)

const rankList = ref<GameRanListItem[]>([])
const isRankLoading = ref(false)
const { t } = useI18n()

const tabList = computed(() => [
  { value: 1, label: t('gameDetail.highWin') },
  { value: 2, label: t('gameDetail.luckyWin') },
  { value: 3, label: t('gameDetail.review') }
])

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const localeStore = useLocaleStore()
const themeStore = useThemeStore()
const { actualCurrency } = storeToRefs(localeStore)
const isLightTheme = computed(() => themeStore.theme === 'light')

const normalizeValue = (value: unknown) => String(value ?? '').trim()

const currentItemCode = computed(() => normalizeValue(currentGameDetail.value?.itemCode))
const currentPlatformCode = computed(() => normalizeValue(currentGameDetail.value?.platformCode))
const currentRequestCurrency = computed(
  () => normalizeValue(actualCurrency.value).toUpperCase() || 'USD'
)

const currentType = computed<1 | 2 | 0>(() => {
  if (tabValue.value === 1) return 1
  if (tabValue.value === 2) return 2
  return 0
})

const fetchGameRanList = async () => {
  const type = currentType.value
  const itemCode = currentItemCode.value
  const platformCode = currentPlatformCode.value
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
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )
    const rawResult = res?.result
    const records = (rawResult as { records?: unknown } | undefined)?.records
    rankList.value = Array.isArray(rawResult)
      ? (rawResult as GameRanListItem[])
      : Array.isArray(records)
        ? (records as GameRanListItem[])
        : []
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
    if (!isOpen.value) {
      return
    }
    void fetchGameRanList()
  },
  { immediate: true }
)

const tabIndexClick = (index: number) => {
  tabValue.value = index
}
</script>

<style scoped lang="scss">
:global(:root.light) .recent-games-container {
  background: #f4f4f4;
  border: none;
}

.active {
  background-color: var(--color-input-level-2);
  height: 100%;
  border-radius: 10px;
}

.recent-games-tab {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.recent-games-tabs-light {
  background: #e3e3e3 !important;
  border: none;
}

.recent-games-tabs-light .recent-games-tab.active {
  background: #ffffff;
  border: 1px solid rgba(17, 17, 17, 0.08);
  box-shadow: none;
  color: #111111;
}

.recent-games-tabs-light .recent-games-tab:not(.active) {
  color: #5f6368;
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
