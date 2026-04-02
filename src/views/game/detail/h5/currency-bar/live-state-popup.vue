<template>
  <div>
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9999] inset-0 bg-mask-60-1"
        @click.self="close"
      />
    </transition>
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div class="tp-panel bg-[var(--color-background-level-2)] rounded-t-xl pt-2.5 px-3.5">
          <div class="tp-header flex items-center justify-between mb-2.5" v-if="!desktop">
            <div></div>
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Live Stats</div>
            <div
              @click="close"
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </div>
          </div>
          <div
            class="bg-[var(--color-background-level-3)] rounded-[10px] py-[12px] px-[8px] mb-[12px]"
          >
            <div class="flex justify-between border-b border-[var(--color-opacity-30)] pb-[12px]">
              <div>Bet</div>
              <RefreshIcon
                class="size-[20px] cursor-pointer"
                :class="{ 'animate-spin': isLoading }"
                @click="handleRefreshGameStatistics"
              />
            </div>
            <div
              class="flex bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] mt-[12px] p-[12px]"
            >
              <div class="flex-1 border-r border-[var(--color-opacity-30)]">
                <div class="text-[14px] text-[var(--color-text-level-2)]">Profit</div>
                <div class="flex items-center gap-[8px]">
                  <section class="relative w-[20px] h-[20px] overflow-hidden">
                    <img
                      class="w-[20px] min-w-[20px] absolute"
                      alt="countries"
                      src="@/static/img/explore/countries.png"
                      :style="`top: -20px`"
                    />
                  </section>
                  <div class="text-[var(--color-theme-level-1)] text-[15px]">{{ profitText }}</div>
                </div>

                <div class="text-[14px] text-[var(--color-text-level-2)] mt-[20px]">Wagered</div>
                <div class="flex items-center gap-[8px]">
                  <section class="relative w-[20px] h-[20px] overflow-hidden">
                    <img
                      class="w-[20px] min-w-[20px] absolute"
                      alt="countries"
                      src="@/static/img/explore/countries.png"
                      :style="`top: -20px`"
                    />
                  </section>
                  <div class="text-[var(--color-theme-level-1)] text-[15px]">{{ wageredText }}</div>
                </div>
              </div>
              <div class="flex-1 pl-[12px]">
                <div class="text-[14px] text-[var(--color-text-level-2)]">WIN</div>
                <div class="flex items-center gap-[8px]">
                  <div class="text-[15px]">{{ winCount }}</div>
                </div>
                <div class="text-[14px] text-[var(--color-text-level-2)] mt-[20px]">LOSE</div>
                <div class="flex items-center gap-[8px]">
                  <div class="text-[15px]">{{ loseCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import type { GameStatisticsResult } from '@/api/interface/game'
import { useLocaleStore } from '@/stores/locale'
import CloseIcon from '@/static/svg/close.svg?component'
import RefreshIcon from '@/static/svg/game/detail/refresh.svg?component'
import { getCurrencySymbol } from '@/utils/locale'
import { storeToRefs } from 'pinia'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'

const props = defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()

type CurrentGameDetail = {
  itemCode?: string | number
  platformCode?: string
} | null

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const localeStore = useLocaleStore()
const { actualCurrency } = storeToRefs(localeStore)

const normalizeValue = (value: unknown) => String(value ?? '').trim()

const currentItemCode = computed(() => normalizeValue(currentGameDetail.value?.itemCode))
const currentPlatformCode = computed(() => normalizeValue(currentGameDetail.value?.platformCode))

const emptyStatistics = (): GameStatisticsResult => ({
  profit: 0,
  wagered: 0,
  win: 0,
  lose: 0
})

const statistics = ref<GameStatisticsResult>(emptyStatistics())
const isLoading = ref(false)

const formatAmount = (value: unknown) => {
  const parsed = Number(normalizeValue(value))
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00'
}

const formatCount = (value: unknown) => {
  const parsed = Number(normalizeValue(value))
  if (!Number.isFinite(parsed)) {
    return 0
  }
  return Math.max(0, Math.trunc(parsed))
}

const profitText = computed(() => {
  return `${getCurrencySymbol(actualCurrency.value)}${formatAmount(statistics.value.profit)}`
})

const wageredText = computed(() => {
  return `${getCurrencySymbol(actualCurrency.value)}${formatAmount(statistics.value.wagered)}`
})

const winCount = computed(() => formatCount(statistics.value.win))
const loseCount = computed(() => formatCount(statistics.value.lose))

const fetchGameStatistics = async () => {
  const itemCode = currentItemCode.value
  const platformCode = currentPlatformCode.value
  if (!itemCode || !platformCode) {
    statistics.value = emptyStatistics()
    return
  }

  isLoading.value = true
  try {
    const res = await Api.game.getGameStatistics({
      itemCode,
      platformCode
    })

    const result = res?.result
    if (result && typeof result === 'object') {
      statistics.value = {
        profit: result.profit ?? 0,
        wagered: result.wagered ?? 0,
        win: result.win ?? 0,
        lose: result.lose ?? 0
      }
      return
    }
    statistics.value = emptyStatistics()
  } catch (error) {
    console.error('fetchGameStatistics failed', error)
    statistics.value = emptyStatistics()
  } finally {
    isLoading.value = false
  }
}

const refreshGameStatistics = async () => {
  const itemCode = currentItemCode.value
  const platformCode = currentPlatformCode.value
  if (!itemCode || !platformCode) {
    statistics.value = emptyStatistics()
    return
  }

  isLoading.value = true
  try {
    const res = await Api.game.refreshGameStatistics({
      itemCode,
      platformCode
    })

    const result = res?.result
    if (result && typeof result === 'object') {
      statistics.value = {
        profit: result.profit ?? 0,
        wagered: result.wagered ?? 0,
        win: result.win ?? 0,
        lose: result.lose ?? 0
      }
      return
    }
    statistics.value = emptyStatistics()
  } catch (error) {
    console.error('refreshGameStatistics failed', error)
    statistics.value = emptyStatistics()
  } finally {
    isLoading.value = false
  }
}

const handleRefreshGameStatistics = () => {
  void refreshGameStatistics()
}

watch(
  [() => props.visible, currentItemCode, currentPlatformCode, actualCurrency],
  () => {
    if (!props.visible) {
      return
    }
    void fetchGameStatistics()
  },
  { immediate: true }
)

// 关闭popup
const close = () => {
  emit('update:visible', false)
}
</script>
<style scoped lang="scss">
@use '@/styles/mixins' as *;
/* 面板 */
.tp-panel {
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  border-radius: 10px 10px 0 0;
}
@include popup-transition;
// 设置的弹窗打开关闭的过渡动画
.desktop-up-down-enter-active,
.desktop-up-down-leave-active {
  transition: all 0.2s ease;
}
.desktop-up-down-enter-from,
.desktop-up-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
