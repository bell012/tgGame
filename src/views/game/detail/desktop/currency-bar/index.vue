<template>
  <div class="currency-toolbar px-[20px] py-[12px] rounded-b-[20px] relative">
    <div class="toolbar-actions flex justify-start items-center gap-[12px]">
      <div class="toolbar-icon-wrap">
        <button type="button" class="toolbar-icon-btn" @click="settingVisibleClick">
          <SettingIcon class="toolbar-icon toolbar-icon--setting" />
        </button>
        <span class="toolbar-tooltip">{{ t('gameDetail.settingTooltip') }}</span>
      </div>
      <div class="toolbar-icon-wrap">
        <button
          type="button"
          class="toolbar-icon-btn"
          :class="{ 'is-active': starActived }"
          @click="toggleStar"
        >
          <StarActiveIcon v-if="starActived" class="toolbar-icon toolbar-icon--active" />
          <StarIcon v-else class="toolbar-icon" />
        </button>
        <span class="toolbar-tooltip">{{ t('gameDetail.favoriteTooltip') }}</span>
      </div>
      <div class="toolbar-icon-wrap">
        <button type="button" class="toolbar-icon-btn" @click="liveStateVisibleClick">
          <LineIcon class="toolbar-icon" />
        </button>
        <span class="toolbar-tooltip">{{ t('gameDetail.liveStatsTitle') }}</span>
      </div>
    </div>
    <!--Setting Popup-->
    <setting-popup
      v-model:visible="settingVisible"
      desktop
      class="desktop-setting-popup min-w-[136px]"
      @share="shareClick"
    ></setting-popup>
    <!-- live-state -->
    <Teleport to="body" v-if="isMobile">
      <live-state-popup v-model:visible="liveStateVisible" />
    </Teleport>
    <live-state-popup
      v-else
      class="desktop-live-popup w-[320px]"
      v-model:visible="liveStateVisible"
      desktop
    />
    <!-- 分享-->
    <Teleport to="body" v-if="isMobile">
      <share-popup v-model:visible="shareVisible" />
    </Teleport>
    <share-popup v-else class="desktop-popup w-[480px]" v-model:visible="shareVisible" desktop />
  </div>
</template>
<script setup lang="ts">
import SettingIcon from '@/static/svg/game/detail/setting.svg?component'
import LineIcon from '@/static/svg/game/detail/lines.svg?component'
import StarIcon from '@/static/svg/game/detail/star.svg?component'
import StarActiveIcon from '@/static/svg/game/detail/star_active.svg?component'
import { useGameFavorite } from '@/composables/useGameFavorite'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { ref } from 'vue'
import LiveStatePopup from './live-state-popup.vue'
import SharePopup from './share-popup.vue'
import SettingPopup from './setting-popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useI18n } from 'vue-i18n'

const isMobile = useIsMobile()
const { t } = useI18n()

const { requireLogin } = useRequireLoginAction()

const { isFavorite: starActived, toggleFavorite: toggleStar } = useGameFavorite()

const settingVisible = ref(false)
const liveStateVisible = ref(false)
const shareVisible = ref(false)

const settingVisibleClick = () => {
  settingVisible.value = true
}

const liveStateVisibleClick = () => {
  if (!requireLogin()) {
    return
  }
  liveStateVisible.value = true
}

const shareClick = () => {
  if (!requireLogin()) {
    return
  }
  shareVisible.value = true
}
</script>
<style lang="scss" scoped>
.currency-toolbar {
  background: var(--color-background-level-5);
  border-top: 1px solid var(--color-opacity-10);
}

.toolbar-actions {
  min-height: 16px;
}

.toolbar-icon-wrap {
  position: relative;
  display: inline-flex;
}

.toolbar-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  z-index: 2;
  display: none;
  height: 32px;
  align-items: center;
  padding: 0 12px;
  border-radius: 8px;
  background: var(--color-background-level-2);
  color: var(--color-text-level-1);
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  transform: translateX(-50%);
}

.toolbar-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  width: 0;
  height: 0;
  border-top: 6px solid var(--color-background-level-2);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  transform: translateX(-50%);
}

.toolbar-icon-btn {
  border: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  box-shadow: none;
  transition: opacity 0.2s ease;
}

.toolbar-icon-btn:hover {
  opacity: 0.85;
}

.toolbar-icon-btn:active {
  opacity: 0.7;
}

.toolbar-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-level-2);
}

.toolbar-icon :deep(path),
.toolbar-icon :deep(circle),
.toolbar-icon :deep(rect) {
  fill: currentColor;
}

.toolbar-icon--setting {
  width: 18px;
  height: 18px;
}

.toolbar-icon--active :deep(path) {
  fill: var(--color-secondary-level-7);
}

:global(:root.light) .currency-toolbar {
  background: var(--color-opacity-10);
  border-top-color: var(--color-opacity-6);
}

:global(:root.light) .toolbar-tooltip {
  background: var(--color-background-level-2);
  box-shadow: 0 8px 24px rgba(28, 45, 74, 0.12);
}

:global(:root.light) .toolbar-tooltip::after {
  border-top-color: var(--color-background-level-2);
}

@media (min-width: 768px) {
  .toolbar-icon-wrap:hover .toolbar-tooltip,
  .toolbar-icon-wrap:focus-within .toolbar-tooltip {
    display: inline-flex;
  }
}

.desktop-popup {
  bottom: calc(100% + 12px);
  position: absolute;
  left: calc(50% - 240px);
}

.desktop-live-popup {
  bottom: calc(100% + 12px);
  position: absolute;
  left: 20px;
}

.desktop-setting-popup {
  bottom: calc(100% + 12px);
  position: absolute;
  left: 20px;
}
</style>
