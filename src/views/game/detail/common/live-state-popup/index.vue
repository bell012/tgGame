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
          class="tp-panel tp-panel-surface rounded-t-xl pt-2.5 px-3.5"
          :class="panelClass"
          :style="h5PanelSurfaceStyle"
        >
          <div v-if="!desktop" class="tp-header flex items-center justify-between mb-2.5">
            <div></div>
            <div class="tp-popup-title text-base font-bold">
              {{ t('gameDetail.liveStatsTitle') }}
            </div>
            <div
              class="tp-close-btn w-7 h-7 rounded-[8px] flex items-center justify-center"
              @click="close"
            >
              <CloseIcon class="tp-close-icon w-4 h-4" />
            </div>
          </div>
          <div
            class="tp-stats-shell rounded-[10px] py-[12px] px-[8px] mb-[12px]"
            :style="h5StatsShellStyle"
          >
            <div class="tp-divider flex justify-between">
              <div class="tp-section-title">{{ t('gameDetail.bet') }}</div>
              <RefreshIcon
                class="tp-refresh-icon size-[20px] cursor-pointer"
                :class="{ 'animate-spin': isLoading }"
                @click="handleRefreshGameStatistics"
              />
            </div>
            <div class="tp-divider-line mt-[10px]" :style="h5DividerLineStyle" />
            <div
              class="tp-stats-grid flex rounded-[10px] mb-[10px] mt-[12px] p-[12px]"
              :style="h5StatsGridStyle"
            >
              <div class="tp-col-divider flex-1 border-r">
                <div class="tp-label text-[14px]">
                  {{ t('gameDetail.profit') }}
                </div>
                <div class="flex items-center gap-[8px]">
                  <SmartImage
                    class="w-[20px] h-[20px] min-w-[20px] object-contain"
                    :alt="currentRequestCurrency"
                    :src="currentCurrencyIcon"
                  />
                  <div class="text-[var(--color-theme-level-1)] text-[15px]">{{ profitText }}</div>
                </div>

                <div class="tp-label text-[14px] mt-[20px]">
                  {{ t('gameDetail.wagered') }}
                </div>
                <div class="flex items-center gap-[8px]">
                  <SmartImage
                    class="w-[20px] h-[20px] min-w-[20px] object-contain"
                    :alt="currentRequestCurrency"
                    :src="currentCurrencyIcon"
                  />
                  <div class="text-[var(--color-theme-level-1)] text-[15px]">{{ wageredText }}</div>
                </div>
              </div>
              <div class="flex-1 pl-[12px]">
                <div class="tp-label text-[14px]">
                  {{ t('gameDetail.win') }}
                </div>
                <div class="flex items-center gap-[8px]">
                  <div class="tp-value text-[15px]" :style="h5ValueStyle">{{ winCount }}</div>
                </div>
                <div class="tp-label text-[14px] mt-[20px]">
                  {{ t('gameDetail.lose') }}
                </div>
                <div class="flex items-center gap-[8px]">
                  <div class="tp-value text-[15px]" :style="h5ValueStyle">{{ loseCount }}</div>
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
import { useThemeStore } from '@/stores/theme'
import CloseIcon from '@/static/svg/close.svg?component'
import RefreshIcon from '@/static/svg/game/detail/refresh.svg?component'
import { getCurrencySymbol } from '@/utils/locale'
import { getCurrencyIconByCode } from '@/components/common/currency-selector/currency-select-options'
import { storeToRefs } from 'pinia'
import { computed, inject, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import SmartImage from '@/components/common/SmartImage.vue'

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
const themeStore = useThemeStore()
const { actualCurrency } = storeToRefs(localeStore)
const { theme } = storeToRefs(themeStore)
const { t } = useI18n()
const isLightTheme = computed(() => theme.value === 'light')

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

const h5PanelSurfaceStyle = computed((): Record<string, string> => {
  if (!isLightTheme.value || props.panelClass !== 'tp-panel-h5') {
    return {}
  }
  return {
    background: '#f4f4f4'
  }
})

const h5StatsShellStyle = computed((): Record<string, string> => {
  if (!isLightTheme.value || props.panelClass !== 'tp-panel-h5') {
    return {}
  }
  return {
    background: '#fff'
  }
})

const h5StatsGridStyle = computed((): Record<string, string> => {
  if (!isLightTheme.value || props.panelClass !== 'tp-panel-h5') {
    return {}
  }
  return {
    background: '#f0f0f0'
  }
})

const h5ValueStyle = computed((): Record<string, string> => {
  if (!isLightTheme.value || props.panelClass !== 'tp-panel-h5') {
    return {}
  }
  return {
    color: '#0f0f0f'
  }
})

const h5DividerLineStyle = computed((): Record<string, string> => {
  if (!isLightTheme.value || props.panelClass !== 'tp-panel-h5') {
    return {}
  }
  return {
    background: 'var(--color-opacity-10)'
  }
})

const fetchGameStatistics = async () => {
  const itemCode = currentItemCode.value
  const platformCode = currentPlatformCode.value
  if (!itemCode || !platformCode) {
    statistics.value = emptyStatistics()
    return
  }

  isLoading.value = true
  try {
    const res = await Api.game.getGameStatistics(
      {
        itemCode,
        platformCode
      },
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )

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
    await Api.game.refreshGameStatistics(
      {
        itemCode,
        platformCode
      },
      {
        showSuccessToast: false,
        showErrorToast: true
      }
    )
    fetchGameStatistics()
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

.tp-section-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: var(--color-text-level-1);
}

.tp-panel-h5.tp-panel-surface {
  background: var(--color-background-level-2);
}

.tp-panel-h5 .tp-popup-title {
  color: var(--color-text-level-1);
}

.tp-panel-h5 .tp-close-btn {
  background: var(--color-opacity-10);
}

.tp-panel-h5 .tp-close-icon {
  stroke: var(--color-text-level-1);
}

.tp-panel-h5 .tp-stats-shell {
  background: var(--color-background-level-3);
}

.tp-panel-h5 .tp-divider {
  border-color: var(--color-opacity-30);
}

.tp-divider-line {
  width: 100%;
  height: 1px;
  background: var(--color-opacity-30);
}

.tp-panel-h5 .tp-stats-grid {
  background: var(--color-background-level-1);
}

.tp-panel-h5 .tp-col-divider {
  border-color: var(--color-opacity-30);
}

.tp-panel-h5 .tp-label {
  color: var(--color-text-level-2);
}

.tp-panel-h5 .tp-value {
  color: var(--color-text-level-1);
  font-weight: 600;
}

.tp-panel-h5 .tp-refresh-icon {
  stroke: var(--color-text-level-2);
}

:global(:root.light) .tp-panel-h5.tp-panel-surface {
  background: #f4f4f4;
  border: none;
}

:global(:root.light) .tp-panel-h5 .tp-popup-title {
  color: #161a1f;
}

:global(:root.light) .tp-panel-h5 .tp-close-btn {
  background: #d5dbe1;
}

:global(:root.light) .tp-panel-h5 .tp-close-icon {
  stroke: #6d7580;
}

:global(:root.light) .tp-panel-h5 .tp-stats-shell {
  background: #fff;
  border: none;
}

:global(:root.light) .tp-panel-h5 .tp-divider {
  border-color: #e5e5e5;
}

:global(:root.light) .tp-panel-h5 .tp-divider-line {
  background: #d9d9d9;
}

:global(:root.light) .tp-panel-h5 .tp-stats-grid {
  background: #f0f0f0;
  border: none;
}

:global(:root.light) .tp-panel-h5 .tp-col-divider {
  border-color: #d9d9d9;
}

:global(:root.light) .tp-panel-h5 .tp-section-title {
  color: #0f0f0f;
  font-weight: 700;
}

:global(:root.light) .tp-panel-h5 .tp-label {
  color: #6a727a;
}

:global(:root.light) .tp-panel-h5 .tp-value {
  color: #0f0f0f;
  font-weight: 600;
}

:global(:root.light) .tp-panel-h5 .tp-refresh-icon {
  stroke: #99a1aa;
}

.tp-panel-desktop.tp-panel-surface {
  background: var(--color-background-level-2);
}

.tp-panel-desktop .tp-stats-shell {
  background: var(--color-background-level-3);
}

.tp-panel-desktop .tp-stats-grid {
  background: var(--color-background-level-1);
}

.tp-panel-desktop .tp-divider,
.tp-panel-desktop .tp-col-divider {
  border-color: var(--color-opacity-30);
}

.tp-panel-desktop .tp-popup-title {
  color: var(--color-text-level-1);
}

.tp-panel-desktop .tp-close-btn {
  background: var(--color-opacity-10);
}

.tp-panel-desktop .tp-close-icon {
  stroke: var(--color-text-level-1);
}

.tp-panel-desktop .tp-label {
  color: var(--color-text-level-2);
}

.tp-panel-desktop .tp-value {
  color: var(--color-text-level-1);
}

.tp-panel-desktop .tp-refresh-icon {
  stroke: currentColor;
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
