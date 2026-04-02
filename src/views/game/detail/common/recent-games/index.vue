<template>
  <div
    class="recent-games-container w-full h-full p-[12px] bg-[var(--color-background-level-3)] rounded-[10px] mt-[12px]"
  >
    <top-toggle />
    <transition name="open-fade">
      <div v-if="isOpen">
        <!-- 面板信息 -->
        <rginfo />
        <!-- tab111 -->
        <div
          class="flex h-[50px] justify-between items-center bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[20px] p-[4px] max-w-[500px]"
        >
          <div
            v-for="tab in tabList"
            :key="tab.value"
            class="flex-1 flex items-center justify-center cursor-pointer"
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
import { storeToRefs } from 'pinia'
import { computed, inject, provide, ref, watch, type ComputedRef } from 'vue'
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

const tabList = ref([
  { value: 1, label: 'High win' },
  { value: 2, label: 'Lucky win' },
  { value: 3, label: 'Review' }
])

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const localeStore = useLocaleStore()
const { actualCurrency } = storeToRefs(localeStore)

const normalizeValue = (value: unknown) => String(value ?? '').trim()

const currentItemCode = computed(() => normalizeValue(currentGameDetail.value?.itemCode))
const currentPlatformCode = computed(() => normalizeValue(currentGameDetail.value?.platformCode))

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
    const res = await Api.game.getGameRanList({
      itemCode,
      platformCode,
      type,
      currency: 'PHP'
    })
    console.log(res, 'res...')
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
  [tabValue, isOpen, currentItemCode, currentPlatformCode, actualCurrency],
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
.active {
  background-color: var(--color-input-level-2);
  height: 100%;
  border-radius: 10px;
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
