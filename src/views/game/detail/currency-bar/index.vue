<template>
  <div class="bg-[var(--color-background-level-6)] p-[12px] rounded-b-[10px] relative">
    <div class="flex justify-between items-center">
      <img alt="" class="size-[16px]" :src="LineIcon" @click="liveStateVisibleClick" />
      <div class="flex justify-end items-center gap-[10px]">
        <img
          alt=""
          class="size-[16px]"
          :src="starActived ? StarActiveIcon : StarIcon"
          @click="toggleStar"
        />
        <img
          alt=""
          class="size-[16px]"
          :src="loveActived ? LoveActiveIcon : LoveIcon"
          @click="toggleLove"
        />
        <img alt="" class="size-[16px]" :src="TgIcon" @click="shareVisibleClick" />
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
import { ref } from 'vue'
import LiveStatePopup from './live-state-popup.vue'
import SharePopup from './share-popup.vue'
import { useIsMobile } from '@/composables/useMediaQuery'

const isMobile = useIsMobile()

const starActived = ref(false)
const loveActived = ref(false)

const liveStateVisible = ref(false)
const shareVisible = ref(false)

const toggleStar = () => {
  starActived.value = !starActived.value
}

const toggleLove = () => {
  loveActived.value = !loveActived.value
}

const liveStateVisibleClick = () => {
  liveStateVisible.value = true
}

const shareVisibleClick = () => {
  shareVisible.value = true
}
</script>
<style lang="scss" scoped>
.desktop-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 100%;
}
</style>
