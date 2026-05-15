<template>
  <div
    class="currency-toolbar p-[12px] rounded-b-[10px] relative"
    :class="{ 'currency-toolbar-light': isLightTheme }"
  >
    <div class="flex justify-between items-center">
      <SmartImage
        alt=""
        class="size-[16px] cursor-pointer"
        :src="LineIcon"
        @click="liveStateVisibleClick"
      />
      <div class="flex justify-end items-center gap-[14px] cursor-pointer">
        <SmartImage
          alt=""
          class="size-[16px]"
          :src="starActived ? StarActiveIcon : StarIcon"
          @click="toggleStar"
        />
        <SmartImage
          alt=""
          class="size-[16px]"
          :src="loveActived ? LoveActiveIcon : LoveIcon"
          @click="toggleLove"
        />
        <SmartImage alt="" class="size-[16px]" :src="TgIcon" @click="shareVisibleClick" />
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
import LineIcon from '@/static/svg/game/detail/lines.svg?url'
import StarIcon from '@/static/svg/game/detail/star.svg?url'
import LoveIcon from '@/static/svg/game/detail/love.svg?url'
import TgIcon from '@/static/svg/game/detail/tg.svg?url'
import StarActiveIcon from '@/static/svg/game/detail/star_active.svg?url'
import LoveActiveIcon from '@/static/svg/game/detail/love_active.svg?url'
import { useGameFavorite } from '@/composables/useGameFavorite'
import { useGameLike } from '@/composables/useGameLike'
import { useRequireLoginAction } from '@/composables/useRequireLoginAction'
import { computed, ref } from 'vue'
import LiveStatePopup from './live-state-popup.vue'
import SharePopup from './share-popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import SmartImage from '@/components/common/SmartImage.vue'
import { useThemeStore } from '@/stores/theme'

const isMobile = useIsMobile()
const { requireLogin } = useRequireLoginAction()
const themeStore = useThemeStore()
const isLightTheme = computed(() => themeStore.theme === 'light')

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
  background: var(--color-opacity-10);
  border-top: 1px solid var(--color-opacity-10);
}

.currency-toolbar-light {
  background: var(--color-opacity-10) !important;
  border-top: none;
  box-shadow: none;
}

.desktop-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 100%;
}
</style>
