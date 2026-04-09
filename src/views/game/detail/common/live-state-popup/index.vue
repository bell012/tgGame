<template>
  <div>
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9999] inset-0"
        :class="maskClass"
        @click.self="close"
      />
    </transition>
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div
          class="tp-panel bg-[var(--color-background-level-2)] rounded-t-xl pt-2.5 px-3.5"
          :class="panelClass"
        >
          <div v-if="!desktop" class="tp-header flex items-center justify-between mb-2.5">
            <div></div>
            <div class="text-base font-bold text-[var(--color-text-level-1)]">
              {{ t('gameDetail.liveStatsTitle') }}
            </div>
            <div
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
              @click="close"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </div>
          </div>
          <div
            class="bg-[var(--color-background-level-3)] rounded-[10px] py-[12px] px-[8px] mb-[12px]"
          >
            <div class="flex justify-between border-b border-[var(--color-opacity-30)] pb-[12px]">
              <div>{{ t('gameDetail.bet') }}</div>
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
                <div class="text-[14px] text-[var(--color-text-level-2)]">
                  {{ t('gameDetail.profit') }}
                </div>
                <div class="flex items-center gap-[8px]">
                  <img
                    class="w-[20px] h-[20px] min-w-[20px] object-contain"
                    :alt="currentRequestCurrency"
                    :src="currentCurrencyIcon"
                  />
                  <div class="text-[var(--color-theme-level-1)] text-[15px]">{{ profitText }}</div>
                </div>

                <div class="text-[14px] text-[var(--color-text-level-2)] mt-[20px]">
                  {{ t('gameDetail.wagered') }}
                </div>
                <div class="flex items-center gap-[8px]">
                  <img
                    class="w-[20px] h-[20px] min-w-[20px] object-contain"
                    :alt="currentRequestCurrency"
                    :src="currentCurrencyIcon"
                  />
                  <div class="text-[var(--color-theme-level-1)] text-[15px]">{{ wageredText }}</div>
                </div>
              </div>
              <div class="flex-1 pl-[12px]">
                <div class="text-[14px] text-[var(--color-text-level-2)]">
                  {{ t('gameDetail.win') }}
                </div>
                <div class="flex items-center gap-[8px]">
                  <div class="text-[15px]">{{ winCount }}</div>
                </div>
                <div class="text-[14px] text-[var(--color-text-level-2)] mt-[20px]">
                  {{ t('gameDetail.lose') }}
                </div>
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
import { getCurrencyIconByCode } from '../currency-select-options'
import { storeToRefs } from 'pinia'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    visible: boolean
    desktop?: boolean
    maskClass?: string
    panelClass?: string
  }>(),
  {
    desktop: false,
    maskClass: 'bg-mask-60-1',
    panelClass: 'tp-panel-h5'
  }
)

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
const { t } = useI18n()

const normalizeValue = (value: unknown) => String(value ?? '').trim()

const currentItemCode = computed(() => normalizeValue(currentGameDetail.value?.itemCode))
const currentPlatformCode = computed(() => normalizeValue(currentGameDetail.value?.platformCode))
const currentRequestCurrency = computed(
  () => normalizeValue(actualCurrency.value).toUpperCase() || 'USD'
)
const currentCurrencyIcon = computed(() => getCurrencyIconByCode(currentRequestCurrency.value))

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

const close = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.tp-panel {
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}

.tp-panel-h5 {
  border-radius: 10px 10px 0 0;
}

.tp-panel-desktop {
  border-radius: 10px;
}

@include popup-transition;

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
