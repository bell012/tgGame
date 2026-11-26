<template>
  <div class="mx-0.5">
    <div class="flex items-stretch gap-[10px]">
      <div
        class="relative aspect-[84/111] w-[24.2075%] shrink-0 self-start overflow-hidden rounded-md bg-bg-2 flex items-center justify-center"
      >
        <img
          :src="displayGameImg"
          alt=""
          :class="
            isFallbackImage
              ? 'w-[31px] h-[31px] object-contain opacity-85'
              : 'h-full w-full object-cover'
          "
        />
        <div
          v-if="gameCovernameShow && !isFallbackImage"
          class="absolute inset-x-0 bottom-2 z-[2] flex w-full flex-col items-center justify-center px-2 text-center font-impact-infoma-ultra"
        >
          <GameCoverNameText :name="displayGameName" />
          <div v-if="platformLogoImg.src" class="mt-1 h-[14px] w-auto max-w-[70%] bg-transparent">
            <gameRemoteImg
              :img="platformLogoImg"
              :alt="displayProviderName"
              class="h-full w-full bg-transparent"
            />
          </div>
        </div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col justify-between min-[375px]:py-2">
        <div class="flex items-start gap-1">
          <div class="min-w-0 flex-1">
            <h1
              class="line-clamp-2 break-words text-[15px] font-bold leading-[18px] text-text-1"
              :title="displayGameName"
            >
              {{ displayGameName }}
            </h1>
            <span
              class="mt-[5px] inline-block max-w-full truncate rounded bg-bg-2 px-[5px] py-[2px] align-top text-[11px] font-normal leading-[13.33px] text-text-3"
              :title="displayProviderName"
              >{{ displayProviderName }}</span
            >
          </div>
          <GameDetailActions
            mobile
            :count="collectionsCount"
            :is-favorite="isFavorite"
            :is-updating="isUpdating"
            @toggle-favorite="toggleFavorite"
          />
        </div>
        <GameDetailStats
          mobile
          :rtp="rtp"
          :volatility="currentGameDetail?.volatility"
          :max-multiple="currentGameDetail?.maxMultiple"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import '@/views/game/detail/styles/colors.css'
import errorImg from '@/static/img/home/errimg.png'
import errorImg1 from '@/static/img/home/errimg1.png'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import GameCoverNameText from '@/components/common/GameCoverNameText.vue'
import GameDetailActions from '../../common/GameDetailActions.vue'
import GameDetailStats from '../../common/GameDetailStats.vue'
import { computed, inject, onMounted, reactive, ref, watch, type Ref, type ComputedRef } from 'vue'
import { useGameFavorite } from '@/composables/useGameFavorite'
import type { GameDetailForPlatformPlay } from '@/composables/useGamePlatformPlay'
import { useGameStore } from '@/stores/game'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { resolveGameImageUrl } from '@/utils/image'
import { storeToRefs } from 'pinia'

const currentGameDetail = inject<ComputedRef<GameDetailForPlatformPlay>>(
  'game-detail-current-game',
  computed(() => null)
)
const { isFavorite, isUpdating, toggleFavorite } = useGameFavorite()
const collectionsCount = inject<Ref<number | null>>('game-detail-collections-count', ref(null))
const rtp = inject<Ref<number | null>>('game-detail-rtp', ref(null))
const gameStore = useGameStore()
const siteConfigStore = useSiteConfigStore()
const themeStore = useThemeStore()
const userStore = useUserStore()
const { theme } = storeToRefs(themeStore)
const toImageUrl = (value: string) => {
  const imagePath = value.trim()
  if (!imagePath) return ''
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }
  return resolveGameImageUrl(imagePath)
}

const rawGameImage = computed(() => {
  // 详情页仅使用真实游戏图，后端 defaultImage 视为占位图，不在此处使用
  const rawImage = currentGameDetail.value?.icon2 ?? currentGameDetail.value?.conUrl ?? ''
  return toImageUrl(String(rawImage))
})

const placeholderIcon = computed(() => (theme.value === 'dark' ? errorImg : errorImg1))
const isFallbackImage = computed(() => !rawGameImage.value)
const displayGameImg = computed(() => rawGameImage.value || placeholderIcon.value)
const displayGameName = computed(() => {
  return String(currentGameDetail.value?.itemName ?? '').trim() || '--'
})
const displayGameType = computed(() => {
  const typeName = String(
    (currentGameDetail.value as { sysGameTypeName?: string } | null)?.sysGameTypeName ?? ''
  ).trim()
  const platformName = String(currentGameDetail.value?.platformName ?? '').trim()
  return typeName || platformName || '--'
})
const displayProviderName = computed(() => {
  const providerName = String(currentGameDetail.value?.platformName ?? '').trim()
  return providerName || displayGameType.value
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
  const platformCode = String(currentGameDetail.value?.platformCode ?? '').trim()
  if (!platformCode) {
    platformLogoImg.src = ''
    return
  }

  const src = await gameStore.getPlatformLogoByPlatformCode(platformCode)
  if (platformCode === String(currentGameDetail.value?.platformCode ?? '').trim()) {
    platformLogoImg.src = src
  }
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

onMounted(() => {
  userStore.syncStoredUserData()
  void resolvePlatformLogo()
})

watch(
  () => currentGameDetail.value?.platformCode,
  () => {
    void resolvePlatformLogo()
  }
)
</script>
