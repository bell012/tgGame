<template>
  <div
    class="currency-toolbar px-[20px] py-[10px] rounded-b-[20px] relative"
    :class="{ 'currency-toolbar-light': isLightTheme }"
  >
    <div class="toolbar-actions flex justify-start items-center gap-[10px]">
      <div class="toolbar-icon-btn" @click="settingVisibleClick">
        <img alt="" class="toolbar-icon toolbar-icon--setting" :src="SettingIcon" />
      </div>
      <div class="toolbar-icon-btn" :class="{ 'is-active': starActived }" @click="toggleStar">
        <img alt="" class="toolbar-icon" :src="starActived ? StarActiveIcon : StarIcon" />
      </div>
      <div class="toolbar-icon-btn" @click="liveStateVisibleClick">
        <img alt="" class="toolbar-icon" :src="LineIcon" />
      </div>
    </div>
    <!--Setting Popup-->
    <setting-popup
      v-model:visible="settingVisible"
      desktop
      class="desktop-popup"
      @share="shareClick"
    ></setting-popup>
    <!-- live-state -->
    <Teleport to="body" v-if="isMobile">
      <live-state-popup v-model:visible="liveStateVisible" />
    </Teleport>
    <live-state-popup
      v-else
      class="desktop-popup w-[320px]"
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
import SettingIcon from '@/static/svg/game/detail/setting.svg?url'
import LineIcon from '@/static/svg/game/detail/lines.svg?url'
import StarIcon from '@/static/svg/game/detail/star.svg?url'
import StarActiveIcon from '@/static/svg/game/detail/star_active.svg?url'
import { useGameFavorite } from '@/composables/useGameFavorite'
import { useThemeStore } from '@/stores/theme'
import { computed, ref } from 'vue'
import LiveStatePopup from './live-state-popup.vue'
import SharePopup from './share-popup.vue'
import SettingPopup from './setting-popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

const isMobile = useIsMobile()
const themeStore = useThemeStore()

const { isFavorite: starActived, toggleFavorite: toggleStar } = useGameFavorite()
const isLightTheme = computed(() => themeStore.theme === 'light')

const settingVisible = ref(false)
const liveStateVisible = ref(false)
const shareVisible = ref(false)

const settingVisibleClick = () => {
  settingVisible.value = true
}

const liveStateVisibleClick = () => {
  liveStateVisible.value = true
}

const shareClick = () => {
  shareVisible.value = true
}
</script>
<style lang="scss" scoped>
.currency-toolbar {
  background: var(--color-background-level-6);
  border-top: 1px solid var(--color-opacity-10);
}

.toolbar-actions {
  min-height: 28px;
}

.toolbar-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.toolbar-icon-btn:active {
  transform: scale(0.96);
}

.toolbar-icon {
  width: 16px;
  height: 16px;
}

.toolbar-icon--setting {
  width: 18px;
  height: 18px;
}

:global(:root.light) .currency-toolbar {
  background: linear-gradient(180deg, #e9f0fa 0%, #dde7f4 100%) !important;
  border-top-color: rgba(95, 116, 145, 0.26);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 -1px 0 rgba(95, 116, 145, 0.14);
}

:global(:root.light) .currency-toolbar .toolbar-icon-btn {
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(95, 116, 145, 0.18);
  box-shadow:
    0 2px 8px rgba(24, 38, 64, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

:global(:root.light) .currency-toolbar .toolbar-icon-btn:hover {
  background: #fff;
  border-color: rgba(95, 116, 145, 0.32);
}

:global(:root.light) .currency-toolbar .toolbar-icon-btn.is-active {
  background: rgba(35, 207, 116, 0.16);
  border-color: rgba(35, 207, 116, 0.36);
}

.currency-toolbar-light {
  background: linear-gradient(180deg, #e9f0fa 0%, #dde7f4 100%) !important;
  border-top-color: rgba(95, 116, 145, 0.26);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 -1px 0 rgba(95, 116, 145, 0.14);
}

.currency-toolbar-light .toolbar-icon-btn {
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(95, 116, 145, 0.18);
  box-shadow:
    0 2px 8px rgba(24, 38, 64, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.desktop-popup {
  bottom: calc(100% + 6px);
  position: absolute;
  left: 20px;
}
</style>
