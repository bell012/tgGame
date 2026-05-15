<template>
  <div>
    <div v-if="isMobile" class="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-bg-1">
      <H5Header :title="t('menu.recently-played')" />
      <div
        ref="mobileScrollRef"
        class="casino-fullpage-scroll-y flex-1 min-h-0 overflow-y-auto px-[14px] pt-2.5 pb-4"
      >
        <div
          v-if="isPlayedLoading && playedGames.length === 0"
          class="grid w-full grid-cols-3 gap-2.5"
        >
          <div
            v-for="index in 27"
            :key="`recent-loading-mobile-${index}`"
            class="aspect-[330/438] animate-pulse rounded-lg bg-bg-2"
          />
        </div>
        <div v-else-if="playedGames.length > 0" class="grid w-full grid-cols-3 gap-2.5">
          <div
            v-for="(game, index) in playedGames"
            :key="game.rowId ?? index"
            class="aspect-[330/438]"
          >
            <casinoGameCard :game="game" @click="handleClick(game.rowId)" />
          </div>
        </div>
        <ThemedEmptyState
          v-else
          :dark-image="defaultImgDark"
          :light-image="defaultImgLight"
          :message="t('search.stay')"
          container-class="mt-[17px]"
          image-class="w-[220px] h-[200px] object-contain mb-2.5"
          text-class="text-xs text-center text-text-1"
        />
      </div>
    </div>

    <div v-else class="w-full p-4">
      <div class="mb-4 flex items-center gap-3">
        <button
          type="button"
          class="flex size-[33px] items-center justify-center rounded-md bg-opacity-5"
          @click="handleBack"
        >
          <ArrowLeftIcon class="h-3.5 w-3.5 text-text-1" />
        </button>
        <h1 class="font-inter text-2xl font-extrabold text-text-1">
          {{ t('menu.recently-played') }}
        </h1>
      </div>

      <div
        v-if="isPlayedLoading && playedGames.length === 0"
        class="grid w-full grid-cols-8 gap-2.5"
      >
        <div
          v-for="index in 32"
          :key="`recent-loading-pc-${index}`"
          class="aspect-[330/438] animate-pulse rounded-lg bg-bg-2"
        />
      </div>
      <div v-else-if="playedGames.length > 0" class="grid w-full grid-cols-8 gap-2.5">
        <div
          v-for="(game, index) in playedGames"
          :key="game.rowId ?? index"
          class="aspect-[330/438]"
        >
          <casinoGameCard :game="game" @click="handleClick(game.rowId)" />
        </div>
      </div>
      <ThemedEmptyState
        v-else
        :dark-image="defaultImgDark"
        :light-image="defaultImgLight"
        :message="t('search.stay')"
        container-class="mt-[17px]"
        image-class="w-[220px] h-[200px] object-contain mb-2.5"
        text-class="text-xs text-center text-text-1"
      />
      <CommonFooter class="mt-[40px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { GameDataItem } from '@/api/interface/game'
import H5Header from '@/components/common/H5Header.vue'
import CommonFooter from '@/components/commonFooter.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useGameStore } from '@/stores/game'
import { navigateToName } from '@/utils/router'
import { readPlayedRowIdsFromStorage } from '@/utils/played-games-cache'
import ArrowLeftIcon from '@/static/svg/arrow_left.svg?component'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import casinoGameCard from '../components/casinoGameCard.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const mobileScrollRef = ref<HTMLElement | null>(null)

const gameStore = useGameStore()
const playedGames = ref<GameDataItem[]>([])
const isPlayedLoading = ref(false)

const loadPlayedGames = async () => {
  isPlayedLoading.value = true
  try {
    const rowIds = readPlayedRowIdsFromStorage()
    playedGames.value = await gameStore.hydratePlayedRowIds(rowIds)
  } catch {
    playedGames.value = []
  } finally {
    isPlayedLoading.value = false
  }
}

const handleClick = (rowId?: number | string) => {
  if (!rowId) return
  navigateToName('gameDetail', { params: { rowId } })
}

const handleBack = () => {
  router.back()
}

const scrollPageToTop = () => {
  nextTick(() => {
    mobileScrollRef.value?.scrollTo({
      top: 0,
      behavior: 'auto'
    })

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    })
  })
}

onMounted(async () => {
  await loadPlayedGames()
  scrollPageToTop()
})

watch(
  () => route.fullPath,
  () => {
    void loadPlayedGames()
    scrollPageToTop()
  }
)
</script>

<style scoped lang="scss">
.casino-fullpage-scroll-y {
  scrollbar-width: thin;
  scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track);
}

.casino-fullpage-scroll-y::-webkit-scrollbar {
  display: block !important;
  width: 4px;
  height: 4px;
}

.casino-fullpage-scroll-y::-webkit-scrollbar-track {
  background-color: var(--color-scrollbar-track);
}

.casino-fullpage-scroll-y::-webkit-scrollbar-thumb {
  background-color: var(--color-scrollbar-thumb);
  border-radius: 4px;

  &:hover {
    background-color: var(--color-scrollbar-thumb-hover);
  }
}
</style>
