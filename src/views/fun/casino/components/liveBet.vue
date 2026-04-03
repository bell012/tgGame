<template>
  <div
    class="relative w-full h-[430px] overflow-hidden rounded-xl bg-[var(--color-background-level-2)]"
  >
    <table class="w-full h-full text-sm text-text-2 text-[14px]">
      <thead class="bg-[var(--color-opacity-6)] text-[12px]">
        <tr>
          <td class="py-[10px] px-3">{{ $t('home.Game') }}</td>
          <td class="py-[10px] px-3">{{ $t('home.Player') }}</td>
          <td class="py-[10px] px-3 text-center">{{ $t('home.Multiplier') }}</td>
          <td class="py-[10px] px-3 text-right">{{ $t('home.Profit') }}</td>
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
      <TransitionGroup v-else tag="tbody" name="live">
        <tr
          v-for="(item, index) in rows"
          :key="item.id"
          :class="[
            index % 2 === 0 ? 'bg-[var(--color-opacity-10)]' : 'bg-[var(--color-opacity-6)]'
          ]"
        >
          <td class="py-2 px-3 flex items-center gap-1">
            <img :src="item.gameIcon" class="w-3.5 h-3.5" :alt="item.game" />
            <span class="text-text-1 truncate max-w-[58px]">
              {{ item.game }}
            </span>
          </td>
          <td class="py-2 px-3 text-text-1 truncate max-w-[60px]">
            {{ item.player }}
          </td>
          <td class="py-2 px-3 text-center text-[12px]">x{{ item.multiplier }}</td>
          <td class="py-2 px-3 flex items-center justify-end gap-1 text-[12px]">
            <span :class="item.profit >= 0 ? 'text-[var(--color-secondary-level-4)]' : ''">
              {{ item.profit >= 0 ? '+' : '' }}{{ item.profit }}
            </span>
            <img :src="currencyIcon" class="w-3 h-3" :alt="item.game" />
          </td>
        </tr>
      </TransitionGroup>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Api from '@/api'
import { useLocaleStore } from '@/stores/locale'
import placeholderImg from '@/static/img/home/errImg.png'
import { getCurrencyIconByCode } from '@/views/game/detail/common/currency-select-options'

interface LiveBetRow {
  id: number
  game: string
  gameIcon: string
  player: string
  multiplier: number
  profit: number
}

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
const loading = ref(false)
const currencyIcon = computed(() => getCurrencyIconByCode(currentCurrency.value))

const toGameImageUrl = (value?: string) => {
  if (!value) {
    return ''
  }

  return `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${value}`
}

const getRecentBigWinsData = async () => {
  loading.value = true

  try {
    const res = await Api.home.getRecentBigWins({
      currency: currentCurrency.value,
      type: props.type
    })

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

watch(
  [() => props.type, () => currentCurrency.value],
  () => {
    void getRecentBigWinsData()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.live-enter-active,
.live-leave-active {
  transition: all 0.15s ease;
}

.live-enter-from {
  opacity: 0;
  transform: translateY(-1px);
}

.live-leave-to {
  opacity: 0;
  transform: translateY(1px);
}
</style>
