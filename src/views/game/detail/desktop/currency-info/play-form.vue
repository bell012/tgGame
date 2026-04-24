<template>
  <div class="currency-info-container">
    <div class="play-form">
      <div class="form-row">
        <div class="form-label">{{ t('gameDetail.playWithSelectedCurrency') }}</div>
        <div class="form-control">
          <currency-select class="w-full"></currency-select>
        </div>
      </div>
    </div>
    <div class="play-now-hint text-center text-[12px] mt-[14px]">
      {{ t('gameDetail.playNowHint') }}
    </div>
    <button type="button" class="play-btn w-full mt-[14px] cursor-pointer" @click="gamePlay">
      <div class="w-[16px] h-[16px]">
        <play-icon class="w-full h-full" />
      </div>
      <div class="text-[15px] font-bold text-[#000]">{{ t('gameDetail.playNow') }}</div>
    </button>
  </div>
</template>
<script setup lang="ts">
import PlayIcon from '@/static/svg/game/detail/play.svg'
import CurrencySelect from '../currency-select/index.vue'
import { useGamePlatformPlay } from '@/composables/useGamePlatformPlay'
import { useI18n } from 'vue-i18n'

const { gamePlay } = useGamePlatformPlay()
const { t } = useI18n()
</script>
<style scoped lang="scss">
.currency-info-container {
  width: 408px;
}

.desc-text {
  line-height: 16px;
}

.play-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-label {
  flex: 0 0 auto;
  width: 132px;
  white-space: nowrap;
  color: var(--color-text-level-1);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.form-control {
  flex: 1;
  min-width: 0;
  height: 36px;
  border-radius: 8px;
  background: var(--color-background-level-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-level-1);
}

.currency-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  white-space: nowrap;
}

.currency-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #49f7a5, #0fd46d 70%);
  box-shadow: 0 0 6px rgba(35, 238, 136, 0.4);
}

.small-btn {
  height: 26px;
  border-radius: 4px;
  border: 1px solid var(--color-theme-level-1);
  color: var(--color-theme-level-1);
  font-size: 14px;
  line-height: 1;
  background: transparent;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.plus-icon {
  font-size: 16px;
  line-height: 1;
}

.amount-control {
  padding: 0 8px 0 10px;
}

.amount-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.amount-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(35, 238, 136, 0.18);
  color: var(--color-theme-level-1);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.amount-actions {
  display: flex;
  align-items: center;
  height: 100%;
  border-left: 1px solid var(--color-opacity-15);
  padding-left: 8px;
  gap: 2px;
}

.amount-action {
  min-width: 36px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-level-1);
  font-size: 13px;
  cursor: pointer;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

.slider-panel {
  flex: 1;
  height: 46px;
  border-radius: 8px;
  background: var(--color-background-level-2);
  padding: 6px 10px 8px;
  display: flex;
  align-items: center;
}

.slider-head {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.slider-limit {
  font-size: 12px;
  line-height: 1;
  font-weight: 600;
  color: var(--color-text-level-1);
}

.slider-center-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--color-theme-level-1);
}

.amount-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--color-theme-level-1) 0%,
    var(--color-theme-level-1) var(--slider-percent, 35%),
    var(--color-opacity-15) var(--slider-percent, 35%),
    var(--color-opacity-15) 100%
  );
  outline: none;
}

.amount-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--color-theme-level-1);
  background: var(--color-background-level-1);
  cursor: pointer;
}

.amount-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--color-theme-level-1);
  background: var(--color-background-level-1);
  cursor: pointer;
}

.amount-slider::-moz-range-track {
  height: 4px;
  border-radius: 999px;
  background: var(--color-opacity-15);
}

.play-btn {
  border-radius: 8px;
  background: linear-gradient(90deg, #24ee89 0%, #9fe871 100%);
  box-shadow:
    0 0 12px 0 rgba(35, 238, 136, 0.3),
    0 -2px 0 0 #1dca6a inset;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border: none;
}

.play-now-hint {
  color: var(--color-text-level-2);
  line-height: 16px;
}

:global(:root.light) .currency-info-container .form-label {
  color: #1c2838;
}

:global(:root.light) .currency-info-container .form-control {
  background: #fff;
  border: none;
  box-shadow:
    0 3px 10px rgba(26, 40, 64, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

:global(:root.light) .currency-info-container .play-now-hint {
  color: #4f5f76;
}
</style>
