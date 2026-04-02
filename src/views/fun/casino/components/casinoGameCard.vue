<template>
  <a
    href="javascript:void(0);"
    class="game-item group relative flex h-full w-full flex-col items-center overflow-hidden rounded-lg transition-transform duration-200 ease-out sm:hover:-translate-y-2 active:translate-y-0 inactive"
    @click="$emit('click')"
  >
    <gameErrImg class="h-full w-full" alt="Crash" :img="gameImage" />
    <div
      class="absolute inset-x-0 bottom-6 flex w-full items-center justify-center px-2 text-center text-sm sm:text-base font-bold leading-4 text-common-100 sm:font-extrabold"
    >
      {{ game.itemName }}
    </div>
    <div class="absolute bottom-1 right-1 flex h-5 items-center rounded-md bg-mask-20 px-1.5">
      <div class="icon size-2.5 sm:size-4 text-common-100">
        <component :is="casinoIcons.player_count" class="size-2.5 sm:size-4 fill-current" />
      </div>
      <span class="text-[10px] sm:text-xs font-medium sm:font-semibold text-common-100">{{
        initNum
      }}</span>
    </div>
    <div
      class="absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center bg-mask-60-1 opacity-0 sm:group-hover:opacity-100"
    >
      <div
        class="absolute inset-x-0 top-0 flex h-2/5 w-full items-center justify-center px-2 text-center text-base font-bold leading-4 text-common-100 sm:font-extrabold"
      >
        {{ game.itemName }}
      </div>
      <div
        class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-all duration-300 sm:group-hover:scale-150"
      >
        <div class="icon size-full fill-common-100">
          <component :is="casinoIcons.play_fill" class="size-full fill-current" />
        </div>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { casinoIcons } from '@/static/svg/casino'
import { StringExtension } from '@/utils/string-extension'
import type { GameDataItem } from '@/api/interface/game'
import gameErrImg from '@/components/common/gameErrImg.vue'

const props = defineProps<{
  game: GameDataItem
}>()

defineEmits<{
  click: []
}>()

const gameImage = computed(() => {
  const imagePath = props.game.conUrl || props.game.icon1 || props.game.icon2 || props.game.icon3
  const src = imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''

  return {
    maintain: false,
    src: String(src)
  }
})

const initNum = computed(() => {
  return StringExtension.getRandomInt(props.game.initScoreNum ?? 0, props.game.initScoreStar ?? 0)
})
</script>
