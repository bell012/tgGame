<template>
  <div
    class="relative w-full h-[430px] overflow-hidden rounded-xl bg-[var(--color-background-level-2)]"
  >
    <table class="h-full w-full table-fixed text-sm text-[14px] text-text-2">
      <thead class="bg-[var(--color-opacity-6)] text-[12px]">
        <tr>
          <td class="w-[36%] px-3 py-[10px]">{{ $t('home.Game') }}</td>
          <td class="w-[26%] px-3 py-[10px]">{{ $t('home.Player') }}</td>
          <td class="w-[16%] px-3 py-[10px] text-center">{{ $t('home.Multiplier') }}</td>
          <td class="w-[22%] px-3 py-[10px] text-right">{{ $t('home.Profit') }}</td>
        </tr>
      </thead>
      <tbody v-if="loading">
        <tr
          v-for="index in 10"
          :key="index"
          :class="index % 2 === 0 ? 'bg-[var(--color-opacity-10)]' : 'bg-[var(--color-opacity-6)]'"
        >
          <td colspan="4" class="px-3 py-2">
            <div class="h-8 animate-pulse rounded bg-bg-3" />
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="displayRows.length > 0">
        <tr
          v-for="(item, index) in displayRows"
          :key="`row-${index}`"
          :class="[
            index % 2 === 0 ? 'bg-[var(--color-opacity-10)]' : 'bg-[var(--color-opacity-6)]'
          ]"
        >
          <td class="px-3 py-2">
            <div :key="item.id" class="flex min-w-0 items-center gap-1">
              <div class="h-3.5 w-3.5 shrink-0">
                <gameRemoteImg
                  class="!rounded-none !bg-transparent"
                  :img="{ src: item.gameIcon, maintain: false, fit: 'contain' }"
                  :alt="item.game"
                />
              </div>
              <span class="min-w-0 truncate text-text-1">
                {{ item.game }}
              </span>
            </div>
          </td>
          <td class="px-3 py-2">
            <span class="block truncate text-text-1">
              {{ item.player }}
            </span>
          </td>
          <td class="py-2 px-3 text-center text-[12px]">x{{ item.multiplier }}</td>
          <td class="px-3 py-2 text-[12px]">
            <div class="flex items-center justify-end gap-1">
              <span :class="item.profit >= 0 ? 'text-secondary-4' : 'text-text-2'">
                {{ item.profit >= 0 ? '+' : '' }}{{ item.profit }}
              </span>
              <img :src="item.currencyIcon" class="w-3 h-3" :alt="item.currency" />
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="4" class="px-3 py-6">
            <ThemedEmptyState
              :dark-image="defaultImgDark"
              :light-image="defaultImgLight"
              :image-alt="$t('gameDetail.noData')"
              :message="$t('gameDetail.noData')"
              container-class="mt-0"
              image-class="h-[96px] w-auto object-contain mx-auto"
              text-class="mt-2 text-center text-[12px] font-[500] leading-[18px] text-text-2"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import Api from '@/api'
import type { LatestListItem } from '@/api/interface/game'
import placeholderImg from '@/static/img/home/errImg.png'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { getCurrencyImageByCode, getCurrentCurrency } from '@/utils/locale'
import { useLocaleStore } from '@/stores/locale'
import { storeToRefs } from 'pinia'

interface LiveBetRow {
  id: number
  game: string
  gameIcon: string
  player: string
  multiplier: number
  profit: number
  currency: string
  currencyIcon: string
}

const MAX_VISIBLE_ROWS = 10
const LATEST_LIST_REFRESH_INTERVAL_MS = 5 * 60 * 1000

const props = withDefaults(
  defineProps<{
    type?: 1 | 2
  }>(),
  {
    type: 1
  }
)

const localeStore = useLocaleStore()
const { currentCurrency } = storeToRefs(localeStore)

const sourceRows = ref<LiveBetRow[]>([])
const displayRows = ref<LiveBetRow[]>([])
const loading = ref(false)
let autoScrollTimer: number | null = null
let latestListRefreshTimer: number | null = null
let nextScrollIndex = 0

const getRandomScrollInterval = () => {
  return Math.floor(Math.random() * 800) + 300
}

const toGameImageUrl = (value?: string) => {
  if (!value) {
    return ''
  }

  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

const getLatestListData = async () => {
  loading.value = true

  try {
    const res = await Api.game.getLatestList({
      type: props.type,
      currency: getCurrentCurrency()
    })

    sourceRows.value = (res?.result ?? []).map((item: LatestListItem, index: number) => {
      const currency = String(item.currency ?? '').trim()

      return {
        id: Number(item.rowId ?? index),
        game: String(item.gameName ?? '--'),
        gameIcon: toGameImageUrl(item.coverImg ?? ''),
        player: String(item.nickName ?? '--'),
        multiplier: Number(item.multiple ?? 0),
        profit: Number(item.winAmount ?? 0),
        currency,
        currencyIcon: getCurrencyImageByCode(currency)
      }
    })
  } catch (error) {
    sourceRows.value = []
    console.error('getLatestList failed', error)
  } finally {
    loading.value = false
  }
}

const stopLatestListRefresh = () => {
  if (latestListRefreshTimer) {
    window.clearInterval(latestListRefreshTimer)
    latestListRefreshTimer = null
  }
}

const startLatestListRefresh = () => {
  stopLatestListRefresh()
  void getLatestListData()

  latestListRefreshTimer = window.setInterval(() => {
    void getLatestListData()
  }, LATEST_LIST_REFRESH_INTERVAL_MS)
}

const rows = computed<LiveBetRow[]>(() => {
  return sourceRows.value.map(item => ({
    ...item,
    gameIcon: item.gameIcon || placeholderImg
  }))
})

const stopAutoScroll = () => {
  if (autoScrollTimer) {
    window.clearTimeout(autoScrollTimer)
    autoScrollTimer = null
  }
}

const scheduleNextScroll = () => {
  autoScrollTimer = window.setTimeout(() => {
    const nextRow = rows.value[nextScrollIndex]

    if (!nextRow) {
      return
    }

    displayRows.value = [nextRow, ...displayRows.value.slice(0, MAX_VISIBLE_ROWS - 1)]
    nextScrollIndex = (nextScrollIndex + 1) % rows.value.length
    scheduleNextScroll()
  }, getRandomScrollInterval())
}

const startAutoScroll = () => {
  stopAutoScroll()

  if (rows.value.length <= MAX_VISIBLE_ROWS) {
    displayRows.value = [...rows.value]
    return
  }

  displayRows.value = rows.value.slice(0, MAX_VISIBLE_ROWS)
  nextScrollIndex = MAX_VISIBLE_ROWS % rows.value.length
  scheduleNextScroll()
}

watch(
  [() => props.type, currentCurrency],
  () => {
    startLatestListRefresh()
  },
  { immediate: true }
)

watch(
  rows,
  () => {
    startAutoScroll()
  },
  { immediate: true }
)

onUnmounted(() => {
  stopAutoScroll()
  stopLatestListRefresh()
})
</script>

<style scoped lang="scss"></style>
