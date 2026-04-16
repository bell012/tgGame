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
      <tbody v-else>
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
              <span :class="item.profit >= 0 ? 'text-[var(--color-secondary-level-4)]' : ''">
                {{ item.profit >= 0 ? '+' : '' }}{{ item.profit }}
              </span>
              <img :src="currencyIcon" class="w-3 h-3" :alt="item.game" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import Api from '@/api'
import placeholderImg from '@/static/img/home/errImg.png'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import { getCurrencyIconByCode } from '@/components/common/currency-selector/currency-select-options'
import { getCurrentCurrency } from '@/utils/locale'

interface LiveBetRow {
  id: number
  game: string
  gameIcon: string
  player: string
  multiplier: number
  profit: number
}

const MAX_VISIBLE_ROWS = 10

const props = withDefaults(
  defineProps<{
    type?: 1 | 2
  }>(),
  {
    type: 1
  }
)

const sourceRows = ref<LiveBetRow[]>([])
const displayRows = ref<LiveBetRow[]>([])
const loading = ref(false)
const currentCurrency = computed(() => getCurrentCurrency())
const currencyIcon = computed(() => getCurrencyIconByCode(currentCurrency.value))
let autoScrollTimer: number | null = null
let nextScrollIndex = 0

const getRandomScrollInterval = () => {
  return Math.floor(Math.random() * 701) + 300
}

const toGameImageUrl = (value?: string) => {
  if (!value) {
    return ''
  }

  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

const getRecentBigWinsData = async () => {
  loading.value = true

  try {
    const res = await Api.home.getRecentBigWins(
      {
        currency: currentCurrency.value,
        type: props.type
      },
      {
        showSuccessToast: false
      }
    )

    sourceRows.value = (res?.result ?? []).map((item: any, index: number) => ({
      id: Number(item.rowId ?? index),
      game: String(item.gameName ?? '--'),
      gameIcon: toGameImageUrl(item.coverImg ?? ''),
      player: String(item.nickName ?? '--'),
      multiplier: Number(item.multiple ?? 0),
      profit: Number(item.winAmount ?? 0)
    }))
  } catch (error) {
    sourceRows.value = []
    console.error('getRecentBigWins failed', error)
  } finally {
    loading.value = false
  }
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
  [() => props.type, () => currentCurrency.value],
  () => {
    void getRecentBigWinsData()
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
})
</script>

<style scoped lang="scss"></style>
