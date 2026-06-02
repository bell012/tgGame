<template>
  <div class="currency-toolbar p-[12px] rounded-b-[10px] relative">
    <div class="flex justify-between items-center">
      <button type="button" class="icon-trigger" @click="liveStateVisibleClick">
        <LineIcon class="toolbar-icon" />
      </button>
      <div class="flex justify-end items-center gap-[14px] cursor-pointer">
        <button type="button" class="icon-trigger" @click="toggleStar">
          <SmartImage v-if="starActived" alt="" class="size-[16px]" :src="StarActiveIcon" />
          <StarIcon v-else class="toolbar-icon" />
        </button>
        <button type="button" class="icon-trigger" @click="toggleLove">
          <SmartImage v-if="loveActived" alt="" class="size-[16px]" :src="LoveActiveIcon" />
          <LoveIcon v-else class="toolbar-icon" />
        </button>
        <button type="button" class="icon-trigger" @click="shareVisibleClick">
          <TgIcon class="toolbar-icon" />
        </button>
      </div>
    </div>
    <Teleport to="body" v-if="isMobile">
      <live-state-popup v-model:visible="liveStateVisible" />
    </Teleport>
    <live-state-popup v-else class="desktop-popup" v-model:visible="liveStateVisible" desktop />

    <Teleport to="body" v-if="isMobile">
      <share-popup v-model:visible="shareVisible" />
    </Teleport>
    <share-popup v-else class="desktop-popup" v-model:visible="shareVisible" desktop />
  </div>
</template>
<script setup lang="ts">
import LineIcon from '@/static/svg/game/detail/lines.svg?component'
import StarIcon from '@/static/svg/game/detail/star.svg?component'
import LoveIcon from '@/static/svg/game/detail/love.svg?component'
import TgIcon from '@/static/svg/game/detail/tg.svg?component'
import StarActiveIcon from '@/static/svg/game/detail/star_active.svg?url'
import LoveActiveIcon from '@/static/svg/game/detail/love_active.svg?url'
import { useGameFavorite } from '@/composables/useGameFavorite'
import { useGameLike } from '@/composables/useGameLike'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { ref } from 'vue'
import LiveStatePopup from './live-state-popup.vue'
import SharePopup from './share-popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import SmartImage from '@/components/common/SmartImage.vue'

const isMobile = useIsMobile()
const { requireLogin } = useRequireLoginAction()

const { isFavorite: starActived, toggleFavorite: toggleStar } = useGameFavorite()
const { isLiked: loveActived, toggleLike: toggleLove } = useGameLike()

const liveStateVisible = ref(false)
const shareVisible = ref(false)

const liveStateVisibleClick = () => {
  if (!requireLogin()) {
    return
  }
  liveStateVisible.value = true
}

const shareVisibleClick = () => {
  if (!requireLogin()) {
    return
  }
  shareVisible.value = true
}
</script>
<style lang="scss" scoped>
.currency-toolbar {
  background: var(--color-mask-20);
  border-top: 0.33px solid var(--color-opacity-10);
}

:global(:root:not(.light)) .currency-toolbar {
  background: #282c2d;
}

.icon-trigger {
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.toolbar-icon {
  width: 16px;
  height: 16px;
  color: var(--color-icon-level-2);
  fill: currentColor;
  stroke: currentColor;
}

.toolbar-icon :deep(path),
.toolbar-icon :deep(circle),
.toolbar-icon :deep(rect) {
  fill: currentColor;
  stroke: currentColor;
}

.desktop-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 100%;
}
</style>
