<template>
  <div class="w-full h-full p-[12px] bg-[var(--color-background-level-3)] rounded-t-[10px]">
    <div class="flex gap-[10px]">
      <div class="w-[110px] h-[146px]">
        <img :src="displayGameImg" alt="" class="w-full h-full object-contain rounded-md" />
      </div>
      <div class="flex-1 flex flex-col justify-between">
        <div class="flex-1 flex flex-col justify-around">
          <div class="text-[15px] font-bold">Play with selected currency</div>
          <currency-select></currency-select>
          <div class="text-[13px] text-[var(--color-text-level-2)] text-center">
            Tap "Play Now" to enter. Good luck and have fun!
          </div>
        </div>

        <div class="play-btn">
          <div class="w-[16px] h-[16px]">
            <play-icon class="w-full h-full" />
          </div>
          <div class="text-[15px] font-bold text-[#000]">Play Now</div>
        </div>
      </div>
    </div>
  </div>
  <currency-bar></currency-bar>
</template>
<script setup lang="ts">
import defaultGameImg from '@/static/img/explore/game.png'
import PlayIcon from '@/static/svg/game/detail/play.svg'
import CurrencySelect from '../currency-select/index.vue'
import CurrencyBar from '../currency-bar/index.vue'
import { computed, inject, type ComputedRef } from 'vue'

type CurrentGameDetail = {
  itemName?: string
  platformName?: string
  icon2?: string
  conUrl?: string
  gameItemHotVo?: {
    defaultImage?: string
  }
} | null

const currentGameDetail = inject<ComputedRef<CurrentGameDetail>>(
  'game-detail-current-game',
  computed(() => null)
)

const toImageUrl = (value: string) => {
  const imagePath = value.trim()
  if (!imagePath) return ''
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }
  return `${String(import.meta.env.VITE_GAME_IMAGE_BASE_URL ?? '')}${imagePath}`
}

const displayGameImg = computed(() => {
  const rawImage =
    currentGameDetail.value?.icon2 ??
    currentGameDetail.value?.conUrl ??
    currentGameDetail.value?.gameItemHotVo?.defaultImage ??
    ''
  return toImageUrl(String(rawImage)) || defaultGameImg
})
</script>
<style scoped lang="scss">
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
}
</style>
