<template>
  <a
    href="javascript:void(0);"
    class="game-item group relative flex h-full w-full flex-col items-center overflow-hidden rounded-lg transition-transform duration-200 ease-out sm:hover:-translate-y-2 active:translate-y-0 inactive"
    @click="doClick"
  >
    <FavoritesGamesIcon
      v-if="showFavoriteBadge"
      class="pointer-events-none absolute left-2 top-2 z-[1] size-[14px] text-common-100 [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
      aria-hidden="true"
    />
    <gameRemoteImg class="h-full w-full" :img="gameImage" :alt="game.itemName" />
    <div
      v-if="gameCovernameShow"
      class="absolute inset-x-0 bottom-2 flex w-full flex-col items-center justify-center px-2 text-center text-sm sm:text-base font-bold leading-4 text-common-100 sm:font-extrabold"
    >
      {{ game.itemName }}
      <div v-if="platformLogoImg.src" class="mt-1 h-[14px] w-auto max-w-[70%] bg-transparent">
        <gameRemoteImg
          :img="platformLogoImg"
          :alt="game.platformName || game.itemName"
          class="h-full w-full bg-transparent"
        />
      </div>
    </div>
    <div
      class="absolute bottom-1 right-1 flex h-5 w-[33px] items-center rounded-[6px] bg-mask-20 px-1.5"
    >
      <div class="icon mr-0.5 h-[10px] w-[10px] text-common-100 sm:size-4">
        <component
          :is="casinoIcons.player_count"
          class="h-[10px] w-[10px] fill-current sm:size-4 [&_path]:fill-current"
        />
      </div>
      <span class="text-[10px] sm:text-xs font-medium sm:font-semibold text-common-100">{{
        initNum
      }}</span>
    </div>
    <div
      v-if="game.serviceStatus === 0"
      class="absolute left-0 top-0 z-[2] flex h-full w-full cursor-pointer items-center justify-center bg-mask-60-1 opacity-0 sm:group-hover:opacity-100"
    >
      <div
        v-if="gameCovernameShow"
        class="absolute inset-x-0 top-0 flex h-2/5 w-full items-center justify-center px-2 text-center text-base font-bold leading-4 text-common-100 sm:font-extrabold"
      >
        {{ game.itemName }}
      </div>
      <div
        class="flex h-9 w-9 items-center justify-center rounded-full bg-mask-20 transition-all duration-300 sm:group-hover:scale-150"
      >
        <div class="icon size-full text-common-100">
          <component
            :is="casinoIcons.play_fill"
            class="size-full fill-current [&_path]:fill-current"
          />
        </div>
      </div>
    </div>
    <div
      v-if="game.serviceStatus === 1"
      class="absolute left-0 top-0 z-[2] flex h-full w-full cursor-pointer items-center justify-center bg-mask-60-1"
    >
      <underMaintenanceIcon class="h-9 w-9 text-common-100" />
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { casinoIcons } from '@/static/svg/casino'
import { StringExtension } from '@/utils/string-extension'
import type { GameDataItem } from '@/api/interface/game'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useGameStore } from '@/stores/game'
import underMaintenanceIcon from '@/static/svg/game/under_maintenance.svg'
import FavoritesGamesIcon from '@/static/svg/game/favorites_games.svg?component'

const props = withDefaults(
  defineProps<{
    game: GameDataItem
    /** 收藏模块等场景：左上角收藏角标 */
    showFavoriteBadge?: boolean
  }>(),
  {
    showFavoriteBadge: false
  }
)

const emit = defineEmits<{
  click: []
}>()

const siteConfigStore = useSiteConfigStore()
const gameStore = useGameStore()
const gameImage = computed(() => {
  const imagePath = props.game.icon2 || props.game.conUrl || props.game.icon1 || props.game.icon3
  const src = imagePath ? `${import.meta.env.VITE_GAME_IMAGE_BASE_URL}${imagePath}` : ''

  return {
    maintain: false,
    src: String(src)
  }
})

const initNum = computed(() => {
  return StringExtension.getRandomInt(props.game.initScoreNum ?? 0, props.game.initScoreStar ?? 0)
})

const platformLogoImg = reactive<{
  maintain: boolean
  src: string
  fit: 'contain'
}>({
  maintain: false,
  src: '',
  fit: 'contain'
})

const resolvePlatformLogo = async () => {
  const platformCode = String(props.game.platformCode ?? '').trim()
  if (!platformCode) {
    platformLogoImg.src = ''
    return
  }

  platformLogoImg.src = await gameStore.getPlatformLogoByPlatformCode(platformCode)
}

/** | 游戏封面名称显示 | `0` 不显示，`1` 显示 | */
const gameCovernameShow = computed(() => {
  const value = Number(
    (
      siteConfigStore.config as
        | {
            baseSiteConfig?: {
              game_covername_show?: string | number
            }
          }
        | null
        | undefined
    )?.baseSiteConfig?.game_covername_show ?? 0
  )

  return Number.isFinite(value) && value > 0
})

const doClick = () => {
  if (props.game.serviceStatus === 1) return
  emit('click')
}

watch(
  () => props.game.platformCode,
  () => {
    void resolvePlatformLogo()
  }
)

onMounted(() => {
  void resolvePlatformLogo()
})
</script>
