<template>
  <div class="bg-[var(--color-background-level-6)] px-[20px] py-[12px] rounded-b-[20px] relative">
    <div class="flex justify-start items-center gap-[10px]">
      <img
        alt=""
        class="size-[24px] cursor-pointer"
        :src="SettingIcon"
        @click="settingVisibleClick"
      />
      <div class="flex items-center gap-[10px] cursor-pointer">
        <img
          alt=""
          class="size-[16px] cursor-pointer"
          :src="starActived ? StarActiveIcon : StarIcon"
          @click="toggleStar"
        />
        <img
          alt=""
          class="size-[16px] cursor-pointer"
          :src="LineIcon"
          @click="liveStateVisibleClick"
        />
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
import { ref } from 'vue'
import LiveStatePopup from './live-state-popup.vue'
import SharePopup from './share-popup.vue'
import SettingPopup from './setting-popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

const isMobile = useIsMobile()

const { isFavorite: starActived, toggleFavorite: toggleStar } = useGameFavorite()

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
.desktop-popup {
  bottom: 100%;
  position: absolute;
  left: 20px;
}
</style>
