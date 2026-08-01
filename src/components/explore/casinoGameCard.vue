<template>
  <a
    href="javascript:void(0);"
    class="game-item group relative block h-full w-full overflow-hidden rounded-lg transition-transform duration-200 ease-out transform-gpu active:translate-y-0 inactive"
    :class="{ 'sm:hover:-translate-y-2': hoverLift }"
    @click="doClick"
  >
    <gameRemoteImg
      class="absolute inset-0 size-full !rounded-none !bg-transparent [&_.game-remote-img]:size-full [&_.game-remote-img]:scale-[1.02]"
      :img="gameImage"
      :alt="game.itemName"
    />
    <div
      v-if="gameCovernameShow"
      class="absolute inset-x-0 bottom-2 flex w-full flex-col items-center justify-center px-2 text-center font-impact-infoma-ultra transition-opacity sm:group-hover:opacity-0"
    >
      <GameCoverNameText :name="game.itemName ?? ''" />
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
      <div class="icon mr-0.5 h-[16px] w-[16px] text-white">
        <svg
          class="h-[16px] w-[16px]"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style="color: #fff; fill: #fff"
        >
          <path
            fill="#fff"
            d="M26.1137 20.6693C26.6674 23.8341 24.4618 26.132 21.3885 26.6484C18.4196 27.1469 13.5818 27.1469 10.6138 26.6484C7.5397 26.132 5.3341 23.8349 5.88853 20.6702C6.35798 17.9846 8.63481 16.3107 11.4143 16.4548C13.4451 16.56 14.6923 16.8239 16.1371 16.8239C17.5981 16.8239 18.5718 16.5592 20.588 16.4548C23.3674 16.3091 25.6443 17.9838 26.1137 20.6693ZM16.1007 4.66211C19.021 4.66211 21.3885 7.02959 21.3885 9.9499C21.3885 12.8702 19.021 15.2377 16.1007 15.2377C13.1804 15.2377 10.8121 12.8694 10.8121 9.9499C10.8121 7.0304 13.1796 4.66211 16.1007 4.66211Z"
          />
        </svg>
      </div>
      <span class="text-[10px] font-medium text-white">{{ initNum }}</span>
    </div>
    <div
      v-if="game.serviceStatus === 0"
      class="absolute inset-0 z-[2] flex cursor-pointer items-center justify-center rounded-lg bg-mask-60-1 opacity-0 sm:group-hover:opacity-100"
    >
      <div
        v-if="gameCovernameShow"
        class="absolute inset-x-0 top-0 flex w-full items-start justify-center px-2 pt-2 text-center font-impact-infoma-ultra"
      >
        <GameCoverNameText :name="game.itemName ?? ''" />
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
      class="absolute inset-0 z-[2] flex cursor-pointer items-center justify-center rounded-lg bg-mask-60-1"
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
import GameCoverNameText from '@/components/common/GameCoverNameText.vue'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useGameStore } from '@/stores/game'
import underMaintenanceIcon from '@/static/svg/game/under_maintenance.svg'

const props = withDefaults(
  defineProps<{
    game: GameDataItem
    hoverLift?: boolean
  }>(),
  {
    hoverLift: true
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
  if (props.game.serviceStatus === 1) {
    return
  }

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
